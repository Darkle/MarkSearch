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
var expressErrorMiddleware = require(path.join(__dirname, 'expressErrorMiddleware'))

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

  expressErrorMiddleware(app)

  if(app.get('env') === 'development'){
    /****
     * Pretty print html
     */
    app.locals.pretty = true
  }
}

module.exports = expressInit