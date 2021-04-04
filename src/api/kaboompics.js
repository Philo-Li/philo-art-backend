import Router from 'koa-router';

const superagent = require('superagent');
const cheerio = require('cheerio');

const router = new Router();

const getPhotos = (res) => {
  const allPhotos = [];

  const $ = cheerio.load(res.text);

  $('ul#work-grid li div[class=work-img] a').each((idx, ele) => {
    const temp = $(ele).find('img').attr('data-srcset');
    const tiny = $(ele).find('img').attr('data-src');
    const temp1 = temp.split(',').splice(0, 2);
    const temp2 = [];
    for (let i = 0; i < 2; i += 1) {
      const a = temp1[i].trim();
      const b = a.slice(0, a.length - 3);
      temp2.push(b);
    }

    const photo = {
      width: null,
      height: null,
      tiny,
      small: temp2[0],
      large: temp2[1],
      downloadPage: $(ele).attr('href'),
      tags: $(ele).attr('title'),
      creditWeb: 'Kaboompics',
      creditId: $(ele).attr('href'),
      description: $(ele).attr('title'),
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

const getKaboompics = async (query) => {
  let temp = [];

  await superagent.get(`https://kaboompics.com/gallery?search=${query}&sortby=`)
    .end(async (err, response) => {
      if (err) {
        console.log(err);
      } else {
        temp = getPhotos(response);
      }
      return temp;
    });
  await delay();
  return temp;
};

router.get('/:query', async (ctx) => {
  const { query } = ctx.params;
  const re = await getKaboompics(query);
  ctx.body = {
    photos: re,
  };
});

export default router;
