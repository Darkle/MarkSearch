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

var routes = require(path.join(__dirname, 'routes', 'index'))
var api = require(path.join(__dirname, 'routes', 'api'))

function expressInit(expressApp, express, serverPort, electronApp){
  expressApp.set('port', serverPort)
  expressApp.set('marksearchVersion', electronApp.getVersion())
  expressApp.set('marksearchAppName', electronApp.getName())
  expressApp.use(compression())
  expressApp.set('views', path.join(__dirname, 'views'))
  expressApp.set('view engine', 'jade')
  // uncomment after placing your favicon in /public
  //expressApp.use(favicon(path.join(__dirname,'..', 'public', 'favicon.ico')))
  expressApp.use(logger('dev'))
  /****
   * The api gets sent the text of the page, so in the off chance that it
   * encounters a page with a huge amount of text, increase the size limit that
   * can be sent via post body. (the limit is '100kb')
   * https://github.com/expressjs/body-parser#limit-3
   */
  expressApp.use(bodyParser.json({limit: '1mb'}))
  expressApp.use(bodyParser.urlencoded({ limit: '1mb', extended: false }))
  expressApp.use(expressValidator())
  expressApp.use(cookieParser())
  expressApp.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'static')))
  expressApp.use('/bower_components',  express.static(path.join(__dirname, '..', '..', 'bower_components')))
  /****
   * Routes
   */
  expressApp.use('/api', authenticationCheck, api)
  expressApp.use('/', csurf({ cookie: true, httpOnly: true }), routes)

  expressErrorMiddleware(expressApp)

  if(expressApp.get('env') === 'development'){
    /****
     * Pretty print html
     */
    expressApp.locals.pretty = true
  }
  return expressApp
}

module.exports = expressInit