const moment = require('moment-timezone');

const CronWorker = require('./CronWorker');
const HeosMediaPlayer = require('./HeosMediaPlayer');
const readConfigurationFile = require('./utils').readConfigurationFile;

const CONFIGURATION_CHECK_CRONTAB = process.env.CONFIGURATION_CHECK_CRONTAB || '0 * * * * *';
const TIMEZONE = process.env.TIMEZONE || 'UTC';

async function startHeosAlarm() {
  const now = moment().tz(TIMEZONE);
  const configuration = await readConfigurationFile();

  if (configuration) {
    if (configuration.exceptions && Array.isArray(configuration.exceptions)) {
      const exception = configuration.exceptions.find(exception => exception.day === now.date() && exception.month === now.month() + 1);

      if (exception) {
        logger.info({
          source: startHeosAlarm.name,
          message: `Day-of-month ${exception.day} of month ${exception.month} was found in configuration exceptions, not triggering alarm`
        });
        return;
      }
    }

    if (configuration.heos) {
      const heosAlarmClock = new HeosMediaPlayer(
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
  const configuration = await readConfigurationFile();

  if (configuration && configuration.cron) {
    new CronWorker({
      configurationCheckCrontab: CONFIGURATION_CHECK_CRONTAB,
      customName: Object.keys(configuration.cron).shift(),
      customCallback: startHeosAlarm
    });
  }
}

module.exports = initialize();
