var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var passport = require('passport')
var cookieSession = require('cookie-session')

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
require('dotenv').load()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.HOST + "/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_basicprofile'],
    state: true
}, function(accessToken, refreshToken, profile, done) {
    done(null, {
        id: profile.id,
        displayName: profile.displayName,
        token: accessToken
    })
}));

passport.use(new TwitterStrategy({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: process.env.HOST + "/auth/twitter/callback"
    }, function(token, tokenSecret, profile, cb) {
        console.log(profile.username);
        return cb(null, profile);
  }));

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });


app.get('/auth/linkedin',
    passport.authenticate('linkedin'),
    function(req, res) {
        // The request will be redirected to LinkedIn for authentication, so this
        // function will not be called.
    });
app.get('/auth/twitter',
    passport.authenticate('twitter'),
    function(req, res) {

        // The request will be redirected to LinkedIn for authentication, so this
        // function will not be called.
    });


// passport.serializeUser(function(user, done) {
//     done(null, user);
// });
//
// passport.deserializeUser(function(user, done) {
//     done(null, user);
// });

passport.serializeUser(function(user, done) {
  console.log('yay');
    done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log('yay');
    done(null, user);
});

app.use(function(req, res, next) {
    console.log(req.user);
    res.locals.user = req.user
    next()
})

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers`

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


module.exports = app;
