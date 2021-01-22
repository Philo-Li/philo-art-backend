import { gql } from 'apollo-server';

export const typeDefs = gql`
  extend type Query {
    """
    Returns collection by an id.
    """
    collection(id: ID!): Collection
  }
`;

export const resolvers = {
  Query: {
    collection: async (obj, args, { dataLoaders: { collectionLoader } }) =>
      collectionLoader.load(args.id),
  },
};

export default {
  typeDefs,
  resolvers,
};
