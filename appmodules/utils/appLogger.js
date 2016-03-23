'use strict';

var path = require('path')

var bunyan = require('bunyan')

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
    serializers: bunyan.stdSerializers
  })

  require('crashreporter').configure({
    outDir: logsFolder,
    exitOnCrash: false,
    maxCrashFile: 5
  })

/****
 * Throw so electron doesn't keep running - we
 * probably want to bail on these.
 */
  process.on('uncaughtException', function handleUncaughtException(err) {
    console.error(err)
    console.error(err.stack)
    logger.log.error(err)
    throw err
  })

}

module.exports = logger

