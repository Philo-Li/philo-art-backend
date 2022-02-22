import { gql, UserInputError } from 'apollo-server';

import { nanoid } from 'nanoid';

export const typeDefs = gql`
  extend type Mutation {
    """
    Follow a user.
    """
    followUser(userId: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    followUser: async (
      obj,
      args,
      { models: { Follow }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      if (userId === args.userId) {
        throw new UserInputError('Can not follow yourself');
      }

      const findFollow = await Follow.query().findOne({ followingId: args.userId, userId });

      if (findFollow) {
        return true;
      }

      const id = nanoid();

      await Follow.query().insert({
        id,
        userId,
        followingId: args.userId,
      });

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
