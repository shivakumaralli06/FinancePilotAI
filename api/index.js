const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const app = require('../server/index');

module.exports = app;
