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

  fs.readdirSync(loggerPath).forEach((file) => {
    if (file.split('.').pop() === 'js') {
      const logger = require(path.join(loggerPath, file));

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
    debug: (message) => Promise.all(loggers.debug.map((debug) => debug(message))),
    info: (message) => Promise.all(loggers.info.map((info) => info(message))),
    warning: (message) => Promise.all(loggers.warning.map((warning) => warning(message))),
    error: (message) => Promise.all(loggers.error.map((error) => error(message))),
    timezone: process.env.TIMEZONE,
  });
}

module.exports = initializeLogger(collectLoggers());
