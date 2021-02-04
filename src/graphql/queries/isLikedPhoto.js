import { gql } from 'apollo-server';

export const typeDefs = gql`
  extend type Query {
    """
    Returns whether a liked photo by an id.
    """
    isLikedPhoto(photoId: ID!): Like
  }
`;

export const resolvers = {
  Query: {
    isLikedPhoto: async (obj, args, { models: { Like }, authService }) => {
      const userId = authService.assertIsAuthorized();
      const { photoId } = args;

      if (userId) {
        const query = Like.query().findOne({
          userId,
          photoId,
        });
        if (query) return query;
      }

      return false;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
