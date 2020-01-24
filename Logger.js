const moment = require('moment-timezone');

const DEFAULT_TIMEZONE = 'UTC';

class Logger {
  constructor({debug, info, warning, error, timezone}) {
    this.loggers = {
      debug: debug,
      info: info,
      warning: warning,
      error: error
    }
    this.timezone = timezone || DEFAULT_TIMEZONE;
  }

  _formatMessage({level, source, message}) {
    return `[${moment().tz(this.timezone).toISOString(true)}: ${level.toUpperCase()}/${source}] ${message}`;
  }

  debug({source, message}) {
    this.loggers.debug && this.loggers.debug(this._formatMessage({
      level: this.debug.name,
      source,
      message
    }));
  }

  info({source, message}) {
    this.loggers.info && this.loggers.info(this._formatMessage({
      level: this.info.name,
      source,
      message
    }));
  }

  warning({source, message}) {
    this.loggers.warning && this.loggers.warning(this._formatMessage({
      level: this.warning.name,
      source,
      message
    }));
  }

  error({source, message}) {
    this.loggers.error && this.loggers.error(this._formatMessage({
      level: this.error.name,
      source,
      message
    }));
  }
}

module.exports = Logger;
