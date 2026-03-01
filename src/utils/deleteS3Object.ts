import aws from 'aws-sdk';
import config from '../config.js';

const bucketName = config.awsS3Bucket;
const bucketNameCdn = config.awsS3BucketCdn;
const region = config.awsRegion;
const accessKeyId = config.awsAccessKeyId;
const secretAccessKey = config.awsSecretAccessKey;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: 'v4',
});

const deleteS3Object = async (imageKey: string | null): Promise<boolean> => {
  if (!imageKey) return false;

  const params = {
    Bucket: bucketName || '',
    Key: imageKey,
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (err) {
    console.error('Error deleting from main bucket:', err);
  }

  const photoSizes = ['300x300', '700x700', '1200x1200'];

  for (const size of photoSizes) {
    const cdnParams = {
      Bucket: bucketNameCdn || '',
      Key: `${size}/${imageKey}`,
    };

    try {
      await s3.deleteObject(cdnParams).promise();
    } catch (err) {
      console.error(`Error deleting ${size} from CDN bucket:`, err);
    }
  }

  return true;
};

export default deleteS3Object;
