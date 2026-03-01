import { GraphQLError } from 'graphql';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Mutation {
    """
    Delete the collection review which has the given id, if it is created by the authorized user.
    """
    deleteCollectionReview(id: ID!): Boolean
  }
`;

interface DeleteCollectionReviewArgs {
  id: string;
}

export const resolvers = {
  Mutation: {
    deleteCollectionReview: async (
      _obj: unknown,
      args: DeleteCollectionReviewArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const collectionReview = await prisma.collectionReview.findUnique({
        where: { id: args.id },
      });

      if (!collectionReview) {
        throw new GraphQLError(
          `collection review with id ${args.id} does not exist`,
          {
            extensions: { code: 'BAD_USER_INPUT' },
          }
        );
      }

      if (collectionReview.userId !== userId) {
        throw new GraphQLError(
          'User is not authorized to delete the review',
          {
            extensions: { code: 'FORBIDDEN' },
          }
        );
      }

      await prisma.collectionReview.delete({
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
