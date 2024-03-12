require('express-async-errors');
const config = require('./utils/config');
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
const logger = require('morgan');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorhandler');
const albums = require('./routes/albums');
const query = require('./routes/query');
const register = require('./routes/register');
const getAllAlbums = require('./routes/getAllAlbums');
const authMiddleware  = require('./middleware/auth');
const connectMongoDB = require('./db/mongodb');

const authRouter = require('./routes/auth');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  name: 'session_id',
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoDBStore.create({
    mongoUrl: config.MONGODB_URI,
    collectionName: 'password-sessions'
  }),
  // Enable secure option when using https
  cookie: {
    secure: 'auto',
    sameSite: 'none'
  }
}));

app.use(passport.authenticate('session'));
app.use('/', authRouter);
app.use('/api/albums', authMiddleware, albums);
app.use('/api/query', authMiddleware, query);
app.use('/api/register', register);
app.use('/api/getAllAlbums', getAllAlbums);
app.use('/', authMiddleware);
app.use('/', express.static(path.join(__dirname, 'secure')));

app.use(notFound);

app.use(errorHandler);

const startApplication = async () => {
  try {
    await connectMongoDB(config.MONGODB_URI);
  } catch (error) {
    console.log(error);
  }
};

startApplication();

module.exports = app;
