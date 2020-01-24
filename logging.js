const fs = require('fs');
const path = require('path');

const Logger = require('./Logger');

function collectLoggers() {
  const loggers = {
    debug: [],
    info: [],
    warning: [],
    error: []
  }
  const loggerPath = path.join(__dirname, 'loggers');

  let logger;

  fs.readdirSync(loggerPath).forEach((file) => {
    if (file.split('.').pop() === 'js') {
      logger = require(path.join(loggerPath, file));

      if (logger) {
        if (logger.debug) loggers.debug.push(logger.debug);
        if (logger.info) loggers.info.push(logger.info);
        if (logger.warning) loggers.warning.push(logger.warning);
        if (logger.error) loggers.error.push(logger.error);
      }
    }
  });

  return loggers;
}

function initializeLogger(loggers) {
  return new Logger({
    debug: (message) => loggers.debug.forEach((debug) => debug(message)),
    info: (message) => loggers.info.forEach((info) => info(message)),
    warning: (message) => loggers.warning.forEach((warning) => warning(message)),
    error: (message) => loggers.error.forEach((error) => error(message)),
    timezone: process.env.TIMEZONE,
  });
}

module.exports = initializeLogger(collectLoggers());
