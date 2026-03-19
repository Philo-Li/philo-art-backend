import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

interface DatabaseConnection {
  host: string | undefined;
  port: string | undefined;
  user: string | undefined;
  password: string | undefined;
  database: string | undefined;
}

interface Config {
  port: number;
  jwtSecret: string;
  databaseUrl: string;
  imagga: {
    apiUrl: string | undefined;
    apiKey: string | undefined;
    apiSecret: string | undefined;
  };
  pexels: {
    apiSecret: string | undefined;
  };
  awsRegion: string | undefined;
  awsS3Bucket: string | undefined;
  awsS3BucketCdn: string | undefined;
  awsAccessKeyId: string | undefined;
  awsSecretAccessKey: string | undefined;
  // Cloudflare R2 configuration
  r2AccountId: string | undefined;
  r2AccessKeyId: string | undefined;
  r2SecretAccessKey: string | undefined;
  r2Bucket: string | undefined;
  r2Endpoint: string | undefined;
  cdnDomain: string | undefined;
  // Qwen (DashScope) configuration
  dashscopeApiKey: string | undefined;
}

let connection: DatabaseConnection;

if (process.env.NODE_ENV === 'development') {
  connection = {
    host: process.env.AWS_PG_HOST,
    port: process.env.AWS_PG_PORT,
    user: process.env.AWS_PG_USER,
    password: process.env.AWS_PG_PASSWORD,
    database: process.env.AWS_PG_DBNAME_DEV,
  };
} else {
  connection = {
    host: process.env.AWS_PG_HOST,
    port: process.env.AWS_PG_PORT,
    user: process.env.AWS_PG_USER,
    password: process.env.AWS_PG_PASSWORD,
    database: process.env.AWS_PG_DBNAME,
  };
}

const buildDatabaseUrl = (conn: DatabaseConnection): string => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  return `postgresql://${conn.user}:${conn.password}@${conn.host}:${conn.port}/${conn.database}`;
};

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  databaseUrl: buildDatabaseUrl(connection),
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
  awsS3BucketCdn: process.env.REACT_APP_AWS_S3_BUCKET_CDN,
  awsAccessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  // Cloudflare R2 configuration
  r2AccountId: process.env.R2_ACCOUNT_ID,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  r2Bucket: process.env.R2_BUCKET,
  r2Endpoint: process.env.R2_ENDPOINT,
  cdnDomain: process.env.CDN_DOMAIN,
  // Qwen (DashScope) configuration
  dashscopeApiKey: process.env.DASHSCOPE_API_KEY,
};

export default config;
