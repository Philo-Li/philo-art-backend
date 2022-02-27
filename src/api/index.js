import Router from 'koa-router';

import kaboompics from './kaboompics';
import burst from './burst';
import picography from './picography';
import pixabay from './pixabay';
import pexels from './pexels';
import generateUploadURL from './s3';

const router = new Router();

router.use('/kaboompics', kaboompics.routes());

router.use('/burst', burst.routes());

// CDN fobidden, can't show photos
router.use('/picography', picography.routes());

// web scrapping fobidden
router.use('/pixabay', pixabay.routes());

// web scrapping fobidden
router.use('/pexels', pexels.routes());

router.get('/s3Url/:photoId', async (res) => {
  const { photoId } = res.params;
  const url = await generateUploadURL(photoId);
  res.body = {
    url,
  };
});

export default router;
