import { GraphQLError } from 'graphql';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Mutation {
    """
    Deletes the collection which has the given id, if it is created by the authorized user.
    """
    deleteCollection(id: ID!): Boolean
  }
`;

interface DeleteCollectionArgs {
  id: string;
}

export const resolvers = {
  Mutation: {
    deleteCollection: async (
      _obj: unknown,
      args: DeleteCollectionArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const collection = await prisma.collection.findUnique({
        where: { id: args.id },
      });

      if (!collection) {
        throw new GraphQLError(
          `Collected photo with id ${args.id} does not exist`,
          {
            extensions: { code: 'BAD_USER_INPUT' },
          }
        );
      }

      if (collection.userId !== userId) {
        throw new GraphQLError(
          'User is not authorized to delete the collection',
          {
            extensions: { code: 'FORBIDDEN' },
          }
        );
      }

      await prisma.collectedPhoto.deleteMany({
        where: { collectionId: args.id },
      });

      await prisma.collection.delete({
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
