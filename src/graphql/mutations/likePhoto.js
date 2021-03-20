import { gql } from 'apollo-server';
import * as yup from 'yup';

const { v4: uuid } = require('uuid');

export const typeDefs = gql`
  input LikePhotoInput {
    photoId: ID!
  }

  extend type Mutation {
    """
    Like a photo.
    """
    likePhoto(like: LikePhotoInput): Like
  }
`;

const likePhotoInputSchema = yup.object().shape({
  photoId: yup
    .string()
    .required()
    .trim(),
});

export const resolvers = {
  Mutation: {
    likePhoto: async (
      obj,
      args,
      { models: { Like }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedLike = await likePhotoInputSchema.validate(
        args.like,
        {
          stripUnknown: true,
        },
      );

      const findLike = await Like.query().findOne({ photoId: normalizedLike.photoId, userId });

      if (findLike) {
        return Like.query().findById(findLike.id);
      }

      const id = uuid();

      await Like.query().insert({
        id,
        userId,
        photoId: normalizedLike.photoId,
      });

      return Like.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
