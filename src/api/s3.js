import aws from 'aws-sdk';
import { randomBytes } from 'crypto';
import config from '../config';

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

const generateUploadURL = async (userId) => {
  const rawBytes = await randomBytes(16);
  const imageName = rawBytes.toString('hex');
  const destination = `user/${userId}/uploads/${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}`;
  const imageKey = `${destination}/${imageName}.jpg`;

  const params = ({
    Bucket: bucketName,
    Key: imageKey,
    Expires: 60,
  });

  const uploadURL = await s3.getSignedUrl('putObject', params);
  return uploadURL;
};

export default generateUploadURL;
