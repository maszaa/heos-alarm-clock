const heos = require('heos-api');

const COMMAND_GROUP = 'browse';
const COMMAND = 'play_stream';
const SUCCESS_STRING = 'success';

class HeosAlarmClock {
  constructor({ipAddress, playerId, mediaUrl}) {
    this.ipAddress = ipAddress
    this.playerId = playerId;
    this.mediaUrl = mediaUrl;
    this.connection = null;

    this._handlePlayMedia = this._handlePlayMedia.bind(this);
  }

  _handlePlayMedia(response) {
    if (response.heos.result.toLowerCase() !== SUCCESS_STRING) {
      console.error(`Failed to play media url ${this.mediaUrl}`);
      console.error(response);
      process.exit(1);
    }
    process.exit(0)
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
    )
  }
}

module.exports = HeosAlarmClock;
