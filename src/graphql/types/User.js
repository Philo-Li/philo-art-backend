import { gql } from 'apollo-server';
import * as yup from 'yup';

import createPaginationQuery from '../../utils/createPaginationQuery';

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    firstName: String!
    lastName: String
    email: String!
    createdAt: DateTime!
    profileImage: String
    likes(first: Int, after: String): LikeConnection
    likeCount: Int
    collections(first: Int, after: String): CollectionConnection
    collectionCount: Int
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

export const resolvers = {
  User: {
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
  },
};

export default {
  typeDefs,
  resolvers,
};
