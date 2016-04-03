'use strict';

var path = require('path')

var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var csurf = require('csurf')
var compression = require('compression')
var addRequestId = require('express-request-id')()

var authorizationCheck = require('./authorizationCheck')
var expressErrorMiddleware = require('./expressErrorMiddleware')
var routes = require('./routes/index')
var api = require('./routes/api')

var devMode = process.env.NODE_ENV === 'development'

function expressInit(express, expressApp){
  expressApp.use(addRequestId)
  if(devMode){
    expressApp.use(logger('dev'))
  }
  expressApp.use(compression())
  expressApp.set('views', path.join(__dirname, 'views'))
  expressApp.set('view engine', 'jade')
  // uncomment after placing your favicon in /public
  //expressApp.use(favicon('../public/favicon.ico'))
  /****
   * The api gets sent the text of the page, so in the off chance that it
   * encounters a page with a huge amount of text, increase the size limit that
   * can be sent via post body. (the limit is '100kb')
   * https://github.com/expressjs/body-parser#limit-3
   */
  expressApp.use(bodyParser.json({limit: '1mb'}))
  expressApp.use(bodyParser.urlencoded({ limit: '1mb', extended: false }))
  expressApp.use(cookieParser())
  expressApp.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'static')))
  expressApp.use('/bower_components',  express.static(path.join(__dirname, '..', '..', 'bower_components')))
  /****
   * Routes
   */
  expressApp.use('/api', authorizationCheck, api)
  expressApp.use('/', csurf({ cookie: true, httpOnly: true }), routes)

  expressErrorMiddleware(expressApp)

  if(devMode){
    /****
     * Pretty print html
     */
    expressApp.locals.pretty = true
  }
}

module.exports = expressInit