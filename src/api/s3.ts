import { GraphQLError } from 'graphql';
import aws from 'aws-sdk';
import config from '../config.js';

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

const generateUploadURL = async (photoId: string): Promise<string> => {
  const hexRef = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
  ];
  const hash = hexRef[Math.floor(Math.random() * 16)];
  const destination = `${hash}`;
  const imageKey = `${destination}/${photoId}.jpg`;

  const params = {
    Bucket: bucketName,
    Key: imageKey,
    Expires: 60,
  };

  if (!photoId) {
    throw new GraphQLError('PhotoId is not defined', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const uploadURL = s3.getSignedUrl('putObject', params);
  return uploadURL;
};

export default generateUploadURL;
