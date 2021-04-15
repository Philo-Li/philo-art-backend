import Router from 'koa-router';

import kaboompics from './kaboompics';
import burst from './burst';
import picography from './picography';
import pixabay from './pixabay';
import pexels from './pexels';

const router = new Router();

router.use('/kaboompics', kaboompics.routes());

router.use('/burst', burst.routes());

router.use('/picography', picography.routes());

// web scrapping fobidden
router.use('/pixabay', pixabay.routes());

router.use('/pexels', pexels.routes());

export default router;
