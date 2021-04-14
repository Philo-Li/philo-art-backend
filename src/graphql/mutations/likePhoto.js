import { gql, UserInputError } from 'apollo-server';

import { nanoid } from 'nanoid';

export const typeDefs = gql`
  extend type Mutation {
    """
    Like a photo.
    """
    likePhoto(photoId: ID!): Like
  }
`;

export const resolvers = {
  Mutation: {
    likePhoto: async (
      obj,
      args,
      { models: { Like, Photo }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();
      const photo = await Photo.query().findById(args.photoId);

      if (!photo) {
        throw new UserInputError(`Photo with id ${args.photoId} does not exist`);
      }

      const findLike = await Like.query().findOne({ photoId: args.photoId, userId });

      if (findLike) {
        return Like.query().findById(findLike.id);
      }

      const id = nanoid();

      await Like.query().insert({
        id,
        userId,
        photoId: args.photoId,
      });

      return Like.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
