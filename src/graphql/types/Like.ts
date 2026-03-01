import type { Like as PrismaLike } from '@prisma/client';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  type Like {
    id: ID!
    user: User!
    createdAt: DateTime!
    photo: Photo!
  }
`;

export const resolvers = {
  Like: {
    user: async (
      { userId }: PrismaLike,
      _args: unknown,
      { dataLoaders: { userLoader } }: AppContext
    ) => userLoader.load(userId!),
    photo: (
      { photoId }: PrismaLike,
      _args: unknown,
      { dataLoaders: { photoLoader } }: AppContext
    ) => photoLoader.load(photoId!),
  },
};

export default {
  typeDefs,
  resolvers,
};
