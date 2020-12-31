import Router from 'koa-router';

import articles from './articles';

const router = new Router();

router.use('/articles', articles.routes());

export default router;
