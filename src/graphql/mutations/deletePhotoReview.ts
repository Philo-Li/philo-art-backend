import { GraphQLError } from 'graphql';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Mutation {
    """
    Delete the photo review which has the given id, if it is created by the authorized user.
    """
    deletePhotoReview(id: ID!): Boolean
  }
`;

interface DeletePhotoReviewArgs {
  id: string;
}

export const resolvers = {
  Mutation: {
    deletePhotoReview: async (
      _obj: unknown,
      args: DeletePhotoReviewArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const photoReview = await prisma.photoReview.findUnique({
        where: { id: args.id },
      });

      if (!photoReview) {
        throw new GraphQLError(
          `photo review with id ${args.id} does not exist`,
          {
            extensions: { code: 'BAD_USER_INPUT' },
          }
        );
      }

      if (photoReview.userId !== userId) {
        throw new GraphQLError(
          'User is not authorized to delete the review',
          {
            extensions: { code: 'FORBIDDEN' },
          }
        );
      }

      await prisma.photoReview.delete({
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
