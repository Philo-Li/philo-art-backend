require('dotenv').config();

let connection;

if (process.env.NODE_ENV === 'development') {
  connection = process.env.DEV_PG_CONNECTION_STRING;
} else if (process.env.NODE_ENV === 'test') {
  connection = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DBNAME_TEST,
  };
} else if (process.env.NODE_ENV == 'stage') {
  connection = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DBNAME,
  };
} else if (process.env.NODE_ENV === 'production') {
  connection = {
    host: process.env.AWS_PG_HOST,
    port: process.env.AWS_PG_PORT,
    user: process.env.AWS_PG_USER,
    password: process.env.AWS_PG_PASSWORD,
    database: process.env.AWS_PG_DBNAME,
  };
}

module.exports = {
  client: 'pg',
  connection,
};
