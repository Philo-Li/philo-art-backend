import Router from 'koa-router';

const superagent = require('superagent');
const cheerio = require('cheerio');

const router = new Router();

const getPhotos = (res) => {
  const allPhotos = [];

  const $ = cheerio.load(res.text);

  $('article').each((idx, ele) => {
    // const small = $(ele).find('img[class=work-img]').attr('alt');
    // const photo = {
    //   download: $(ele).attr('href'),
    //   tags: $(ele).attr('title'),
    //   small: $(ele).find('img[class=work-img]').attr('alt'),
    //   large: $(ele).find('img[class=work-img]').attr('alt'),
    // };
    const photo = {
      width: null,
      height: null,
      tiny: null,
      small: $(ele).find('img[class=work-img]').attr('alt'),
      large: $(ele).find('img[class=work-img]').attr('alt'),
      // downloadPage: $(ele).attr('href'),
      // tags: $(ele).attr('title'),
      creditWeb: 'Pexels',
      creditId: $(ele).attr('data-photo-modal-medium-id'),
      // description: $(ele).attr('title'),
      photographer: null,
    };
    allPhotos.push(photo);
  });
  return allPhotos;
};

function delay() {
  // `delay` returns a promise
  return new Promise(((resolve) => {
    // Only `delay` is able to resolve or reject the promise
    setTimeout(() => {
      resolve(42); // After 3 seconds, resolve the promise with value 42
    }, 3000);
  }));
}

const getPexels = async () => {
  let temp = [];

  await superagent.get('https://www.pexels.com/search/dog')
    .end(async (err, response) => {
      // if (err) {
      //   console.log(err);
      // } else {
      temp = getPhotos(response);
      // }
      console.log(temp, response);
      return temp;
    });
  await delay();
  return temp;
};

router.get('/:query', async (ctx) => {
  const { query } = ctx.params;
  const re = await getPexels(query);
  ctx.body = {
    photos: re,
  };
});

export default router;
