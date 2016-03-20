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

  process.on('uncaughtException', err => {
    console.error(err)
    logger.log.error(err)
  })

}

module.exports = logger

