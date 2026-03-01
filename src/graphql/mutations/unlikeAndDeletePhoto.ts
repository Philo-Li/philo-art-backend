import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Mutation {
    """
    Unlike the photo delete the photo(broadsearch page).
    """
    unlikeAndDeletePhoto(url: String!): Boolean
  }
`;

interface UnlikeAndDeletePhotoArgs {
  url: string;
}

export const resolvers = {
  Mutation: {
    unlikeAndDeletePhoto: async (
      _obj: unknown,
      args: UnlikeAndDeletePhotoArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const findPhoto = await prisma.photo.findFirst({
        where: { downloadPage: args.url, userId },
      });

      if (findPhoto) {
        const findLike = await prisma.like.findFirst({
          where: { photoId: findPhoto.id, userId },
        });

        if (findLike) {
          await prisma.like.delete({
            where: { id: findLike.id },
          });
        }

        await prisma.photo.delete({
          where: { id: findPhoto.id },
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
