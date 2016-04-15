'use strict'

var path = require('path')

var bunyan = require('bunyan')
var _ = require('lodash')

var logger = {}

logger.init = (markSearchAppDataPath) => {
  
  var logsFolder = path.join(markSearchAppDataPath, 'logs')

  logger.log = bunyan.createLogger({
    name: 'MarkSearchApp',
    streams: [
      {
        type: 'rotating-file',
        level: 'error',
        path: path.join(logsFolder, 'markSearchBunyan.log'),
        period: '2d',
        count: 5
      }
    ],
    serializers: {
      err: bunyan.stdSerializers.err,
      req: req =>
        ({
          requestId: req.id,
          baseUrl: req.baseUrl,
          originalUrl: req.originalUrl,
          _parsedUrl: req._parsedUrl,
          url: req.url,
          method: req.method,
          httpVersion: req.httpVersion,
          statusCode: req.statusCode,
          statusMessage: req.statusMessage,
          rawHeaders: req.rawHeaders,
          headers: req.headers,
          params: req.params,
          body: req.body,
          query: req.query,
          cookies: req.cookies,
          signedCookies: req.signedCookies,
          remoteAddress: _.get(req, 'connection.remoteAddress'),
          domain: req.domain,
        }),
      res: res => 
        ({
          requestId: _.get(res, 'req.id'),
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          _header: res._header,
          _headers: res._headers,
          _removedHeader: res._removedHeader,
        })
    }
  })
 
  require('crashreporter').configure({
    outDir: logsFolder,
    exitOnCrash: true,
    maxCrashFile: 5
  })

/****
 * Throw so electron doesn't keep running - we
 * probably want to bail on these.
 */
  process.on('uncaughtException', function handleUncaughtException(err) {
    console.log('uncaughtException')
    console.error(err)
    logger.log.error({err})
    throw err
  })

}

module.exports = logger

