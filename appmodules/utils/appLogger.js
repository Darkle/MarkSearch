'use strict';

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
      req: req => {
        return {
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
        }
      },
      res: res => {
        return {
          requestId: _.get(res, 'req.id'),
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          _header: res._header,
          _headers: res._headers,
          _removedHeader: res._removedHeader,
        }
      }
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

  /****
   * For any Promises that are rejected and have no error handler (within a turn of the event loop).
   * https://nodejs.org/api/process.html#process_event_unhandledrejection
   */
  process.on('unhandledRejection', (reason, p) => {
    var unhandledRejectionError = new Error("Unhandled Rejection at: Promise ", p, " reason: ", reason)
    console.error(unhandledRejectionError)
    logger.log.error({err: unhandledRejectionError})
  })
}

module.exports = logger

