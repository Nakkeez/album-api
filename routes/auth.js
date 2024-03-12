const router = require('express').Router();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

passport.use(new LocalStrategy(
  async function verify(username, password, cb) {
    try {
      const user = await User.findOne({ username });
      const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash);

      if (!(user && passwordCorrect)) {
        return cb(null, false, { message: 'Incorrect username or password' });
      }
      return cb(null, user);
    } catch (error) {
      return cb(error);
    } 
  }
));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, { 
      id: user.id,
      username: user.username,
      role: user.role,
      albums: user.albums,
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// eslint-disable-next-line no-unused-vars
router.get('/login', (req, res, next) => {
  res.redirect('/login.html');
});

router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));


router.post('/logout', (req, res, next) => {
  req.logout( (err) => {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

module.exports = router;