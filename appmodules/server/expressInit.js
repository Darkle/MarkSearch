'use strict';

var path = require('path')

var helmet = require('helmet')
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
  /****
   * Content Security Policy
   */
  expressApp.use(helmet.csp({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"]
    },
    reportOnly: false,
    setAllHeaders: false,
    disableAndroid: false,
    browserSniff: true
  }))
  /****
   * xssFilter FWIW
   * https://github.com/helmetjs/helmet#xss-filter-xssfilter
   *
   */
  expressApp.use(helmet.xssFilter())
  /****
   * Frameguard stops the page being put in a <frame> or <iframe> without your consent.
   */
  expressApp.use(helmet.frameguard({action: 'deny'}))
  expressApp.use(helmet.hidePoweredBy())
  /****
   * https://github.com/helmetjs/helmet#dont-infer-the-mime-type-nosniff
   */
  expressApp.use(helmet.noSniff())
  /****
   * Prefetching is one of the features for search page, so need to enable this.
   * https://github.com/helmetjs/helmet#prevent-dns-prefetching-dnsprefetchcontrol
   */
  expressApp.use(helmet.dnsPrefetchControl({ allow: true }))


  /****
   * The api gets sent the text of the page, so in the off chance that it
   * encounters a page with a huge amount of text, increase the size limit that
   * can be sent via post body. (the limit is '100kb')
   * https://github.com/expressjs/body-parser#limit-3
   */
  expressApp.use(bodyParser.json({limit: '3mb'}))
  expressApp.use(bodyParser.urlencoded({ limit: '3mb', extended: false }))
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