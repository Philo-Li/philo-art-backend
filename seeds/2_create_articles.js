const oneHour = 1000 * 60 * 60;
const { v4: uuid } = require('uuid');

const loremIpsum =
  'Lorem ipsum dolor sit amet, per brute apeirian ei. Malis facilisis vel ex, ex vivendo signiferumque nam, nam ad natum electram constituto. Causae latine at sea, ex nec ullum ceteros, est ut dicant splendide. Omnis electram ullamcorper est ut.';

const createDateColumns = (date) => ({
  created_at: date,
  updated_at: date,
});

const userId = 'bbe42984-051b-4a01-b45d-b8d29c32200c';

const createColumns = (titleZh, titleEn) => ({
  id: uuid(),
  user_id: userId,
  title: titleZh,
  title_en: titleEn,
});

exports.seed = async (knex) => {
  await knex('articles').del();

  await knex('articles').insert([
    {
      description: 'A poet',
      text: loremIpsum,
      ...createColumns('月亮', 'moon'),
      ...createDateColumns(new Date(Date.now() - oneHour)),
    },
    {
      description: 'A poet',
      text: loremIpsum,
      ...createColumns('太阳', 'sun'),
      ...createDateColumns(new Date(Date.now() - 2 * oneHour)),
    },
    {
      description: 'A poet',
      text: loremIpsum,
      ...createColumns('雷', 'thunder'),
      ...createDateColumns(new Date(Date.now() - 3 * oneHour)),
    },
    {
      description: 'A poet',
      text: loremIpsum,
      ...createColumns('雨', 'rian'),
      ...createDateColumns(new Date(Date.now() - 4 * oneHour)),
    },
    {
      description: 'A poet',
      text: loremIpsum,
      ...createColumns('山', 'mountains'),
      ...createDateColumns(new Date(Date.now() - 5 * oneHour)),
    },
    {
      description: 'A poet',
      text: loremIpsum,
      ...createColumns('公园', 'park'),
      ...createDateColumns(new Date(Date.now() - 6 * oneHour)),
    },
    {
      description: 'A poet',
      text: loremIpsum,
      ...createColumns('云', 'clouds'),
      ...createDateColumns(new Date(Date.now() - 7 * oneHour)),
    },
    {
      description: 'A poet',
      text: loremIpsum,
      ...createColumns('时间', 'time'),
      ...createDateColumns(new Date(Date.now() - 8 * oneHour)),
    },
    {
      description: 'A poet',
      text: loremIpsum,
      ...createColumns('空间', 'space'),
      ...createDateColumns(new Date(Date.now() - 9 * oneHour)),
    },
    {
      description: 'A poet',
      text: loremIpsum,
      ...createColumns('穿越', 'go-through'),
      ...createDateColumns(new Date(Date.now() - 10 * oneHour)),
    },
  ]);
};
