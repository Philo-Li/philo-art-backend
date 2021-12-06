import { gql, UserInputError } from 'apollo-server';

export const typeDefs = gql`
  extend type Mutation {
    """
    Unfollow the user which has the given user id, if it is created by the authorized user.
    """
    unfollowUser(userId: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    unfollowUser: async (obj, args, { models: { Follow }, authService }) => {
      const userId = authService.assertIsAuthorized();

      const findFollow = await Follow.query().findOne({ followingId: args.userId, userId });

      if (findFollow) {
        await Follow.query()
          .findById(findFollow.id)
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
