import { Router, Request, Response } from 'express';
import superagent from 'superagent';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

const router: ReturnType<typeof Router> = Router();

interface Photo {
  width: null;
  height: null;
  tiny: null;
  small: string | undefined;
  large: string | undefined;
  creditWeb: string;
  creditId: string | undefined;
  photographer: null;
}

const getPhotos = (res: superagent.Response): Photo[] => {
  const allPhotos: Photo[] = [];
  const $ = cheerio.load(res.text);

  $('article').each((_idx: number, ele: Element) => {
    const photo: Photo = {
      width: null,
      height: null,
      tiny: null,
      small: $(ele).find('img[class=work-img]').attr('alt'),
      large: $(ele).find('img[class=work-img]').attr('alt'),
      creditWeb: 'pexels',
      creditId: $(ele).attr('data-photo-modal-medium-id'),
      photographer: null,
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

const getPexels = async (): Promise<Photo[]> => {
  let temp: Photo[] = [];

  await superagent
    .get('https://www.pexels.com/search/dog')
    .end(async (err, response) => {
      if (err) {
        console.log(err);
      } else {
        temp = getPhotos(response);
      }
      console.log(temp, response);
      return temp;
    });
  await delay();
  return temp;
};

router.get('/:query', async (_req: Request, res: Response) => {
  const result = await getPexels();
  res.json({
    photos: result,
  });
});

export default router;
