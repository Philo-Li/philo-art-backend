import type { Follow as PrismaFollow } from '@prisma/client';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  type Follow {
    id: ID!
    user: User!
    following: User!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  Follow: {
    user: async (
      { userId }: PrismaFollow,
      _args: unknown,
      { dataLoaders: { userLoader } }: AppContext
    ) => userLoader.load(userId!),
    following: async (
      { followingId }: PrismaFollow,
      _args: unknown,
      { dataLoaders: { userLoader } }: AppContext
    ) => userLoader.load(followingId!),
  },
};

export default {
  typeDefs,
  resolvers,
};
