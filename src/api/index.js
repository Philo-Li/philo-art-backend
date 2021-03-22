import Router from 'koa-router';

import photos from './photos';

const router = new Router();

router.use('/photos', photos.routes());

export default router;
