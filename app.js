let methodOverride = require('method-override');

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();

/**====================================*\
 *  View Engine Setup
 ======================================*/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(__dirname + '../public'));

app.use('/', index);


/**====================================*\
 *  404 Catching
 ======================================*/
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


/**====================================*\
 *  Error Handler
 ======================================*/
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



/**====================================*\
 *  At the end
 ======================================*/
module.exports = app;


/**====================================*\
 *  Configuration Server NodeJS
 ======================================*/
// listen (start app with node server.js) 
app.listen(4000, () => {

    console.log("App listening on port 4000");

});