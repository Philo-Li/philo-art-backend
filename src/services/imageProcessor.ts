import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET, CDN_DOMAIN } from '../utils/r2Client.js';

export interface ProcessedImages {
  imageKey: string;
  original: string;
  large: string;
  small: string;
  tiny: string;
}

const SIZES = [
  { name: '1200x1200', width: 1200, height: 1200 },
  { name: '700x700', width: 700, height: 700 },
  { name: '300x300', width: 300, height: 300 },
] as const;

export async function processAndUploadImage(
  imageBuffer: Buffer,
  imageKey: string,
  contentType: string
): Promise<ProcessedImages> {
  // Upload original image
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: `original/${imageKey}`,
      Body: imageBuffer,
      ContentType: contentType,
    })
  );

  // Generate and upload resized versions
  for (const size of SIZES) {
    const resized = await sharp(imageBuffer)
      .resize(size.width, size.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: `${size.name}/${imageKey}`,
        Body: resized,
        ContentType: 'image/jpeg',
      })
    );
  }

  return {
    imageKey,
    original: `${CDN_DOMAIN}/original/${imageKey}`,
    large: `${CDN_DOMAIN}/1200x1200/${imageKey}`,
    small: `${CDN_DOMAIN}/700x700/${imageKey}`,
    tiny: `${CDN_DOMAIN}/300x300/${imageKey}`,
  };
}
