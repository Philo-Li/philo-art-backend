import { GraphQLError } from 'graphql';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import config from '../config.js';

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

  if (!photoId) {
    throw new GraphQLError('PhotoId is not defined', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageKey,
  });

  const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 60 });
  return uploadURL;
};

export default generateUploadURL;
