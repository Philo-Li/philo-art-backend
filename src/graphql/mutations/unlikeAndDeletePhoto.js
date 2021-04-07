import { gql } from 'apollo-server';

export const typeDefs = gql`
  extend type Mutation {
    """
    Unlike the photo delete the photo(broadsearch page).
    """
    unlikeAndDeletePhoto(url: String!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    unlikeAndDeletePhoto: async (obj, args, { models: { Photo, Like }, authService }) => {
      const userId = authService.assertIsAuthorized();

      const findPhoto = await Photo.query()
        .findOne({ downloadPage: args.url, userId });

      if (findPhoto) {
        const findLike = await Like.query().findOne({ photoId: findPhoto.id, userId });
        if (findLike) {
          await Like.query()
            .findById(findLike.id)
            .delete();
        }
        await Photo.query()
          .findById(findPhoto.id)
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
