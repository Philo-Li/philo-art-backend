require('dotenv').config();

let PG_CONNECTION_STRING;

if (process.env.NODE_ENV === 'development') {
  PG_CONNECTION_STRING = process.env.DEV_PG_CONNECTION_STRING;
} else if (process.env.NODE_ENV === 'production') {
  PG_CONNECTION_STRING = process.env.PG_CONNECTION_STRING;
}

module.exports = {
  client: 'pg',
  connection: PG_CONNECTION_STRING,
};

// module.exports = {
//   client: 'sqlite3',
//   connection: {
//     filename: process.env.DATABASE_FILENAME,
//   },
//   useNullAsDefault: true,
//   seeds: {
//     direcotry: './seeds',
//   },
// };
