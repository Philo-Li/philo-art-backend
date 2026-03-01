import aws from 'aws-sdk';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import config from '../config.js';

const randomBytesAsync = promisify(randomBytes);

const bucketName = config.awsS3Bucket;
const region = config.awsRegion;
const accessKeyId = config.awsAccessKeyId;
const secretAccessKey = config.awsSecretAccessKey;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4',
});

const generateUploadURL = async (): Promise<string> => {
  const rawBytes = await randomBytesAsync(16);
  const imageName = rawBytes.toString('hex');
  const now = new Date();
  const destination = `user-uploads/${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}`;
  const imageKey = `${destination}/${imageName}.jpg`;

  const params = {
    Bucket: bucketName,
    Key: imageKey,
    Expires: 60,
  };

  const uploadURL = await s3.getSignedUrlPromise('putObject', params);
  return uploadURL;
};

export default generateUploadURL;
