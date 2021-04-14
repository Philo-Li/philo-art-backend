import { gql, UserInputError } from 'apollo-server';

export const typeDefs = gql`
  extend type Mutation {
    """
    Unlike the photo which has the given photo id, if it is created by the authorized user.
    """
    unlikePhoto(photoId: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    unlikePhoto: async (obj, args, { models: { Like, Photo }, authService }) => {
      const userId = authService.assertIsAuthorized();
      const photo = await Photo.query().findById(args.photoId);

      if (!photo) {
        throw new UserInputError(`Photo with id ${args.photoId} does not exist`);
      }

      const findLike = await Like.query().findOne({ photoId: args.photoId, userId });

      if (findLike) {
        await Like.query()
          .findById(findLike.id)
          .delete();
      }

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
