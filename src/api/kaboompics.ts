import { Router, Request, Response } from 'express';
import superagent from 'superagent';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

const router: ReturnType<typeof Router> = Router();

interface Photo {
  width: null;
  height: null;
  tiny: string;
  small: string;
  large: string;
  downloadPage: string | undefined;
  tags: string | undefined;
  creditWeb: string;
  creditId: string;
  description: string | undefined;
  photographer: null;
}

const getPhotos = (res: superagent.Response): Photo[] => {
  const allPhotos: Photo[] = [];
  const $ = cheerio.load(res.text);

  $('ul#work-grid li div[class=work-img] a').each((_idx: number, ele: Element) => {
    const temp = $(ele).find('img').attr('data-srcset');
    if (!temp) return;

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
      small: temp2[0],
      large: temp2[1],
      downloadPage: $(ele).attr('href'),
      tags: $(ele).attr('title'),
      creditWeb: 'kaboompics',
      creditId: 'https://kaboompics.com/',
      description: $(ele).attr('title'),
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

const getKaboompics = async (query: string): Promise<Photo[]> => {
  let temp: Photo[] = [];

  await superagent
    .get(`https://kaboompics.com/gallery?search=${query}&sortby=`)
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
  const result = await getKaboompics(query);
  res.json({
    photos: result.length < 1 ? undefined : result,
  });
});

export default router;
