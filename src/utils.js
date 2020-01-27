const loadJsonFile = require('load-json-file');
const path = require('path');

const CONFIGURATION_FILE = process.env.CONFIGURATION_FILE || path.resolve(__dirname, '../configuration/configuration.json');;

async function readConfigurationFile() {
  return loadJsonFile(CONFIGURATION_FILE);
}

module.exports = {
  readConfigurationFile: readConfigurationFile
};
