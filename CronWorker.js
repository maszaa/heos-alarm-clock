const CronJob = require('cron').CronJob;
const loadJsonFile = require('load-json-file');

const logger = require('./logging');
const readConfigurationFile = require('./utils').readConfigurationFile;

class CronWorker {
  constructor({configurationCheckCrontab, customName, customCallback}) {
    this.configurationCheckCrontab = configurationCheckCrontab;
    this.customName = customName;
    this.customCallback = customCallback;
    this.cronJobs = {
      configurationCheck: null,
      [this.customName]: null
    };

    this._initializeConfigurationCheck = this._initializeConfigurationCheck.bind(this);
    this._updateCustomConfiguration = this._updateCustomConfiguration.bind(this);

    this._initializeConfigurationCheck();
  }

  async _initializeConfigurationCheck() {
    if (this.cronJobs.configurationCheck) {
      await this.cronJobs.configurationCheck.stop();
    }

    this.cronJobs.configurationCheck = new CronJob(this.configurationCheckCrontab, this._updateCustomConfiguration);
    this.cronJobs.configurationCheck.start();
    logger.info({
      source: this.constructor.name,
      message: `Initialized configuration check cronjob with crontab ${this.configurationCheckCrontab}`
    });
  }

  async _updateCustomConfiguration() {
    const configuration = await readConfigurationFile();

    if (configuration && configuration.cron && configuration.cron[this.customName]) {
      if (this.cronJobs[this.customName] && configuration.cron[this.customName] !== this.cronJobs[this.customName].cronTime.source) {
        logger.warning({
          source: this.constructor.name,
          message: `${[this.customName]} crontab changed (${configuration.cron[this.customName]} !== ${this.cronJobs.cronTime.source}), stopping previous ${[this.customName]} cronjob`
        });

        await this.cronJobs[this.customName].stop();
        delete this.cronJobs[this.customName];
      }
      if (!this.cronJobs[this.customName]) {
        this.cronJobs[this.customName] = new CronJob(configuration.cron[this.customName], this.customCallback);
        this.cronJobs[this.customName].start();

        logger.info({
          source: this.constructor.name,
          message: `Initialized ${[this.customName]} cronjob with crontab ${configuration.cron[this.customName]}`
        });
      }
    }
  }
}

module.exports = CronWorker;
