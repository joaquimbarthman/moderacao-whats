'use strict';

const path = require('node:path');

const projectRoot = path.join(__dirname, '..');
const dataDirectory = path.resolve(process.env.DATA_PATH || path.join(projectRoot, 'data'));
const authDirectory = path.resolve(process.env.AUTH_PATH || path.join(projectRoot, '.wwebjs_auth'));

function dataFile(name) {
  return path.join(dataDirectory, name);
}

module.exports = { dataDirectory, authDirectory, dataFile };
