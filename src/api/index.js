import Router from 'koa-router';

import kaboompics from './kaboompics';
import pexels from './pexels';

const router = new Router();

router.use('/kaboompics', kaboompics.routes());

router.use('/pexels', pexels.routes());

export default router;
