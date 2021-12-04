import { gql } from 'apollo-server';
import * as yup from 'yup';

import createPaginationQuery from '../../utils/createPaginationQuery';

export const typeDefs = gql`
  type Photo {
    id: ID!
    user: User!
    title: String!
    titleZh: String!
    year: Int!
    description: String
    allTags: String
    tags: String
    photoWidth: Int!
    photoHeight: Int!
    artworkWidth: Int
    artworkHeight: Int
    srcTiny: String
    srcSmall: String
    srcLarge: String
    srcYoutube: String
    color: String
    allColors: String
    downloadCount: String
    creditId: String
    artist: String
    license: String
    type: String
    medium: String
    status: String
    relatedPhotos: String
    likes(first: Int, after: String): LikeConnection!
    likeCount: Int
    collections(first: Int, after: String): CollectedPhotoConnection!
    collectionCount: Int
    reviews(first: Int, after: String): PhotoReviewConnection!
    reviewCount: Int
    isLiked(checkUserLike: ID): Boolean!
    isCollected(checkUserCollect: ID): Boolean!
    createdAt: DateTime!
  }
`;

const likesArgsSchema = yup.object({
  after: yup.string(),
  first: yup
    .number()
    .min(1)
    .max(30)
    .default(30),
});

const collectionsArgsSchema = yup.object({
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
  Photo: {
    user: async ({ userId }, args, { dataLoaders: { userLoader } }) =>
      userLoader.load(userId),
    likes: async (obj, args, { models: { Like } }) => {
      const normalizedArgs = await likesArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          Like.query().where({
            photoId: obj.id,
          }),
        {
          orderColumn: 'createdAt',
          orderDirection: 'desc',
          first: normalizedArgs.first,
          after: normalizedArgs.after,
        },
      );
    },
    likeCount: async (
      { id },
      args,
      { dataLoaders: { photoLikeCountLoader } },
    ) => photoLikeCountLoader.load(id),
    collections: async (obj, args, { models: { CollectedPhoto } }) => {
      const normalizedArgs = await collectionsArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          CollectedPhoto.query().where({
            photoId: obj.id,
          }),
        {
          orderColumn: 'createdAt',
          orderDirection: 'desc',
          first: normalizedArgs.first,
          after: normalizedArgs.after,
        },
      );
    },
    collectionCount: async (
      { id },
      args,
      { dataLoaders: { photoCollectionCountLoader } },
    ) => photoCollectionCountLoader.load(id),
    reviews: async (obj, args, { models: { PhotoReview } }) => {
      const normalizedArgs = await reviewsArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          PhotoReview.query().where({
            photoId: obj.id,
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
      { dataLoaders: { photoReviewCountLoader } },
    ) => photoReviewCountLoader.load(id),
    isLiked: async (obj, args, { models: { Like } }) => {
      const userId = args.checkUserLike;

      if (userId) {
        const query = await Like.query().findOne({
          userId,
          photoId: obj.id,
        });
        if (query) return true;
      }

      return false;
    },
    isCollected: async (obj, args, { models: { CollectedPhoto } }) => {
      const userId = args.checkUserCollect;

      if (userId) {
        const query = await CollectedPhoto.query().findOne({
          userId,
          photoId: obj.id,
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
