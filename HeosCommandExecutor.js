const heos = require('heos-api');

const HEOS_SUCCESS_STRING = 'success';
const OBJECT = 'object';

class HeosCommandExecutor {
  constructor({logger}) {
    this.logger = logger && typeof logger === OBJECT ? logger : () => {};
    this.ipAddress = null;
    this.connection = null;
    this.command = null;
    this.payload = null;

    this._handleCommandResponse = this._handleCommandResponse.bind(this);
    this.executeCommand = this.executeCommand.bind(this);
  }

  _getStringifyedCommand() {
    return JSON.stringify(this.command, null, 2);
  }

  _getStringifyedPayload() {
    return JSON.stringify(this.payload, null, 2);
  }

  async _handleCommandResponse(response) {
    this.connection && await this.connection.close();
    const logMessageEnd = `command\n${this._getStringifyedCommand()}\nto player ${this.ipAddress} with payload\n${this._getStringifyedPayload()}\nresponse:\n${JSON.stringify(response, null, 2)}`;

    if (response && response.heos && response.heos.result && response.heos.result.toLowerCase() === HEOS_SUCCESS_STRING) {
      this.logger.info(`Successfully sent ${logMessageEnd}`);
    } else {
      this.logger.error(`Failed to send ${logMessageEnd}`);
    }
  }

  async setupConnection({ipAddress}) {
    this.ipAddress = ipAddress;
    this.connection = await heos.connect(this.ipAddress);

    this.connection && this.logger.info(`Connected to player with IP address ${this.ipAddress}`);
  }

  executeCommand({command, payload}) {
    this.command = command;
    this.payload = payload;

    this.connection.once(
      this.command,
      this._handleCommandResponse
    );

    this.logger.info(`Executing command\n${this._getStringifyedCommand()}\nto player ${this.ipAddress} with payload\n${this._getStringifyedPayload()}`);
    this.connection.write(
      this.command.commandGroup,
      this.command.command,
      this.payload
    );
  }
}

module.exports = HeosCommandExecutor;
