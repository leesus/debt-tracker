var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var session = require('express-session');

// Dependencies
var passport = require('passport');
var mongoose = require('mongoose');
var flash = require('express-flash');

// Routes
var routes = require('./routes');

// Config
var passportConfig = require('./config/passport');
var secrets = require('./config/secrets');

// Create express
var app = express();

// Connect to mongo
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
    console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});
mongoose.connection.on('disconnect', function() {
    mongoose.connect(secrets.db);
});

// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
    secret: secrets.sessionSecret
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, '../client')));

// Set redirect url
app.use(function(req, res, next) {
    var path = req.path.split('/')[1];
    if (/auth|login|logout|signup|img|fonts|favicon/i.test(path)) return next();
    req.session.redirectUrl = req.path;
    next();
});

// Default home route
app.get('/', function(req, res, next) {
    res.render('index', { title: 'Easy Auth' });
});

// Use api routes, e.g. /api/account/login
app.use('/api', routes);

// Hashbang everything
app.use('*', function(req, res, next) {
    res.redirect('/#' + req.originalUrl);
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// Export server
module.exports = app;
