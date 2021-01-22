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

const createCollectionPhotoCountLoader = (CollectedPhoto) =>
  new DataLoader(async (collectionIds) => {
    const photos = await CollectedPhoto.query()
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

const createUserCollectionCountLoader = (Collection) =>
  new DataLoader(async (userIds) => {
    const collections = await Collection.query()
      .whereIn('userId', userIds)
      .count('*', { as: 'collectionsCount' })
      .groupBy('userId')
      .select('userId');

    return userIds.map((id) => {
      const collection = collections.find(({ userId }) => userId === id);

      return collection ? collection.collectionsCount : 0;
    });
  });

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

const createPhotoCollectionCountLoader = (CollectedPhoto) =>
  new DataLoader(async (photoIds) => {
    const collections = await CollectedPhoto.query()
      .whereIn('photoId', photoIds)
      .count('*', { as: 'collectionsCount' })
      .groupBy('photoId')
      .select('photoId');

    return photoIds.map((id) => {
      const collection = collections.find(({ photoId }) => photoId === id);

      return collection ? collection.collectionsCount : 0;
    });
  });

const createPhotoReviewCountLoader = (PhotoReview) =>
  new DataLoader(async (photoIds) => {
    const reviews = await PhotoReview.query()
      .whereIn('photoId', photoIds)
      .count('*', { as: 'reviewsCount' })
      .groupBy('photoId')
      .select('photoId');

    return photoIds.map((id) => {
      const review = reviews.find(({ photoId }) => photoId === id);

      return review ? review.reviewsCount : 0;
    });
  });

export const createDataLoaders = ({ models }) => {
  return {
    collectionLoader: createModelLoader(models.Collection),
    userLoader: createModelLoader(models.User),
    photoLoader: createModelLoader(models.Photo),
    collectedPhotoLoader: createModelLoader(models.CollectedPhoto),
    photoReviewLoader: createModelLoader(models.PhotoReview),
    collectionPhotoCountLoader: createCollectionPhotoCountLoader(
      models.CollectedPhoto,
    ),
    userLikeCountLoader: createUserLikeCountLoader(models.Like),
    userCollectionCountLoader: createUserCollectionCountLoader(models.Collection),
    userPhotoCountLoader: createUserPhotoCountLoader(models.Photo),
    photoLikeCountLoader: createPhotoLikeCountLoader(models.Like),
    photoCollectionCountLoader: createPhotoCollectionCountLoader(models.CollectedPhoto),
    photoReviewCountLoader: createPhotoReviewCountLoader(models.PhotoReview),
  };
};

export default createDataLoaders;
