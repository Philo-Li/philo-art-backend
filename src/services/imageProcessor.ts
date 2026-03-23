import sharp from 'sharp';
import exifReader from 'exif-reader';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET, CDN_DOMAIN } from '../utils/r2Client.js';

export interface ExifInfo {
  width: number | null;
  height: number | null;
  cameraMake: string | null;
  cameraModel: string | null;
  lens: string | null;
  focalLength: number | null;
  aperture: number | null;
  shutterSpeed: string | null;
  iso: number | null;
  dateTaken: string | null;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  raw: Record<string, unknown> | null;
}

export interface ProcessedImages {
  imageKey: string;
  original: string;
  large: string;
  small: string;
  tiny: string;
  tinyBase64: string | null;
  exif: ExifInfo | null;
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

  // Generate and upload resized versions, capture tiny for AI analysis
  let tinyBuffer: Buffer | null = null;
  for (const size of SIZES) {
    const resized = await sharp(imageBuffer)
      .resize(size.width, size.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    if (size.name === '300x300') {
      tinyBuffer = resized;
    }

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: `${size.name}/${imageKey}`,
        Body: resized,
        ContentType: 'image/jpeg',
      })
    );
  }

  // Extract EXIF metadata
  const exif = await extractExif(imageBuffer);
  const tinyBase64 = tinyBuffer
    ? `data:image/jpeg;base64,${tinyBuffer.toString('base64')}`
    : null;

  return {
    imageKey,
    original: `${CDN_DOMAIN}/original/${imageKey}`,
    large: `${CDN_DOMAIN}/1200x1200/${imageKey}`,
    small: `${CDN_DOMAIN}/700x700/${imageKey}`,
    tiny: `${CDN_DOMAIN}/300x300/${imageKey}`,
    tinyBase64,
    exif,
  };
}

function formatShutterSpeed(exposureTime: number): string {
  if (exposureTime >= 1) {
    return `${exposureTime}s`;
  }
  const denominator = Math.round(1 / exposureTime);
  return `1/${denominator}`;
}

function convertGpsCoordinate(
  ref: string,
  coord: number[]
): number | null {
  if (!coord || coord.length < 3) return null;
  const [degrees, minutes, seconds] = coord;
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (ref === 'S' || ref === 'W') {
    decimal = -decimal;
  }
  return Math.round(decimal * 1000000) / 1000000;
}

async function extractExif(imageBuffer: Buffer): Promise<ExifInfo | null> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const info: ExifInfo = {
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      cameraMake: null,
      cameraModel: null,
      lens: null,
      focalLength: null,
      aperture: null,
      shutterSpeed: null,
      iso: null,
      dateTaken: null,
      gpsLatitude: null,
      gpsLongitude: null,
      raw: null,
    };

    if (!metadata.exif) {
      return info;
    }

    const exifData = exifReader(metadata.exif);
    info.raw = exifData as unknown as Record<string, unknown>;

    // Camera info
    if (exifData.Image) {
      info.cameraMake = exifData.Image.Make?.trim() ?? null;
      info.cameraModel = exifData.Image.Model?.trim() ?? null;
    }

    // Photo settings
    if (exifData.Photo) {
      info.focalLength = exifData.Photo.FocalLength ?? null;
      info.aperture = exifData.Photo.FNumber ?? null;
      info.iso = Array.isArray(exifData.Photo.ISOSpeedRatings)
        ? exifData.Photo.ISOSpeedRatings[0]
        : (exifData.Photo.ISOSpeedRatings ?? null);

      if (exifData.Photo.ExposureTime) {
        info.shutterSpeed = formatShutterSpeed(exifData.Photo.ExposureTime);
      }

      if (exifData.Photo.DateTimeOriginal instanceof Date) {
        info.dateTaken = exifData.Photo.DateTimeOriginal.toISOString();
      }

      info.lens = exifData.Photo.LensModel?.trim() ?? null;
    }

    // GPS info
    if (exifData.GPSInfo) {
      const gps = exifData.GPSInfo;
      if (gps.GPSLatitude && gps.GPSLatitudeRef) {
        info.gpsLatitude = convertGpsCoordinate(
          gps.GPSLatitudeRef,
          gps.GPSLatitude as unknown as number[]
        );
      }
      if (gps.GPSLongitude && gps.GPSLongitudeRef) {
        info.gpsLongitude = convertGpsCoordinate(
          gps.GPSLongitudeRef,
          gps.GPSLongitude as unknown as number[]
        );
      }
    }

    return info;
  } catch (err) {
    console.error('EXIF extraction failed:', err);
    return null;
  }
}
