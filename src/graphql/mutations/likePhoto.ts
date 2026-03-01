import { GraphQLError } from 'graphql';
import { nanoid } from 'nanoid';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Mutation {
    """
    Like a photo.
    """
    likePhoto(photoId: ID!): Like
  }
`;

interface LikePhotoArgs {
  photoId: string;
}

export const resolvers = {
  Mutation: {
    likePhoto: async (
      _obj: unknown,
      args: LikePhotoArgs,
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
        return findLike;
      }

      const id = nanoid();

      const like = await prisma.like.create({
        data: {
          id,
          userId,
          photoId: args.photoId,
        },
      });

      return like;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
