import { Router, Request, Response } from 'express';
import queryString from 'query-string';
import superagent from 'superagent';
import cheerio from 'cheerio';

const router: ReturnType<typeof Router> = Router();

interface Photo {
  width: null;
  height: null;
  tiny: string | undefined;
  small: string | undefined;
  large: string | undefined;
  downloadPage: string | undefined;
  tags: string | undefined;
  creditWeb: string;
  creditId: string;
  description: string | undefined;
  photographer: string;
}

interface LargeUrlResult {
  largeUrl: string | null;
  tags: string | null;
}

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

const getLargeUrl = async (url: string | undefined): Promise<LargeUrlResult> => {
  const result: LargeUrlResult = {
    largeUrl: null,
    tags: null,
  };

  if (!url) return result;

  await superagent.get(url).end(async (err, response) => {
    if (err) {
      console.log(err);
    } else {
      const $ = cheerio.load(response.text);
      $('article').each((_idx, ele) => {
        result.largeUrl = $(ele).find('img').attr('src') || null;
        result.tags = $(ele).find('img').attr('alt') || null;
      });
    }
    return result;
  });

  await delay(2000);
  return result;
};

const getPhotos = async (res: superagent.Response): Promise<Photo[]> => {
  const $ = cheerio.load(res.text);
  const articles = $('article').toArray();

  const photoPromises = articles.map(async (ele) => {
    const title = $(ele).find('img').attr('title');
    const smallUrl = $(ele).find('img').attr('src');
    const downloadUrl = $(ele).find('div.single-photo-thumb > a').attr('href');
    const photographerName = $(ele).find('div.photo-meta > div > a').text();
    const moreInfo = await getLargeUrl(downloadUrl);

    const photo: Photo = {
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

    return photo;
  });

  return Promise.all(photoPromises);
};

const getPicography = async (page: string, query: string): Promise<Photo[]> => {
  let temp: Photo[] = [];

  await superagent
    .get(`https://picography.co/search/${query}/page/${page}/`)
    .end(async (err, response) => {
      if (err) {
        console.log(err);
      } else {
        temp = await getPhotos(response);
      }
      return temp;
    });
  await delay(4000);
  return temp;
};

router.get('/:query', async (req: Request, res: Response) => {
  const query = req.params.query as string;
  const parsed = queryString.parse(query);
  const page = (parsed.page as string) || '1';
  const q = (parsed.q as string) || '';
  const result = await getPicography(page, q);
  res.json({
    photos: result.length < 1 ? undefined : result,
  });
});

export default router;
