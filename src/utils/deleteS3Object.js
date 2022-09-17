/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
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

const deleteS3Object = async (imageKey) => {
  const params = ({
    Bucket: bucketName,
    Key: imageKey,
  });

  if (!imageKey) return null;

  // console.log('delete', imageKey);
  s3.deleteObject(params, (err, data) => {
    if (err) console.log(err, err.stack); // an error occurred
    else console.log(data); // successful response
  });

  return true;
};

export default deleteS3Object;
