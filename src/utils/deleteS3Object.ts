import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import config from '../config.js';

const bucketName = config.awsS3Bucket;
const bucketNameCdn = config.awsS3BucketCdn;
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

const deleteS3Object = async (imageKey: string | null): Promise<boolean> => {
  if (!imageKey) return false;

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName || '',
        Key: imageKey,
      })
    );
  } catch (err) {
    console.error('Error deleting from main bucket:', err);
  }

  const photoSizes = ['300x300', '700x700', '1200x1200'];

  for (const size of photoSizes) {
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketNameCdn || '',
          Key: `${size}/${imageKey}`,
        })
      );
    } catch (err) {
      console.error(`Error deleting ${size} from CDN bucket:`, err);
    }
  }

  return true;
};

export default deleteS3Object;
