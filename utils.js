const loadJsonFile = require('load-json-file');

const CONFIGURATION_FILE = process.env.CONFIGURATION_FILE || './configuration.json';

async function readConfigurationFile() {
  return loadJsonFile(CONFIGURATION_FILE);
}

module.exports = {
  readConfigurationFile: readConfigurationFile
};
