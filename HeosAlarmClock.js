const heos = require('heos-api');

const logger = require('./logging');

const COMMAND_GROUP = 'browse';
const COMMAND = 'play_stream';
const SUCCESS_STRING = 'success';

class HeosAlarmClock {
  constructor({ipAddress, playerId, mediaUrl}) {
    this.ipAddress = ipAddress
    this.playerId = playerId;
    this.mediaUrl = mediaUrl;
    this.ready = false,

    this.error = null;
    this.connection = null;

    this._handlePlayMedia = this._handlePlayMedia.bind(this);
    this.playMedia = this.playMedia.bind(this);
  }

  async _handlePlayMedia(response) {
    await this.connection.close();

    if (response.heos.result.toLowerCase() !== SUCCESS_STRING) {
      logger.error({
        source: this.constructor.name,
        message: `Failed to play media url ${this.mediaUrl} with player ${this.ipAddress} (pid: ${this.playerId})\n${JSON.stringify(response, null, 2)}`
      });
    }
  }

  async setupConnection() {
    this.connection = await heos.connect(this.ipAddress);
    this.connection.once(
      {
        commandGroup: COMMAND_GROUP,
        command: COMMAND
      },
      this._handlePlayMedia
    )
  }

  playMedia() {
    this.connection.write(
      COMMAND_GROUP,
      COMMAND,
      {
        pid: this.playerId,
        url: this.mediaUrl
      }
    );
  }
}

module.exports = HeosAlarmClock;
