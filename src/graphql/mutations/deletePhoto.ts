import { GraphQLError } from 'graphql';
import deleteS3Object from '../../utils/deleteS3Object.js';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Mutation {
    """
    Deletes the photo which has the given id, if it is created by the authorized user.
    """
    deletePhoto(id: ID!): Boolean
  }
`;

interface DeletePhotoArgs {
  id: string;
}

export const resolvers = {
  Mutation: {
    deletePhoto: async (
      _obj: unknown,
      args: DeletePhotoArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const photo = await prisma.photo.findUnique({
        where: { id: args.id },
      });

      if (!photo) {
        throw new GraphQLError(`Photo with id ${args.id} does not exist`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (photo.userId !== userId) {
        throw new GraphQLError(
          'User is not authorized to delete the photo',
          {
            extensions: { code: 'FORBIDDEN' },
          }
        );
      }

      await deleteS3Object(photo.imageKey);

      await prisma.photo.delete({
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
