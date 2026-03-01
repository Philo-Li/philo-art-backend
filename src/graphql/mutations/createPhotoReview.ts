import * as yup from 'yup';
import { nanoid } from 'nanoid';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  input CreatePhotoReviewInput {
    photoId: ID!
    text: String!
  }

  extend type Mutation {
    """
    Creates a photoReview for the photo.
    """
    createPhotoReview(photoReview: CreatePhotoReviewInput): PhotoReview
  }
`;

const createPhotoReviewInputSchema = yup.object().shape({
  photoId: yup.string().required().trim(),
  text: yup.string().max(2000).trim(),
});

interface CreatePhotoReviewArgs {
  photoReview: {
    photoId: string;
    text: string;
  };
}

export const resolvers = {
  Mutation: {
    createPhotoReview: async (
      _obj: unknown,
      args: CreatePhotoReviewArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedPhotoReview =
        await createPhotoReviewInputSchema.validate(args.photoReview, {
          stripUnknown: true,
        });

      const id = nanoid();

      const photoReview = await prisma.photoReview.create({
        data: {
          id,
          userId,
          photoId: normalizedPhotoReview.photoId,
          text: normalizedPhotoReview.text,
        },
      });

      return photoReview;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
