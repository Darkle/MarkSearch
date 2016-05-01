'use strict'

var path = require('path')

var bunyan = require('bunyan')
var _ = require('lodash')
var jetpack = require('fs-jetpack')

var logger = {}

logger.init = (markSearchAppDataPath) => {

  var logsFolder = path.join(markSearchAppDataPath, 'logs')
  /****
   * If the <appData>/MarkSearch/logs folder doesn't exist, create it.
   */
  jetpack.dir(logsFolder)

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
      uException: electronProcess =>
        ({
          execPath: electronProcess.execPath,
          cwd: electronProcess.cwd(),
          env: electronProcess.env,
          uptime: electronProcess.uptime(),
          arch: electronProcess.arch,
          platform: electronProcess.platform,
          versions: electronProcess.versions,
          memoryUsage: electronProcess.memoryUsage(),
          argv: electronProcess.argv.join(', ')
        }),
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
          domain: req.domain
        }),
      res: res => 
        ({
          requestId: _.get(res, 'req.id'),
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          _header: res._header,
          _headers: res._headers,
          _removedHeader: res._removedHeader
        })
    }
  })

/****
 * Prolly best to exit on uncaught exceptions.
 *
 * We're setting process.on('uncaughtException', function... here in the appLogger
 * as we want to catch uncaught exceptions as early as possible, but not before the
 * bunyan logger is ready, as we would like to log these errors.
 */
  process.on('uncaughtException', function handleUncaughtException(err) {
    console.log('uncaughtException')
    console.error(err)
    logger.log.error({err, uException: process})
    /****
     * If we throw/exit straight away, the logger doesn't seem to have
     * enough time to write to the log file. At the moment, there doesn't
     * seem to be a way to know when bunyan has finished writing to the log
     * file - https://github.com/trentm/node-bunyan/issues/95, so gonna just
     * do a setTimeout of 3 seconds.
     *
     * Using process.exit() as throwing in a setTimeout would create another
     * uncaughtException which would create an infinite loop here.
     */
    setTimeout(() => {
      process.exit(1)
    }, 3000)
  })

}

module.exports = logger

