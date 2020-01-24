const CronJob = require('cron').CronJob;
const loadJsonFile = require('load-json-file');

const logger = require('./logging');

class CronWorker {
  constructor({configurationCheckCrontab, configurationFile, alarmCallback}) {
    this.configurationCheckCrontab = configurationCheckCrontab;
    this.configurationFile = configurationFile;
    this.alarmCallback = alarmCallback;
    this.cronJobs = {
      configurationCheck: null,
      alarm: null
    };

    this._initializeConfigurationCheck = this._initializeConfigurationCheck.bind(this);
    this._readConfiguration = this._readConfiguration.bind(this);
    this._updateConfiguration = this._updateConfiguration.bind(this);

    this._initializeConfigurationCheck();
  }

  async _initializeConfigurationCheck() {
    if (this.cronJobs.configurationCheck) {
      await this.cronJobs.configurationCheck.stop();
    }

    this.cronJobs.configurationCheck = new CronJob(this.configurationCheckCrontab, this._updateConfiguration);
    this.cronJobs.configurationCheck.start();
    logger.info({
      source: this.constructor.name,
      message: `Initialized configuration check cronjob with crontab ${this.configurationCheckCrontab}`
    });
  }

  async _readConfiguration() {
    return loadJsonFile(this.configurationFile);
  }

  async _updateConfiguration() {
    const configuration = await this._readConfiguration();

    if (configuration && configuration.cron && configuration.cron.alarm) {
      if (this.cronJobs.alarm && configuration.cron.alarm !== this.cronJobs.alarm.cronTime.source) {
        logger.warning({
          source: this.constructor.name,
          message: `Alarm crontab changed (${configuration.cron.alarm} !== ${this.cronJobs.cronTime.source}), stopping previous alarm cronjob`
        });

        await this.cronJobs.alarm.stop();
        delete this.cronJobs.alarm;
      }
      if (!this.cronJobs.alarm) {
        this.cronJobs.alarm = new CronJob(configuration.cron.alarm, this.alarmCallback);
        this.cronJobs.alarm.start();

        logger.info({
          source: this.constructor.name,
          message: `Initialized alarm cronjob with crontab ${configuration.cron.alarm}`
        });
      }
    }
  }
}

module.exports = CronWorker;
