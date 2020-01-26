const DEFAULT_MESSAGE_SEPARATOR = ' '
const FUNCTION = 'function';

class Logger {
  constructor({source, debug, info, warn, error, messageSeparator, customFormatter}) {
    this.source = source;
    this.loggers = {
      debug: debug,
      info: info,
      warn: warn,
      error: error
    }
    this.messageSeparator = messageSeparator || DEFAULT_MESSAGE_SEPARATOR;
    this.customFormatter = customFormatter;
  }

  _getISOTimestampWithLocalTimezoneApplied() {
    const date = new Date();
    date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return date.toISOString();
  }

  _formatMessage({level, message}) {
    return this.customFormatter &&  typeof this.customFormatter === FUNCTION ?
      this.customFormatter({level, message}) :
      `[${this._getISOTimestampWithLocalTimezoneApplied()}: ${level.toUpperCase()}/${this.source}] ${message}`;
  }

  _log({logger, messages}) {
    logger && typeof logger === FUNCTION && logger(
      this._formatMessage({
        level: logger.name,
        message: messages.join(this.messageSeparator)
      })
    );
  }

  debug(...messages) {
    this._log({
      logger: this.loggers.debug,
      messages: messages
    });
  }

  info(...messages) {
    this._log({
      logger: this.loggers.info,
      messages: messages
    });
  }

  warn(...messages) {
    this._log({
      logger: this.loggers.warn,
      messages: messages
    });
  }

  error(...messages) {
    this._log({
      logger: this.loggers.error,
      messages: messages
    });
  }
}

module.exports = Logger;
