// Imports.
var express = require('express');
var router = express.Router();
var dbConfig = require('../configs/dbconfig');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');

// Passport configuration.
passport.use(new LocalStrategy(function verify(email, password, cb) {
  let db = dbConfig.openDatabase();
  db.get('SELECT rowid as id, email, hashed_password, salt FROM users WHERE email = ?', [email], function (err, row) {
    if (err) { return cb(err); }
    if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

    crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
      if (err) { return cb(err); }
      if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }

      return cb(null, row);

    });
  });
}));

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.email });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});






/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


/**
 * @description POST users/
 * Creates a new user. Salts and hashes password before inserting into db.
 */
router.post('/', function (req, res, next) {
  const TAG = '\nusers POST /(), ';
  console.log(TAG + 'Is registering a new user.');

  // Current timestamp date to sqlite friendly date.
  let currentDate = new Date();
  let sqliteDate = currentDate.toISOString();

  // Salt and hash.
  let salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function (err, hashedPassword) {
    if (err) { return next(err); }

    // Run db statement to insert user record.
    let db = dbConfig.openDatabase();
    console.log('Running db statement.')
    db.run('INSERT INTO users (email, username, hashed_password, salt, user_type, date_created) VALUES (?, ?, ?, ?, ?, ?)', [
      req.body.email,
      req.body.username,
      hashedPassword,
      salt,
      'Member',
      sqliteDate
    ], function (err) {
      if (err) {
        // Gracefully handle known errors,
        // else any unknown errors get handled by middleware.
        console.log('Error when running db statement: ');
        console.log(err);


        if (err.message === 'SQLITE_CONSTRAINT: UNIQUE constraint failed: users.username') {
          res.status(409).send({ errorMessage: 'Username already exists. Username must be unique.' });
        } else if (err.message = 'SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email') {
          res.status(409).send({ errorMessage: 'An account is already registered under that email.' });
        } else {
          return next(err);
        }
      } else {
        res.sendStatus(200);
      }

    });

  });
});






module.exports = router;
