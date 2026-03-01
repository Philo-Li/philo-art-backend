import { Router, Request, Response } from 'express';

import kaboompics from './kaboompics.js';
import burst from './burst.js';
import picography from './picography.js';
import pixabay from './pixabay.js';
import pexels from './pexels.js';
import generateUploadURL from './s3.js';

const router: ReturnType<typeof Router> = Router();

router.use('/kaboompics', kaboompics);
router.use('/burst', burst);
router.use('/picography', picography);
router.use('/pixabay', pixabay);
router.use('/pexels', pexels);

router.get('/s3Url/:photoId', async (req: Request, res: Response) => {
  const photoId = req.params.photoId as string;
  const url = await generateUploadURL(photoId);
  res.json({
    url,
  });
});

export default router;
