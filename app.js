var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
const flash = require('express-flash');
const passport = require('passport');
const expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');


var hbs = require('hbs');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

const pagesController = require('./controllers/pages');
const shopController = require('./controllers/shop');
const userController = require('./controllers/user');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(__dirname + '/views/partials');
app.set('view engine', 'hbs');

//Defining middleware to serve static files
app.use('/static', express.static('public'));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true,
    clear_interval: 3600
  })
}))
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));

// res.locals is an object passed to hbs engine
app.use(function(req, res, next) {
  res.locals.session = req.session;
  next();
});

app.get('/', pagesController.homePage);
app.get('/films', pagesController.filmsPage);
app.get('/comics', pagesController.comicsPage);
app.get('/serials', pagesController.serialsPage);
app.get('/heroes', pagesController.heroesPage);
app.get('/shop', shopController.shopPage);
app.post('/shop', shopController.searchItemsPost);
app.get('/add', shopController.addItem);
app.get('/cart', shopController.openCart);
app.get('/remove/:id', shopController.removeItem);
app.get('/login', userController.getLogin)
app.post('/login', userController.postLogin);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/order', shopController.getOrder);
app.get('/logout', userController.logout);
app.get('/orderConfirm', shopController.getOrderConfirm);
app.get('/cancel', shopController.getCancel);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
