const mongoose = require('mongoose');
const session = require('supertest-session');

const Album = require('../models/Album');
const testAlbums = require('./testdata.json');
const app = require('../app');

var testSession = null;

beforeEach(async () => {
  await Album.deleteMany({});
  await Album.create(testAlbums);

  testSession = session(app);
});

describe('after authenticating', function () {

  var authenticatedSession;

  beforeEach(function (done) {
    testSession.post('/login/password')
      .send({ username: 'testadmin', password: 'testadmin66' })
      .expect(302)
      .end(function (err) {
        if (err) return done(err);
        authenticatedSession = testSession;
        return done();
      });
  });

  test('number of albums returned matches with test dataset', async () => {
    const response = await authenticatedSession
      .get('/api/albums')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  
    expect(response.body.data).toHaveLength(testAlbums.length);
  });

  it('new album can be added to the database', async () => {
    const newAlbum = {
      'artist': 'Bob Marley',
      'title': 'Rastaman Vibration',
      'year': 1976,
      'genre': 'Reggae',
      'tracks': 10
    };
  
    const createResponse = await authenticatedSession
      .post('/api/albums')
      .send(newAlbum)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  
    expect(createResponse.body.data).toEqual(expect.objectContaining(newAlbum));
  
    const response = await authenticatedSession.get('/api/albums');
    expect(response.body.data).toHaveLength(testAlbums.length + 1);
  });

  test('album can be deleted from the database', async () => {
    const albumData = await authenticatedSession.get('/api/albums');
    const deletedAlbum = albumData.body.data[0];
  
    const deleteResponse = await authenticatedSession
      .delete(`/api/albums/${deletedAlbum._id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  
    expect(deleteResponse.body.data).toEqual(deletedAlbum);
  
    const response = await authenticatedSession.get('/api/albums');
    expect(response.body.data).toHaveLength(testAlbums.length - 1);
    expect(response.body.data).not.toContainEqual(deletedAlbum);
  });
  
  test('API can handle a request to delete non-existent album', async () => {
    const idNotFound =  '65f02cd94baab861f7404404';
    const idWrongFormat = 'w';
  
    await authenticatedSession
      .delete(`/api/albums/${idNotFound}`)
      .expect(404)
      .expect('Content-Type', /application\/json/);
  
    await authenticatedSession
      .delete(`/api/albums/${idWrongFormat}`)
      .expect(400)
      .expect('Content-Type', /application\/json/);
  });

  afterEach(() => {
    authenticatedSession = null;
  });
});

afterAll(() => {
  return mongoose.connection.close();
});