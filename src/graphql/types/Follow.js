import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Follow {
    id: ID!
    user: User!
    following: User!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  Follow: {
    user: async ({ userId }, args, { dataLoaders: { userLoader } }) =>
      userLoader.load(userId),
    following: async ({ followingId }, args, { dataLoaders: { userLoader } }) =>
      userLoader.load(followingId),
  },
};

export default {
  typeDefs,
  resolvers,
};
