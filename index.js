const loadJsonFile = require('load-json-file');

const CronWorker = require('./CronWorker');
const HeosAlarmClock = require('./HeosAlarmClock');

const CONFIGURATION_FILE = process.env.CONFIGURATION_FILE || './configuration.json';
const CONFIGURATION_CHECK_CRONTAB = process.env.CONFIGURATION_CHECK_CRONTAB || '* * * * * *'

async function startHeosAlarm() {
  const configuration = await loadJsonFile(CONFIGURATION_FILE);

  if (configuration && configuration.heos) {
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

async function initialize() {
  const cronWorker = new CronWorker({
    configurationCheckCrontab: CONFIGURATION_CHECK_CRONTAB,
    configurationFile: CONFIGURATION_FILE,
    alarmCallback: startHeosAlarm
  });
}

module.exports = initialize();
