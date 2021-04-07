import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

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
    ssl: { rejectUnauthorized: false },
  };
}

export default {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  database: {
    client: 'pg',
    connection,
    pool: {
      min: 2,
      max: 6,
      createTimeoutMillis: 3000,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false, // <- default is true, set to false
    },
  },
  imagga: {
    apiUrl: process.env.IMAGGA_API_URL,
    apiKey: process.env.IMAGGA_API_KEY,
    apiSecret: process.env.IMAGGA_API_SECRET,
  },
  pexels: {
    apiSecret: process.env.PEXEL_CLIENT_SECRET,
  },
};
