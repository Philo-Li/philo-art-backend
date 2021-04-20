import { gql } from 'apollo-server';
import * as yup from 'yup';

import createPaginationQuery from '../../utils/createPaginationQuery';

export const typeDefs = gql`
  type Collection {
    id: ID!
    userId: String!
    user: User!
    title: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime
    photos(first: Int, after: String): CollectedPhotoConnection!
    photoCount: Int
    reviews(first: Int, after: String): CollectionReviewConnection!
    reviewCount: Int
    cover: String
    public: Boolean!
    isCollected(checkPhotoCollect: ID): Boolean!
  }
`;

const photosArgsSchema = yup.object({
  after: yup.string(),
  first: yup
    .number()
    .min(1)
    .max(30)
    .default(30),
});

const reviewsArgsSchema = yup.object({
  after: yup.string(),
  first: yup
    .number()
    .min(1)
    .max(30)
    .default(30),
});

export const resolvers = {
  Collection: {
    user: async ({ userId }, args, { dataLoaders: { userLoader } }) =>
      userLoader.load(userId),
    cover: async (obj, args, { models: { CollectedPhoto, Photo } }) => {
      const photos = await CollectedPhoto.query().where({
        collectionId: obj.id,
      });
      if (photos.length === 0) return null;
      const photo = await Photo.query().findById(photos[photos.length - 1].photoId);
      const cover = photo.small;
      return cover;
    },
    photos: async (obj, args, { models: { CollectedPhoto } }) => {
      const normalizedArgs = await photosArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          CollectedPhoto.query().where({
            collectionId: obj.id,
          }),
        {
          orderColumn: 'createdAt',
          orderDirection: 'desc',
          first: normalizedArgs.first,
          after: normalizedArgs.after,
        },
      );
    },
    photoCount: async (
      { id },
      args,
      { dataLoaders: { collectionPhotoCountLoader } },
    ) => collectionPhotoCountLoader.load(id),
    reviews: async (obj, args, { models: { CollectionReview } }) => {
      const normalizedArgs = await reviewsArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          CollectionReview.query().where({
            collectionId: obj.id,
          }),
        {
          orderColumn: 'createdAt',
          orderDirection: 'desc',
          first: normalizedArgs.first,
          after: normalizedArgs.after,
        },
      );
    },
    reviewCount: async (
      { id },
      args,
      { dataLoaders: { collectionReviewCountLoader } },
    ) => collectionReviewCountLoader.load(id),
    isCollected: async (obj, args, { models: { CollectedPhoto } }) => {
      const photoId = args.checkPhotoCollect;

      if (photoId) {
        const query = await CollectedPhoto.query().findOne({
          photoId,
          collectionId: obj.id,
        });
        if (query) return true;
      }

      return false;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
