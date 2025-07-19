require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool(); // uses .env variables

module.exports = pool;
