/**
 * Backfill SEO slugs for existing photos using AI image analysis.
 *
 * Usage: npx tsx src/scripts/backfill-slugs.ts [--batch-size 10] [--dry-run]
 */

import { PrismaClient } from '@prisma/client';
import config from '../config.js';

const QWEN_API_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const MODEL = 'qwen-vl-plus';

const prisma = new PrismaClient();

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const batchSizeIdx = args.indexOf('--batch-size');
const BATCH_SIZE = batchSizeIdx !== -1 ? parseInt(args[batchSizeIdx + 1], 10) : 10;

function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200);
}

async function downloadAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  return `data:${contentType};base64,${buffer.toString('base64')}`;
}

async function generateSlugFromUrl(imageUrl: string): Promise<string> {
  const base64 = await downloadAsBase64(imageUrl);
  return generateSlug(base64);
}

async function generateSlug(imageUrl: string): Promise<string> {
  const apiKey = config.dashscopeApiKey;
  if (!apiKey) throw new Error('DASHSCOPE_API_KEY not set');

  const prompt = `Describe this image in a single SEO-friendly English phrase for a URL slug. Use 5-12 lowercase words separated by hyphens. Be specific and descriptive about the actual content. Examples: "aerial-view-of-turquoise-ocean-waves-hitting-rocky-coastline", "close-up-of-orange-tabby-cat-sleeping-on-wooden-bench". Only return the slug, nothing else.`;

  // Add timeout to prevent hanging on slow CDN downloads
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  const response = await fetch(`${QWEN_API_BASE}/chat/completions`, {
    signal: controller.signal,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            { type: 'text', text: prompt },
          ],
        },
      ],
      max_tokens: 128,
    }),
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as { choices?: { message: { content: string } }[] };
  const raw = data.choices?.[0]?.message?.content?.trim() || '';
  return sanitizeSlug(raw);
}

async function ensureUniqueSlug(slug: string, photoId: string): Promise<string> {
  if (!slug) return '';
  const existing = await prisma.photo.findFirst({
    where: { slug, id: { not: photoId } },
  });
  return existing ? `${slug}-${photoId.slice(-6)}` : slug;
}

async function main() {
  const photos = await prisma.photo.findMany({
    where: { slug: null },
    select: { id: true, title: true, srcTiny: true, srcSmall: true },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Found ${photos.length} photos without slugs.`);
  if (dryRun) console.log('DRY RUN — no updates will be made.\n');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    const batch = photos.slice(i, i + BATCH_SIZE);

    for (const photo of batch) {
      // Prefer tiny for faster download by AI API
      const imageUrl = photo.srcTiny || photo.srcSmall;
      if (!imageUrl) {
        console.log(`  [${success + failed + 1}/${photos.length}] ${photo.id} — no image URL, skipping`);
        failed++;
        continue;
      }

      try {
        // Convert image to base64 to avoid CDN download issues from AI API
        const slug = await generateSlugFromUrl(imageUrl);
        const uniqueSlug = await ensureUniqueSlug(slug, photo.id);

        if (!uniqueSlug) {
          console.log(`  [${success + failed + 1}/${photos.length}] ${photo.id} — empty slug, skipping`);
          failed++;
          continue;
        }

        if (!dryRun) {
          await prisma.photo.update({
            where: { id: photo.id },
            data: { slug: uniqueSlug },
          });
        }

        console.log(`  [${success + failed + 1}/${photos.length}] ${photo.id} -> ${uniqueSlug}`);
        success++;
      } catch (err) {
        const msg = (err as Error).message;
        console.error(`  [${success + failed + 1}/${photos.length}] ${photo.id} — ERROR: ${msg}`);
        failed++;
      }
    }

    // Rate limit: pause between batches
    if (i + BATCH_SIZE < photos.length) {
      console.log(`  ... pausing 2s before next batch ...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
