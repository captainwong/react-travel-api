const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { expressjwt: expressJWT } = require("express-jwt");
const config = require('./config');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');

const app = express();

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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'images')));

//app.use(logRequest);
app.use('/auth', authRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  console.log(`${new Date().toUTCString()} ${req.method} ${req.url}, headers=${JSON.stringify(req.headers, null, '  ')}, query=${JSON.stringify(req.query, null, '  ')}, body=${JSON.stringify(req.body, null, '  ')}`);
  console.log(err);

  if (err.name === 'UnauthorizedError') {
    return res.status(err.status).json({
      code: err.code,
      msg: err.message,
    })
  }

  res.status(404).json('method not found');
});

module.exports = app;
