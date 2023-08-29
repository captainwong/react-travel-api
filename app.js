var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var apiRouter = require('./routes/api');

var app = express();
app.use(cors({
  exposedHeaders: ["*"]
}));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

function error(status, msg) {
  var err = new Error(msg);
  err.status = status;  
  
  return err;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// app.use('/api', async function (req, res, next) {
//   const key = req.headers['x-icode'];
//   if (!key) {
//     console.log(req.headers);
//     return res.status(200).json({
//       status: 400,
//       msg: 'x-icode required',
//     });
//   }
//   const apiKeys = ['foo', 'bar', 'baz'];
//   if (apiKeys.indexOf(key) === -1) {
//     return res.status(200).json({
//       status: 400,
//       msg: 'invalid x-icode',
//     });
//   }
//   req.x_icode = key;
//   //await sleep(1000);
//   next();
// });
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
