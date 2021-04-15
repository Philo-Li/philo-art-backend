import Router from 'koa-router';
import queryString from 'query-string';

const superagent = require('superagent');
const cheerio = require('cheerio');

const router = new Router();

const getPhotos = (res) => {
  const allPhotos = [];

  const $ = cheerio.load(res.text);

  $('#content > div > div:nth-child(3) > div > div.row-masonry.search-results > div > div > div > div > a').each((idx, ele) => {
    const title = $(ele).attr('href');
    const downloadUrl = $(ele).attr('href');
    const temp = $(ele).find('img').attr('srcset');
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
      small: temp2[1],
      large: temp2[1],
      downloadPage: `https://pixabay.com${downloadUrl}`,
      tags: title,
      creditWeb: 'pixabay',
      creditId: 'https://pixabay.com/',
      description: title,
      photographer: '',
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

const getPixabay = async (page, query) => {
  let temp = [];

  await superagent.get(`https://pixabay.com/photos/search/${query}/?order=ec&pagi=${page}`)
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
  const re = await getPixabay(parsed.page, parsed.q);
  ctx.body = {
    photos: re,
  };
});

export default router;
