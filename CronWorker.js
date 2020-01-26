const CronJob = require('cron').CronJob;

const FUNCTION = 'function';
const OBJECT = 'object';

class CronWorker {
  constructor({configurationCheckCrontab, configurationGetter, customName, customCallback, logger}) {
    this.configurationCheckCrontab = configurationCheckCrontab;
    this.configurationGetter = configurationGetter;
    this.customName = customName;
    this.customCallback = customCallback;
    this.cronJobs = {
      configurationCheck: null,
      [this.customName]: null
    };
    this.logger = logger && typeof logger === OBJECT ? logger : () => {};

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
    this.logger.info(`Initialized configuration check cronjob with crontab ${this.configurationCheckCrontab}`);
  }

  async _updateCustomConfiguration() {
    const configuration = this.configurationGetter && typeof this.configurationGetter === FUNCTION && await this.configurationGetter();

    if (configuration && configuration.cron && configuration.cron[this.customName]) {
      if (this.cronJobs[this.customName] && configuration.cron[this.customName] !== this.cronJobs[this.customName].cronTime.source) {
        this.logger.warn(`${[this.customName]} crontab changed (${configuration.cron[this.customName]} !== ${this.cronJobs.cronTime.source}), stopping previous ${[this.customName]} cronjob`);

        await this.cronJobs[this.customName].stop();
        delete this.cronJobs[this.customName];
      }

      if (!this.cronJobs[this.customName]) {
        if (this.customCallback && typeof this.customCallback === FUNCTION) {
          this.cronJobs[this.customName] = new CronJob(configuration.cron[this.customName], this.customCallback);
          this.cronJobs[this.customName].start();

          this.logger.info(`Initialized ${[this.customName]} cronjob with crontab ${configuration.cron[this.customName]}`);
        } else {
          this.logger.error('Invalid custom callback', 'typeof this.customCallback === FUNCTION', typeof this.customCallback === FUNCTION, this.customCallback)
        }
      }
    } else {
      this.logger.error('Invalid configurationGetter or configuration', configuration, this.configurationGetter);
    }
  }
}

module.exports = CronWorker;
