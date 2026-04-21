const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Ошибка подключения к БД:', err.message);
    process.exit(1);
  } else {
    console.log('PostgreSQL подключена');
    release();
  }
});

module.exports = pool;