const loadJsonFile = require('load-json-file');
const moment = require('moment-timezone');

const CronWorker = require('./CronWorker');
const HeosAlarmClock = require('./HeosAlarmClock');

const CONFIGURATION_FILE = process.env.CONFIGURATION_FILE || './configuration.json';
const CONFIGURATION_CHECK_CRONTAB = process.env.CONFIGURATION_CHECK_CRONTAB || '* * * * * *'

async function startHeosAlarm() {
  const now = moment();
  const configuration = await loadJsonFile(CONFIGURATION_FILE);

  if (configuration) {
    if (configuration.exceptions && Array.isArray(configuration.exceptions)) {
      const exception = configuration.exceptions.find(exception => exception.day === now.date() && exception.month === now.month() - 1);

      if (exception) {
        logger.info({
          source: startHeosAlarm.name,
          message: `Day-of-month ${exception.day} of month ${exception.month} was found in configuration exceptions, not triggering alarm`
        });
        return;
      }
    }

    if (configuration.heos) {
      const heosAlarmClock = new HeosAlarmClock(
        {
          ipAddress: configuration.heos.ipAddress,
          playerId: configuration.heos.playerId,
          mediaUrl: configuration.heos.mediaUrl
        }
      );

      await heosAlarmClock.setupConnection();
      heosAlarmClock.playMedia();
    }
  }
}

async function initialize() {
  const cronWorker = new CronWorker({
    configurationCheckCrontab: CONFIGURATION_CHECK_CRONTAB,
    configurationFile: CONFIGURATION_FILE,
    alarmCallback: startHeosAlarm
  });
}

module.exports = initialize();
