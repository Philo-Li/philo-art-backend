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

const createCollectionPhotoCountLoader = (Photo) =>
  new DataLoader(async (collectionIds) => {
    const photos = await Photo.query()
      .whereIn('collectionId', collectionIds)
      .count('*', { as: 'photosCount' })
      .groupBy('collectionId')
      .select('collectionId');

    return collectionIds.map((id) => {
      const photo = photos.find(({ collectionId }) => collectionId === id);

      return photo ? photo.photosCount : 0;
    });
  });

const createUserPhotoCountLoader = (Photo) =>
  new DataLoader(async (userIds) => {
    const photos = await Photo.query()
      .whereIn('userId', userIds)
      .count('*', { as: 'photosCount' })
      .groupBy('userId')
      .select('userId');

    return userIds.map((id) => {
      const photo = photos.find(({ userId }) => userId === id);

      return photo ? photo.photosCount : 0;
    });
  });

export const createDataLoaders = ({ models }) => {
  return {
    collectionLoader: createModelLoader(models.Collection),
    userLoader: createModelLoader(models.User),
    photoLoader: createModelLoader(models.Photo),
    collectionPhotoCountLoader: createCollectionPhotoCountLoader(
      models.Photo,
    ),
    userPhotoCountLoader: createUserPhotoCountLoader(models.Photo),
  };
};

export default createDataLoaders;
