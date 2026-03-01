import type { CollectionReview as PrismaCollectionReview } from '@prisma/client';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  type CollectionReview {
    id: ID!
    user: User!
    collection: Collection!
    text: String!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  CollectionReview: {
    user: async (
      { userId }: PrismaCollectionReview,
      _args: unknown,
      { dataLoaders: { userLoader } }: AppContext
    ) => userLoader.load(userId!),
    collection: (
      { collectionId }: PrismaCollectionReview,
      _args: unknown,
      { dataLoaders: { collectionLoader } }: AppContext
    ) => collectionLoader.load(collectionId!),
  },
};

export default {
  typeDefs,
  resolvers,
};
