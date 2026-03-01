import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Query {
    """
    Returns whether a liked photo by an id.
    """
    isLikedPhoto(photoId: ID!): Like
  }
`;

interface IsLikedPhotoArgs {
  photoId: string;
}

export const resolvers = {
  Query: {
    isLikedPhoto: async (
      _obj: unknown,
      args: IsLikedPhotoArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();
      const { photoId } = args;

      if (userId) {
        const like = await prisma.like.findFirst({
          where: {
            userId,
            photoId,
          },
        });
        if (like) return like;
      }

      return null;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
