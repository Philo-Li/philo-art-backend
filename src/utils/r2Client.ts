import { S3Client } from '@aws-sdk/client-s3';
import config from '../config.js';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: config.r2Endpoint,
  credentials: {
    accessKeyId: config.r2AccessKeyId || '',
    secretAccessKey: config.r2SecretAccessKey || '',
  },
});

export const R2_BUCKET = config.r2Bucket || '';
export const CDN_DOMAIN = config.cdnDomain || '';
