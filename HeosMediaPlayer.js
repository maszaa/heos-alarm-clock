const heos = require('heos-api');

const HEOS_COMMAND_GROUP = 'browse';
const HEOS_COMMAND = 'play_stream';
const HEOS_SUCCESS_STRING = 'success';
const OBJECT = 'object';

class HeosMediaPlayer {
  constructor({ipAddress, playerId, mediaUrl, logger}) {
    this.ipAddress = ipAddress
    this.playerId = playerId;
    this.mediaUrl = mediaUrl;
    this.logger = logger && typeof logger === OBJECT ? logger : () => {};
    this.connection = null;

    this._handlePlayMedia = this._handlePlayMedia.bind(this);
    this.playMedia = this.playMedia.bind(this);
  }

  async _handlePlayMedia(response) {
    this.connection && await this.connection.close();
    const strResponse = JSON.stringify(response, null, 2);

    if (response && response.heos && response.heos.result && response.heos.result.toLowerCase() === HEOS_SUCCESS_STRING) {
      this.logger.info(`Successfully started playing url ${this.mediaUrl} with player ${this.ipAddress} (pid: ${this.playerId})\n${strResponse}`);
    } else {
      this.logger.error(`Failed to play media url ${this.mediaUrl} with player ${this.ipAddress} (pid: ${this.playerId})\n${strResponse}`);
    }
  }

  async setupConnection() {
    this.connection = await heos.connect(this.ipAddress);
    this.connection.once(
      {
        commandGroup: HEOS_COMMAND_GROUP,
        command: HEOS_COMMAND
      },
      this._handlePlayMedia
    )
  }

  playMedia() {
    this.logger.info(`Starting to play url ${this.mediaUrl} with player ${this.ipAddress} (pid: ${this.playerId})`);

    this.connection.write(
      HEOS_COMMAND_GROUP,
      HEOS_COMMAND,
      {
        pid: this.playerId,
        url: this.mediaUrl
      }
    );
  }
}

module.exports = HeosMediaPlayer;
