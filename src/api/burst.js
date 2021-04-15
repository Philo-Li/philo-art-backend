import Router from 'koa-router';
import queryString from 'query-string';

const superagent = require('superagent');
const cheerio = require('cheerio');

const router = new Router();

const getPhotos = (res) => {
  const allPhotos = [];

  const $ = cheerio.load(res.text);

  $('#Main > section:nth-child(1) > div.grid.gutter-bottom > div > div > div').each((idx, ele) => {
    const title = $(ele).find('div:nth-child(1) > button').attr('data-photo-title');
    const smallUrl = $(ele).find('div:nth-child(1) > button').attr('data-modal-image-url');
    const downloadUrl = $(ele).find('div:nth-child(1) > a').attr('href');
    const photographerName = $(ele).find('div:nth-child(2) > div').attr('data-author-name');
    const temp = $(ele).find('img').attr('data-srcset');
    // // const tiny = $(ele).find('img').attr('data-src');
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
      tiny: temp2[0],
      small: smallUrl,
      large: temp2[1],
      downloadPage: `https://burst.shopify.com${downloadUrl}`,
      tags: title,
      creditWeb: 'burst',
      creditId: 'https://burst.shopify.com/',
      description: title,
      photographer: photographerName,
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
    }, 5000);
  }));
}

const getBurst = async (page, query) => {
  let temp = [];

  await superagent.get(`https://burst.shopify.com/photos/search?page=${page}&q=${query}`)
    .end(async (err, response) => {
      if (err) {
        // eslint-disable-next-line no-console
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
  const parsed = queryString.parse(query);
  const re = await getBurst(parsed.page, parsed.q);
  ctx.body = {
    photos: re.length < 1 ? undefined : re,
  };
});

export default router;
