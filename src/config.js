import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

let connection;

if (process.env.NODE_ENV === 'development') {
  connection = {
    host: process.env.AWS_PG_HOST,
    port: process.env.AWS_PG_PORT,
    user: process.env.AWS_PG_USER,
    password: process.env.AWS_PG_PASSWORD,
    database: process.env.AWS_PG_DBNAME_DEV,
    migrations: {
      tableName: 'migrations',
    },
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

export default {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  database: {
    client: 'pg',
    connection,
  },
  imagga: {
    apiUrl: process.env.IMAGGA_API_URL,
    apiKey: process.env.IMAGGA_API_KEY,
    apiSecret: process.env.IMAGGA_API_SECRET,
  },
  pexels: {
    apiSecret: process.env.PEXEL_CLIENT_SECRET,
  },
  awsRegion: process.env.REACT_APP_AWS_REGION,
  awsS3Bucket: process.env.REACT_APP_AWS_S3_BUCKET,
  awsAccessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
};
