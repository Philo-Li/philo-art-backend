import { Router, Request, Response } from 'express';
import queryString from 'query-string';
import superagent from 'superagent';
import cheerio from 'cheerio';

const router: ReturnType<typeof Router> = Router();

interface Photo {
  width: null;
  height: null;
  tiny: string;
  small: string;
  large: string;
  downloadPage: string;
  tags: string | undefined;
  creditWeb: string;
  creditId: string;
  description: string | undefined;
  photographer: string | undefined;
}

const getPhotos = (res: superagent.Response): Photo[] => {
  const allPhotos: Photo[] = [];
  const $ = cheerio.load(res.text);

  $(
    '#Main > section:nth-child(1) > div.grid.gutter-bottom > div > div > div'
  ).each((_idx, ele) => {
    const title = $(ele).find('div:nth-child(1) > button').attr('data-photo-title');
    const smallUrl = $(ele)
      .find('div:nth-child(1) > button')
      .attr('data-modal-image-url');
    const downloadUrl = $(ele).find('div:nth-child(1) > a').attr('href');
    const photographerName = $(ele)
      .find('div:nth-child(2) > div')
      .attr('data-author-name');
    const temp = $(ele).find('img').attr('data-srcset');

    if (!temp || !smallUrl) return;

    const temp1 = temp.split(',').splice(0, 2);
    const temp2: string[] = [];
    for (let i = 0; i < 2; i += 1) {
      const a = temp1[i].trim();
      const b = a.slice(0, a.length - 3);
      temp2.push(b);
    }
    const photo: Photo = {
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

const delay = (ms: number = 5000): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

const getBurst = async (page: string, query: string): Promise<Photo[]> => {
  let temp: Photo[] = [];

  await superagent
    .get(`https://burst.shopify.com/photos/search?page=${page}&q=${query}`)
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

router.get('/:query', async (req: Request, res: Response) => {
  const query = req.params.query as string;
  const parsed = queryString.parse(query);
  const page = (parsed.page as string) || '1';
  const q = (parsed.q as string) || '';
  const result = await getBurst(page, q);
  res.json({
    photos: result.length < 1 ? undefined : result,
  });
});

export default router;
