var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { expressjwt: expressJWT } = require("express-jwt");
const config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');
var authRouter = require('./routes/auth');

var app = express();

function logRequest(req, res, next) {
  console.log(`${new Date().toUTCString()} ${req.method} ${req.url}, headers=${JSON.stringify(req.headers, null, '  ')}, query=${JSON.stringify(req.query, null, '  ')}, body=${JSON.stringify(req.body, null, '  ')}`);
  next();
}

app.use(cors({
  exposedHeaders: ["*"]
}));

app.use(expressJWT({
  secret: config.jwt.secret,
  algorithms: ["HS256"],
  credentialsRequired: false,
}));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));

//app.use(logRequest);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  if (req.get('Content-Type') === 'application/json' ||
    req.get('Content-Type') === 'application/x-www-form-urlencoded' ||
    /application\/json;/.test(req.get('accept'))) {
    res.status(404).json('method not found');
  } else {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  }
});

module.exports = app;
