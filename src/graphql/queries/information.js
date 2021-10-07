import { gql } from 'apollo-server';

export const typeDefs = gql`
  extend type Query {
    """
    Returns information by an id.
    """
    information(id: ID!): Information
  }
`;

export const resolvers = {
  Query: {
    information: async (obj, args, { dataLoaders: { informationLoader } }) =>
      informationLoader.load(args.id),
  },
};

export default {
  typeDefs,
  resolvers,
};
