const CronJob = require('cron').CronJob;

const FUNCTION = 'function';
const OBJECT = 'object';

class CronWorker {
  constructor({configurationCheckCrontab, configurationGetter, customCallback, logger}) {
    this.configurationCheckCrontab = configurationCheckCrontab;
    this.configurationGetter = configurationGetter;
    this.customCallback = customCallback;
    this.cronJobs = {
      configurationCheck: null,
      custom: {}
    };
    this.logger = logger && typeof logger === OBJECT ? logger : () => {};

    this._initializeConfigurationCheck = this._initializeConfigurationCheck.bind(this);
    this._updateCustomCronjobs = this._updateCustomCronjobs.bind(this);
    this._deleteObsoleteCustomCronjobs = this._deleteObsoleteCustomCronjobs.bind(this);
    this._update = this._update.bind(this);

    this._initializeConfigurationCheck();
  }

  _initializeConfigurationCheck() {
    if (this.cronJobs.configurationCheck) this.cronJobs.configurationCheck.stop();

    this.cronJobs.configurationCheck = new CronJob(this.configurationCheckCrontab, this._update);
    this.cronJobs.configurationCheck.start();
    this.logger.info(`Initialized configuration check cronjob with crontab ${this.configurationCheckCrontab}`);
  }

  _updateCustomCronjobs({configuration, crontabs}) {
    crontabs.forEach(async (crontab) => {
      if (this.cronJobs.custom[crontab] && configuration.cron[crontab] !== this.cronJobs.custom[crontab].cronTime.source) {
        this.logger.warn(`${crontab} crontab changed (${configuration.cron[crontab]} !== ${this.cronJobs.custom[crontab].cronTime.source}), stopping previous ${crontab} cronjob`);

        this.cronJobs.custom[crontab].stop();
        delete this.cronJobs.custom[crontab];
      }

      if (!this.cronJobs.custom[crontab]) {
        if (this.customCallback && typeof this.customCallback === FUNCTION) {
          this.cronJobs.custom[crontab] = new CronJob(configuration.cron[crontab], this.customCallback);
          this.cronJobs.custom[crontab].start();

          this.logger.info(`Initialized ${crontab} cronjob with crontab`, JSON.stringify(this.cronJobs.custom[crontab].cronTime, null, 2));
        } else {
          this.logger.error('Invalid custom callback', 'typeof this.customCallback === FUNCTION', typeof this.customCallback === FUNCTION, this.customCallback)
        }
      }
    })
  }

  _deleteObsoleteCustomCronjobs(crontabs) {
    const customCronjobsToBeDeleted = Object.keys(this.cronJobs.custom).filter(cronjob => !crontabs.includes(cronjob));

    customCronjobsToBeDeleted.forEach(cronjob => {
      this.logger.warn(`Stoppind and deleting custom cronjob ${cronjob}`);

      this.cronJobs.custom[cronjob].stop();
      delete this.cronJobs.custom[cronjob];

      this.logger.warn(`Stopped and deleted custom cronjob ${cronjob}`);
    });
  }

  async _update() {
    const configuration = this.configurationGetter && typeof this.configurationGetter === FUNCTION && await this.configurationGetter();

    if (configuration && configuration.cron) {
      const crontabs = Object.keys(configuration.cron);

      this._updateCustomCronjobs({
        configuration,
        crontabs
      });
      this._deleteObsoleteCustomCronjobs(crontabs);
    } else {
      this.logger.error('Invalid configurationGetter or configuration', configuration, this.configurationGetter);
    }
  }
}

module.exports = CronWorker;
