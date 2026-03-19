import { Router, Request, Response } from 'express';
import multer from 'multer';
import { nanoid } from 'nanoid';
import createAuthService from '../utils/authService.js';
import { processAndUploadImage } from '../services/imageProcessor.js';

const router: ReturnType<typeof Router> = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.post('/:photoId?', upload.single('image'), async (req: Request, res: Response) => {
  try {
    // Verify authorization
    const authorization = req.headers.authorization;
    const accessToken = authorization?.split(' ')[1];
    const authService = createAuthService({ accessToken });
    const userId = authService.getUserId();

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const photoId = req.params.photoId || nanoid();
    const hash = Math.floor(Math.random() * 16).toString(16);
    const imageKey = `${hash}/${photoId}.jpg`;

    const urls = await processAndUploadImage(
      file.buffer,
      imageKey,
      file.mimetype || 'image/jpeg'
    );

    res.json(urls);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
