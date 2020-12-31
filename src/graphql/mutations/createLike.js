import { gql } from 'apollo-server';
import * as yup from 'yup';

const { v4: uuid } = require('uuid');

export const typeDefs = gql`
  input CreateLikeInput {
    photoId: String!
    text: String!
  }

  extend type Mutation {
    """
    Creates a like for the photo.
    """
    createLike(like: CreateLikeInput): Like
  }
`;

const createLikeInputSchema = yup.object().shape({
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
    createLike: async (
      obj,
      args,
      { models: { Like }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedLike = await createLikeInputSchema.validate(
        args.like,
        {
          stripUnknown: true,
        },
      );

      const id = uuid();

      await Like.query().insert({
        id,
        userId,
        photoId: normalizedLike.photoId,
        text: normalizedLike.text,
      });

      return Like.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
