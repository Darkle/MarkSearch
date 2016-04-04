'use strict';

var path = require('path')

var bunyan = require('bunyan')
var _ = require('lodash')

var logger = {}

logger.init = (markSearchAppDataPath) => {
  
  var logsFolder = path.join(markSearchAppDataPath, 'logs')
  /****
   * Setting the hostname to a set string as the hostname may leak personal
   * info about the user - e.g. some people use their full name for the
   * account name on their desktop pc, which (on a Mac at least), would
   * result in JohnSmiths-iMac.local being logged as the hostname.
   */
  logger.log = bunyan.createLogger({
    name: 'MarkSearchApp',
    hostname: 'MarkSearch',
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
    console.error(err)
    console.error(err.stack)
    logger.log.error({err})
    throw err
  })

}

module.exports = logger

