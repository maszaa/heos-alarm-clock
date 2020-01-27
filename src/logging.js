const fs = require('fs');
const path = require('path');

const LOGGER_PATH = process.env.LOGGER_PATH || path.resolve(__dirname, '../loggers');
const LOGGER_FILE_EXTENSION = process.env.LOGGER_FILE_EXTENSION || 'js';
const LOGGER_FILE_EXTENSION_SPLITTER = '.';

const Logger = require('./Logger');

function appendLoggers(loggers, level, logger) {
  Array.isArray(logger) ? loggers[level] = [...loggers[level], ...logger] : loggers[level].push(logger);
}

function collectLoggers() {
  const loggers = {
    debug: [],
    info: [],
    warn: [],
    error: []
  }

  fs.readdirSync(LOGGER_PATH).forEach((file) => {
    if (file.split(LOGGER_FILE_EXTENSION_SPLITTER).pop() === LOGGER_FILE_EXTENSION) {
      const logger = require(path.join(LOGGER_PATH, file));

      if (logger) {
        logger.debug && appendLoggers(loggers, 'debug', logger.debug);
        logger.info && appendLoggers(loggers, 'info', logger.info);
        logger.warn && appendLoggers(loggers, 'warn', logger.warn);
        logger.error && appendLoggers(loggers, 'error', logger.error);
      }
    }
  });

  return loggers;
}

const LOGGERS = collectLoggers();
const LOGGER = {
  debug: (...messages) => Promise.all(LOGGERS.debug.map(debug => debug(...messages))),
  info: (...messages) => Promise.all(LOGGERS.info.map(info => info(...messages))),
  warn: (...messages) => Promise.all(LOGGERS.warn.map(warn => warn(...messages))),
  error: (...messages) => Promise.all(LOGGERS.error.map(error => error(...messages))),
};

function initializeLogger({source}) {
  return new Logger({
    ...LOGGER,
    source
  });
}

module.exports = initializeLogger;
