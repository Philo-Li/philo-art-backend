import { gql } from 'apollo-server';
import * as yup from 'yup';

import createPaginationQuery from '../../utils/createPaginationQuery';

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    philoartId: Int!
    firstName: String
    lastName: String
    email: String
    profileImage: String
    description: String
    socialMediaLink: String
    isFollowed(checkUserFollow: ID): Boolean!
    photos(first: Int, after: String): PhotoConnection
    photoCount: Int
    followings(first: Int, after: String): FollowConnection
    followingCount: Int
    followers(first: Int, after: String): FollowConnection
    followerCount: Int
    likes(first: Int, after: String): LikeConnection
    likeCount: Int
    collections(first: Int, after: String): CollectionConnection
    collectionCount: Int
    createdAt: DateTime!
    updatedAt: DateTime
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

const followingsArgsSchema = yup.object({
  after: yup.string(),
  first: yup
    .number()
    .min(1)
    .max(30)
    .default(30),
});

const followersArgsSchema = yup.object({
  after: yup.string(),
  first: yup
    .number()
    .min(1)
    .max(30)
    .default(30),
});

export const resolvers = {
  User: {
    isFollowed: async (obj, args, { models: { Follow } }) => {
      const userId = args.checkUserFollow;

      if (userId) {
        const query = await Follow.query().findOne({
          userId,
          followingId: obj.id,
        });
        if (query) return true;
      }

      return false;
    },
    photos: async (obj, args, { models: { Photo } }) => {
      const normalizedArgs = await photosArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          Photo.query().where({
            userId: obj.id,
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
      { dataLoaders: { userPhotoCountLoader } },
    ) => userPhotoCountLoader.load(id),
    likes: async (obj, args, { models: { Like } }) => {
      const normalizedArgs = await likesArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          Like.query().where({
            userId: obj.id,
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
      { dataLoaders: { userLikeCountLoader } },
    ) => userLikeCountLoader.load(id),
    collections: async (obj, args, { models: { Collection } }) => {
      const normalizedArgs = await collectionsArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          Collection.query().where({
            userId: obj.id,
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
      { dataLoaders: { userCollectionCountLoader } },
    ) => userCollectionCountLoader.load(id),
    followings: async (obj, args, { models: { Follow } }) => {
      const normalizedArgs = await followingsArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          Follow.query().where({
            userId: obj.id,
          }),
        {
          orderColumn: 'createdAt',
          orderDirection: 'desc',
          first: normalizedArgs.first,
          after: normalizedArgs.after,
        },
      );
    },
    followingCount: async (
      { id },
      args,
      { dataLoaders: { userFollowingCountLoader } },
    ) => userFollowingCountLoader.load(id),
    followers: async (obj, args, { models: { Follow } }) => {
      const normalizedArgs = await followersArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          Follow.query().where({
            followingId: obj.id,
          }),
        {
          orderColumn: 'createdAt',
          orderDirection: 'desc',
          first: normalizedArgs.first,
          after: normalizedArgs.after,
        },
      );
    },
    followerCount: async (
      { id },
      args,
      { dataLoaders: { userFollowerCountLoader } },
    ) => userFollowerCountLoader.load(id),
  },
};

export default {
  typeDefs,
  resolvers,
};
