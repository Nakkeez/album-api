const { StatusCodes } = require('http-status-codes');

const Album = require('../models/Album');
const User = require('../models/User');
const BadRequestError = require('../errors/badrequest');
const NotFoundError = require('../errors/notfound');
const UnauthorizedError = require('../errors/unauthorized.js');

const isValidId = (id) => {
  if (typeof id === 'string') {
    if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) return true;
  } else if (id instanceof Uint8Array) {
    if (id.length == 12) return true;
  } else if (typeof id === 'number') {
    if (Number.isInteger(id)) return true;
  }
  return false;
};

const getAlbums = async (req, res) => {
  const { 
    search, artist, title, genre, numericFilters,
    releaseYearRange, fields, sort } = req.query;

  const queryObject = {};
  
  if (search) {
    queryObject.$or = [
      { artist: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } },
      { genre: { $regex: search, $options: 'i' } },
    ];
  }
  if (artist) {
    queryObject.artist = { $regex: artist, $options: 'i' };
  }
  if (title) {
    queryObject.title = { $regex: title, $options: 'i' };
  }
  if (genre) {
    queryObject.genre = { $regex: genre, $options: 'i' };
  }
  if (numericFilters) {
    const operatorMap = {
      '=':'$eq',
      '<':'$lt',
      '<=':'$lte',
      '>':'$gt',
      '>=':'$gte',
    };
    const regexPattern = /\b(>|>=|=|<|<=)\b/g;
    let filters = numericFilters.replace(
      regexPattern, (match) => `-${operatorMap[match]}-`
    );
    const options = ['year', 'tracks'];
    filters.split(',').forEach((item) => {
      const [field, operator, value] = item.split('-');
      if (options.includes(field)) {
        queryObject[field] = {[operator]: Number(value)};
      }
    });
  }
  if (releaseYearRange) {
    const [startYear, endYear] = releaseYearRange.split('-');
    queryObject.year = { $gte: Number(startYear), $lte: Number(endYear) };
  }

  let albumQuery = Album.find(queryObject);
  if (fields) {
    const fieldsToGet = fields.split(',').map(field => field.trim());
    // Id is returned by default so exclude it if not found in the query string
    if (!fieldsToGet.includes('_id')) {
      fieldsToGet.push('-_id');
    }
    albumQuery = albumQuery.select(fieldsToGet.join(' '));
  }
  if (sort) {
    const fieldsToSortBy = sort.split(',').join(' ');
    albumQuery = albumQuery.sort(fieldsToSortBy);
  }

  const albums = await albumQuery.populate('owners', { username: 1 });
  res.status(StatusCodes.OK).json({ success: true, data: albums });
};

const getAlbum = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    throw new BadRequestError(
      'Id must be a 24 character hex string, 12 byte Uint8Array, or an integer'
    );
  }

  const album = await Album.findById(id).populate('owners', { username: 1 });
  if (!album) {
    throw new NotFoundError(`No album found with id ${id}`);
  }
  res.status(StatusCodes.OK).json({ success: true, data: album });
};

const createAlbum = async (req, res) => {
  const { artist, title, year, genre, tracks } = req.body;
  const userId = req.user.id;

  const user = await User.findById(userId);
  
  const album = await Album.create({
    artist, title, year, genre, tracks, owners: userId
  });

  user.albums = user.albums.concat(album.id);
  await user.save();

  res.status(StatusCodes.CREATED).json({ success: true, data: album });
};


const updateAlbum = async (req, res) => {
  const { id } = req.params;
  const { artist, title, year, genre, tracks } = req.body;
  const { role, albums } = req.user;

  if (!isValidId(id)) {
    throw new BadRequestError(
      'Id must be a 24 character hex string, 12 byte Uint8Array, or an integer'
    );
  }

  let albumOwned = false;
  albums.map((ownedAlbum) => {
    if (id == ownedAlbum) {
      albumOwned = true;
    }
  });

  if (!albumOwned && role != 'admin') {
    throw new UnauthorizedError(
      'Cannot update album that is not created by you'
    );
  }

  const album = await Album.findByIdAndUpdate(
    id,
    { artist, title, year, genre, tracks },
    { new: true, runValidators: true }
  );
  if (!album) {
    throw new NotFoundError(`No album found with id ${id}`);
  }

  return res.status(StatusCodes.CREATED).json({ success: true, data: album });
};

const deleteAlbum = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const user = await User.findById(userId);

  if (!isValidId(id)) {
    throw new BadRequestError(
      'Id must be a 24 character hex string, 12 byte Uint8Array, or an integer'
    );
  }

  // I'm tired
  let albumOwned = false;
  user.albums.map((ownedAlbum) => {
    if (id == ownedAlbum) {
      albumOwned = true;
    }
  });

  if (!albumOwned && user.role != 'admin') {
    throw new UnauthorizedError(
      'Cannot delete album that is not created by you'
    );
  }

  const album = await Album.findByIdAndDelete(id);
  if (!album) {
    throw new NotFoundError(`No album found with id ${id}`);
  }

  user.albums = user.albums.remove(album._id);
  await user.save();

  res.status(StatusCodes.OK).json({ success: true, data: album });
};

module.exports = {
  getAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum
};