import type { CollectedPhoto as PrismaCollectedPhoto } from '@prisma/client';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  type CollectedPhoto {
    id: ID!
    user: User!
    collection: Collection!
    photo(userId: ID): Photo!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  CollectedPhoto: {
    user: async (
      { userId }: PrismaCollectedPhoto,
      _args: unknown,
      { dataLoaders: { userLoader } }: AppContext
    ) => userLoader.load(userId!),
    collection: (
      { collectionId }: PrismaCollectedPhoto,
      _args: unknown,
      { dataLoaders: { collectionLoader } }: AppContext
    ) => collectionLoader.load(collectionId!),
    photo: (
      { photoId }: PrismaCollectedPhoto,
      _args: unknown,
      { dataLoaders: { photoLoader } }: AppContext
    ) => photoLoader.load(photoId!),
  },
};

export default {
  typeDefs,
  resolvers,
};
