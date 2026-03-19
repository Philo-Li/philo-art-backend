import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET } from './r2Client.js';

const deleteR2Object = async (imageKey: string | null): Promise<boolean> => {
  if (!imageKey) return false;

  // Delete original
  try {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: `original/${imageKey}`,
      })
    );
  } catch (err) {
    console.error('Error deleting original from R2:', err);
  }

  // Delete all sizes
  const photoSizes = ['300x300', '700x700', '1200x1200'];

  for (const size of photoSizes) {
    try {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET,
          Key: `${size}/${imageKey}`,
        })
      );
    } catch (err) {
      console.error(`Error deleting ${size} from R2:`, err);
    }
  }

  return true;
};

export default deleteR2Object;
