/* eslint-disable implicit-arrow-linebreak */
import DataLoader from 'dataloader';
import {
  camelCase, isArray, find, zipObject,
} from 'lodash';

const jsonCacheKeyFn = (value) => JSON.stringify(value);

const createModelLoader = (Model) =>
  new DataLoader(
    async (ids) => {
      const idColumns = isArray(Model.idColumn)
        ? Model.idColumn
        : [Model.idColumn];

      const camelCasedIdColumns = idColumns.map((id) => camelCase(id));

      const results = await Model.query().findByIds(ids);

      return ids.map(
        (id) =>
          find(
            results,
            zipObject(camelCasedIdColumns, isArray(id) ? id : [id]),
          ) || null,
      );
    },
    {
      cacheKeyFn: jsonCacheKeyFn,
    },
  );

const createArticleReviewCountLoader = (Review) =>
  new DataLoader(async (articleIds) => {
    const reviews = await Review.query()
      .whereIn('articleId', articleIds)
      .count('*', { as: 'reviewsCount' })
      .groupBy('articleId')
      .select('articleId');

    return articleIds.map((id) => {
      const review = reviews.find(({ articleId }) => articleId === id);

      return review ? review.reviewsCount : 0;
    });
  });

const createUserReviewCountLoader = (Review) =>
  new DataLoader(async (userIds) => {
    const reviews = await Review.query()
      .whereIn('userId', userIds)
      .count('*', { as: 'reviewsCount' })
      .groupBy('userId')
      .select('userId');

    return userIds.map((id) => {
      const review = reviews.find(({ userId }) => userId === id);

      return review ? review.reviewsCount : 0;
    });
  });

export const createDataLoaders = ({ models }) => {
  return {
    articleLoader: createModelLoader(models.Article),
    userLoader: createModelLoader(models.User),
    reviewLoader: createModelLoader(models.Review),
    articleReviewCountLoader: createArticleReviewCountLoader(
      models.Review,
    ),
    userReviewCountLoader: createUserReviewCountLoader(models.Review),
  };
};

export default createDataLoaders;
