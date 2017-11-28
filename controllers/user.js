// const bluebird = require('bluebird');
// const crypto = bluebird.promisifyAll(require('crypto'));
// const nodemailer = require('nodemailer');
const passport = require('passport');

const User = require('../models/User');

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Success! You are logged in.' });
      req.session.user = user;
      res.redirect('/order');
    });
  })(req, res, next);
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/registration', {
    title: 'Create Account'
  });
};
  
/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
    req.assert('name', 'Name is not valid').notEmpty();
    req.assert('name', 'Username must be at least 3 characters long').len(3);
    req.assert('surname', 'Surname is not valid').notEmpty();
    req.assert('patronymic', 'Patronymic is not valid').notEmpty();
    req.assert('patronymic', 'Patronymic must be at least 3 characters long').len(3);

    req.assert('email', 'Email is not valid').isEmail();
    req.assert('country', 'Country is not valid').notEmpty();
    req.assert('city', 'City is not valid').notEmpty();
    req.assert('street', 'Street is not valid').notEmpty();
    req.assert('houseNumb', 'House Number is not valid').notEmpty();
    req.assert('flatNumb', 'Flat number is not valid').notEmpty();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  
    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();
  
    if (errors) {
      req.flash('errors', errors);
      return res.redirect('/signup');
    }
    
    var name = req.body.surname + ' '+ req.body.name + ' ' + req.body.patronymic;
    
    const user = new User({
      username: name,
      email: req.body.email,
      phoneNumber: req.body.phone,
      password: req.body.password,
      address : {
        country: req.body.country,
        city: req.body.city,
        street: req.body.street,
        house: req.body.houseNumb,
        flat: req.body.flatNumb || 0
      }
    });
  
    //  Check existing email
    User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/signup');
    }
      req.session.user = user;
      user.save((err) => {
        if (err) { return next(err); }
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect('/order');
        });
      });
  });
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  req.session.destroy();
  req.session = null;
  res.redirect('/');
};


