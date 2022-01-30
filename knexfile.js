require('dotenv').config();

let connection;

if (process.env.NODE_ENV === 'test') {
  
} else if (process.env.NODE_ENV == 'development') {
  connection = {
    host: process.env.AWS_PG_HOST,
    port: process.env.AWS_PG_PORT,
    user: process.env.AWS_PG_USER,
    password: process.env.AWS_PG_PASSWORD,
    database: process.env.AWS_PG_DBNAME,
    migrations: {
      tableName: 'migrations'
    }
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
