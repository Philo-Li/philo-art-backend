import { GraphQLError } from 'graphql';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Mutation {
    """
    Unlike the photo which has the given photo id, if it is created by the authorized user.
    """
    unlikePhoto(photoId: ID!): Boolean
  }
`;

interface UnlikePhotoArgs {
  photoId: string;
}

export const resolvers = {
  Mutation: {
    unlikePhoto: async (
      _obj: unknown,
      args: UnlikePhotoArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const photo = await prisma.photo.findUnique({
        where: { id: args.photoId },
      });

      if (!photo) {
        throw new GraphQLError(`Photo with id ${args.photoId} does not exist`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const findLike = await prisma.like.findFirst({
        where: { photoId: args.photoId, userId },
      });

      if (findLike) {
        await prisma.like.delete({
          where: { id: findLike.id },
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
