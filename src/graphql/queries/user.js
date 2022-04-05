import { gql } from 'apollo-server';

export const typeDefs = gql`
  extend type Query {
    """
    Returns user by an username.
    """
    user(username: String!): User
  }
`;

export const resolvers = {
  Query: {
    user: async (obj, args, { models: { User } }) => {
      const { username } = args;
      const user = await User.query().findOne({ username });
      return user;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
