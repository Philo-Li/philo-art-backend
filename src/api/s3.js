import { UserInputError } from 'apollo-server';
import aws from 'aws-sdk';
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

const generateUploadURL = async (photoId) => {
  const hexRef = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  const hash = hexRef[Math.floor(Math.random() * 16)];
  const destination = `${hash}`;
  const imageKey = `${destination}/${photoId}.jpg`;

  const params = ({
    Bucket: bucketName,
    Key: imageKey,
    Expires: 60,
  });

  if (!photoId) {
    throw new UserInputError('PhotoId is not defined');
  }

  const uploadURL = s3.getSignedUrl('putObject', params);
  return uploadURL;
};

export default generateUploadURL;
