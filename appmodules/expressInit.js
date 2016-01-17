'use strict';

var path = require('path')

var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var csurf = require('csurf')
var expressValidator = require('express-validator')
var compression = require('compression')

var authenticationCheck = require(path.join(__dirname, 'authenticationCheck'))

var routes = require(path.join(__dirname, '..', 'routes', 'index'))
var api = require(path.join(__dirname, '..', 'routes', 'api'))

function expressInit(app, express){
  app.use(compression())
  app.set('views', path.join(__dirname, '..', 'views'))
  app.set('view engine', 'jade')
  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname,'..', 'public', 'favicon.ico')))
  app.use(logger('dev'))
  /****
   * The api gets sent the HTML text of the page, so in the off chance that it
   * encounters a page with a huge amount of text, increase the size limit that
   * can be sent via post body. (the limit is '100kb')
   * https://github.com/expressjs/body-parser#limit-3
   */
  app.use(bodyParser.json({limit: '1mb'}))
  app.use(bodyParser.urlencoded({ limit: '1mb', extended: false }))
  app.use(expressValidator())
  app.use(cookieParser())
  app.use(express.static(path.join(__dirname, '..', 'public')))
  app.use('/bower_components',  express.static( path.join(__dirname, '..', 'bower_components')))
  /****
   * Routes
   */
  app.use('/api', authenticationCheck, api)
  app.use('/', csurf({ cookie: true, httpOnly: true }), routes)

  /****
   * Error middlewares
   */
  /****
   * catch 404 and forward to error handler
   */
  app.use((req, res, next) => {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
  })
  /****
   * error handlers
   */
  app.locals.pretty = true
  app.use((err, req, res, next) => {
    /****
     * errObjectToShow = {} - no stacktraces leaked to user if in production
     */
    var errObjectToShow = {}
    if(app.get('env') === 'development'){
      console.error(err.status)
      console.error(err.message)
      console.error(err)
      errObjectToShow = err
    }
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: errObjectToShow
    })
  })
  if(app.get('env') === 'development'){
    /****
     * Pretty print html
     */
    app.locals.pretty = true
  }
}

module.exports = expressInit