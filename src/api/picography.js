import Router from 'koa-router';
import queryString from 'query-string';

const superagent = require('superagent');
const cheerio = require('cheerio');

const router = new Router();

const getLargeUrl = async (url) => {
  const result = {
    largeUrl: null,
    tags: null,
  };

  await superagent.get(url)
    .end(async (err, response) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      } else {
        const $ = cheerio.load(response.text);
        $('article').each((idx, ele) => {
          result.largeUrl = $(ele).find('img').attr('src');
          result.tags = $(ele).find('img').attr('alt');
        });
      }
      return result;
    });
  // eslint-disable-next-line no-use-before-define
  await delay(2000);
  return result;
};

const getPhotos = (res) => {
  const allPhotos = [];

  const $ = cheerio.load(res.text);

  $('article').each(async (idx, ele) => {
    const title = $(ele).find('img').attr('title');
    const smallUrl = $(ele).find('img').attr('src');
    const downloadUrl = $(ele).find('div.single-photo-thumb > a').attr('href');
    const photographerName = $(ele).find('div.photo-meta > div > a').text();
    const moreInfo = await getLargeUrl(downloadUrl);

    const photo = {
      width: null,
      height: null,
      tiny: smallUrl,
      small: moreInfo.largeUrl || smallUrl,
      large: moreInfo.largeUrl || smallUrl,
      downloadPage: downloadUrl,
      tags: moreInfo.tags || title,
      creditWeb: 'picography',
      creditId: 'https://picography.co/',
      description: title,
      photographer: photographerName,
    };

    allPhotos.push(photo);
  });
  return allPhotos;
};

function delay(time) {
  // `delay` returns a promise
  return new Promise(((resolve) => {
    // Only `delay` is able to resolve or reject the promise
    setTimeout(() => {
      resolve(42); // After 3 seconds, resolve the promise with value 42
    }, time);
  }));
}

const getPicography = async (page, query) => {
  let temp = [];

  await superagent.get(`https://picography.co/search/${query}/page/${page}/`)
    .end(async (err, response) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      } else {
        temp = getPhotos(response);
      }
      return temp;
    });
  await delay(4000);
  return temp;
};

router.get('/:query', async (ctx) => {
  const { query } = ctx.params;
  const parsed = queryString.parse(query);
  const re = await getPicography(parsed.page, parsed.q);
  ctx.body = {
    photos: re.length < 1 ? undefined : re,
  };
});

export default router;
