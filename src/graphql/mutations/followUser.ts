import { GraphQLError } from 'graphql';
import { nanoid } from 'nanoid';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Mutation {
    """
    Follow a user.
    """
    followUser(userId: ID!): Boolean
  }
`;

interface FollowUserArgs {
  userId: string;
}

export const resolvers = {
  Mutation: {
    followUser: async (
      _obj: unknown,
      args: FollowUserArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      if (userId === args.userId) {
        throw new GraphQLError('Can not follow yourself', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const findFollow = await prisma.follow.findFirst({
        where: { followingId: args.userId, userId },
      });

      if (findFollow) {
        return true;
      }

      const id = nanoid();

      await prisma.follow.create({
        data: {
          id,
          userId,
          followingId: args.userId,
        },
      });

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
