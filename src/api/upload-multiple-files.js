const Koa = require('koa');
const Router = require('@koa/router');
const multer = require('@koa/multer');

const app = new Koa();
const router = new Router();
const upload = multer(); // note you can pass `multer` options here

// add a route for uploading multiple files
router.post(
  '/upload-multiple-files',
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1
    },
    {
      name: 'boop',
      maxCount: 2
    }
  ]),
  ctx => {
    console.log('ctx.request.files', ctx.request.files);
    console.log('ctx.files', ctx.files);
    console.log('ctx.request.body', ctx.request.body);
    ctx.body = 'done';
  }
);

export default router;
