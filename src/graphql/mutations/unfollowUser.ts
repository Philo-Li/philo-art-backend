import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Mutation {
    """
    Unfollow the user which has the given user id, if it is created by the authorized user.
    """
    unfollowUser(userId: ID!): Boolean
  }
`;

interface UnfollowUserArgs {
  userId: string;
}

export const resolvers = {
  Mutation: {
    unfollowUser: async (
      _obj: unknown,
      args: UnfollowUserArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const findFollow = await prisma.follow.findFirst({
        where: { followingId: args.userId, userId },
      });

      if (findFollow) {
        await prisma.follow.delete({
          where: { id: findFollow.id },
        });
      }

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
