require('dotenv').config();

let connection;

if (process.env.NODE_ENV === 'development') {
  connection = process.env.DEV_PG_CONNECTION_STRING;
} else if (process.env.NODE_ENV === 'test') {
  connection = process.env.TEST_PG_CONNECTION_STRING;
} else if (process.env.NODE_ENV === 'production') {
  connection = {
    host: process.env.HEROKU_HOST,
    port: process.env.HEROKU_PORT,
    user: process.env.HEROKU_USER,
    password: process.env.HEROKU_PASSWORD,
    database: process.env.HEROKU_DBNAME,
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  };
}

module.exports = {
  client: 'pg',
  connection,
};
