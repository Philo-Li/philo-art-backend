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
  photographer: string;
}

const getPhotos = (res: superagent.Response): Photo[] => {
  const allPhotos: Photo[] = [];
  const $ = cheerio.load(res.text);

  $(
    '#content > div > div:nth-child(3) > div > div.row-masonry.search-results > div > div > div > div > a'
  ).each((_idx, ele) => {
    const title = $(ele).attr('href');
    const downloadUrl = $(ele).attr('href');
    const temp = $(ele).find('img').attr('srcset');

    if (!temp || !downloadUrl) return;

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

const delay = (ms: number = 3000): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
};

const getPixabay = async (page: string, query: string): Promise<Photo[]> => {
  let temp: Photo[] = [];

  await superagent
    .get(`https://pixabay.com/photos/search/${query}/?order=ec&pagi=${page}`)
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
  const result = await getPixabay(page, q);
  res.json({
    photos: result,
  });
});

export default router;
