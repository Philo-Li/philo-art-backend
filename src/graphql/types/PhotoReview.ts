import type { PhotoReview as PrismaPhotoReview } from '@prisma/client';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  type PhotoReview {
    id: ID!
    user: User!
    photo: Photo!
    text: String!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  PhotoReview: {
    user: async (
      { userId }: PrismaPhotoReview,
      _args: unknown,
      { dataLoaders: { userLoader } }: AppContext
    ) => userLoader.load(userId!),
    photo: (
      { photoId }: PrismaPhotoReview,
      _args: unknown,
      { dataLoaders: { photoLoader } }: AppContext
    ) => photoLoader.load(photoId!),
  },
};

export default {
  typeDefs,
  resolvers,
};
