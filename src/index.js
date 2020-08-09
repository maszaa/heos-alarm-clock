const CronWorker = require('./CronWorker');
const HeosCommandExecutor = require('./HeosCommandExecutor');
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
      const heosAlarmClock = new HeosCommandExecutor(
        {
          logger: Logger({source: `${HeosCommandExecutor.name}`})
        }
      );

      await heosAlarmClock.setupConnection({
        ipAddress: configuration.heos.ipAddress
      });
      heosAlarmClock.executeCommand({
        command: configuration.heos.command,
        payload: configuration.heos.payload
      });
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

    process.on('uncaughtException', (err, origin) => logger.error(err, origin));
    process.on('unhandledRejection', (reason, promise) => logger.error(reason, JSON.stringify(promise, null, 2)));
    process.on('warning', (warning) => logger.warning(warning));
  } else {
    logger.info('Custom crontabs not defined or configuration file missing');
    process.exit(0);
  }
}

module.exports = initialize();
