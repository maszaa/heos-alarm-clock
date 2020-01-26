const CronWorker = require('./CronWorker');
const HeosMediaPlayer = require('./HeosMediaPlayer');
const Logger = require('./logging');
const { readConfigurationFile } = require('./utils');

const CONFIGURATION_CHECK_CRONTAB = process.env.CONFIGURATION_CHECK_CRONTAB || '0 * * * * *';

const logger = Logger({source: module.filename});

async function startHeosAlarm() {
  const now = new Date();

  const configuration = await readConfigurationFile();

  if (configuration) {
    if (configuration.exceptions && Array.isArray(configuration.exceptions)) {
      const exception = configuration.exceptions.find(exception => exception.day === now.getDate() && exception.month === now.getMonth() + 1);

      if (exception) {
        logger.info(`Day-of-month ${exception.day} of month ${exception.month} was found in configuration exceptions, not triggering alarm`);
        return;
      }
    }

    if (configuration.heos) {
      const heosAlarmClock = new HeosMediaPlayer(
        {
          ipAddress: configuration.heos.ipAddress,
          playerId: configuration.heos.playerId,
          mediaUrl: configuration.heos.mediaUrl,
          logger: Logger({source: `${HeosMediaPlayer.name}`})
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
      configurationGetter: readConfigurationFile,
      customCallback: startHeosAlarm,
      logger: Logger({source: CronWorker.name})
    });
  }
}

module.exports = initialize();
