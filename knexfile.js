require('dotenv').config();

let connection;

if (process.env.NODE_ENV === 'development') {
  connection = process.env.DEV_PG_CONNECTION_STRING;
} else if (process.env.NODE_ENV === 'test') {
  connection = process.env.TEST_PG_CONNECTION_STRING;
} else if (process.env.NODE_ENV === 'production') {
  connection = {
    host: process.env.HEROKU_host,
    port: process.env.HEROKU_port,
    user: process.env.HEROKU_user,
    password: process.env.HEROKU_password,
    database: process.env.HEROKU_dbname,
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
