import { GraphQLError } from 'graphql';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Mutation {
    """
    Deletes user account.
    """
    deleteUser(id: ID!): Boolean
  }
`;

interface DeleteUserArgs {
  id: string;
}

export const resolvers = {
  Mutation: {
    deleteUser: async (
      _obj: unknown,
      args: DeleteUserArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const user = await prisma.user.findUnique({
        where: { id: args.id },
      });

      if (!user) {
        throw new GraphQLError(`User with id ${args.id} does not exist`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (user.id !== userId) {
        throw new GraphQLError('User is not authorized to delete the user', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await prisma.collectedPhoto.deleteMany({
        where: { userId: args.id },
      });

      await prisma.collection.deleteMany({
        where: { userId: args.id },
      });

      await prisma.like.deleteMany({
        where: { userId: args.id },
      });

      await prisma.photo.deleteMany({
        where: { userId: args.id },
      });

      await prisma.user.delete({
        where: { id: args.id },
      });

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
