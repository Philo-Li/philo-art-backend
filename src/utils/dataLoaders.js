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

const createPhotoLikeCountLoader = (Like) =>
  new DataLoader(async (photoIds) => {
    const likes = await Like.query()
      .whereIn('photoId', photoIds)
      .count('*', { as: 'likesCount' })
      .groupBy('photoId')
      .select('photoId');

    return photoIds.map((id) => {
      const like = likes.find(({ photoId }) => photoId === id);

      return like ? like.likesCount : 0;
    });
  });

const createUserCollectionCountLoader = (Like) =>
  new DataLoader(async (photoIds) => {
    const collections = await Collection.query()
      .whereIn('userId', photoIds)
      .count('*', { as: 'collectionsCount' })
      .groupBy('userId')
      .select('userId');

    return userIds.map((id) => {
      const collection = collections.find(({ userId }) => userId === id);

      return collection ? collection.collectionsCount : 0;
    });
  });

const createUserLikeCountLoader = (Like) =>
  new DataLoader(async (userIds) => {
    const likes = await Like.query()
      .whereIn('userId', userIds)
      .count('*', { as: 'likesCount' })
      .groupBy('userId')
      .select('userId');

    return userIds.map((id) => {
      const like = likes.find(({ userId }) => userId === id);

      return like ? like.likesCount : 0;
    });
  });

export const createDataLoaders = ({ models }) => {
  return {
    photoLoader: createModelLoader(models.Photo),
    userLoader: createModelLoader(models.User),
    likeLoader: createModelLoader(models.Like),
    collectionLoader: createModelLoader(models.Collection),
    photoLikeCountLoader: createPhotoLikeCountLoader(
      models.Like,
    ),
    userLikeCountLoader: createUserLikeCountLoader(models.Like),
    userCollectionCountLoader: createUserCollectionCountLoader(models.Like),
  };
};

export default createDataLoaders;
