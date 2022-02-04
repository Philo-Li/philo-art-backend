const Koa = require('koa');
const Router = require('koa-router');
const multer = require('@koa/multer');

const router = new Router();

const storage = multer.diskStorage({
  destination:'public/uploads/'+new Date().getFullYear() + (new Date().getMonth()+1) + new Date().getDate(),
  filename(ctx,file,cb){
    const filenameArr = file.originalname.split('.');
    cb(null,Date.now() + '.' + filenameArr[filenameArr.length-1]);
  }
});

const upload = multer({storage});
// const upload = multer(); // note you can pass `multer` options here

// add a route for uploading multiple files
router.post(
  '/upload-single-file',
  upload.single('file'),
  ctx => {
    console.log('ctx.request.file', ctx.request.file);
    console.log('ctx.file', ctx.file);
    console.log('ctx.request.body', ctx.request.body);
    ctx.body = 'done';
  }
);

export default router;
