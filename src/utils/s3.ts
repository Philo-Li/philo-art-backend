import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import config from '../config.js';

const randomBytesAsync = promisify(randomBytes);

const bucketName = config.awsS3Bucket;
const region = config.awsRegion;
const accessKeyId = config.awsAccessKeyId;
const secretAccessKey = config.awsSecretAccessKey;

const s3Client = new S3Client({
  region: region || 'us-west-2',
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

const generateUploadURL = async (): Promise<string> => {
  const rawBytes = await randomBytesAsync(16);
  const imageName = rawBytes.toString('hex');
  const now = new Date();
  const destination = `user-uploads/${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;
  const imageKey = `${destination}/${imageName}.jpg`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageKey,
  });

  const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 60 });
  return uploadURL;
};

export default generateUploadURL;
