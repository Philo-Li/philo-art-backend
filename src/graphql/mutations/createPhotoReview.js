import { gql } from 'apollo-server';
import * as yup from 'yup';

import { nanoid } from 'nanoid';

export const typeDefs = gql`
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
  photoId: yup
    .string()
    .required()
    .trim(),
  text: yup
    .string()
    .max(2000)
    .trim(),
});

export const resolvers = {
  Mutation: {
    createPhotoReview: async (
      obj,
      args,
      { models: { PhotoReview }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedPhotoReview = await createPhotoReviewInputSchema.validate(
        args.photoReview,
        {
          stripUnknown: true,
        },
      );

      const id = nanoid();

      await PhotoReview.query().insert({
        id,
        userId,
        photoId: normalizedPhotoReview.photoId,
        text: normalizedPhotoReview.text,
      });

      return PhotoReview.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
