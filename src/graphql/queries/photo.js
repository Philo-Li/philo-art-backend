import { gql } from 'apollo-server';

export const typeDefs = gql`
  extend type Query {
    """
    Returns photo by an id.
    """
    photo(id: ID!): Photo
  }
`;

export const resolvers = {
  Query: {
    photo: async (obj, args, { dataLoaders: { photoLoader } }) =>
      photoLoader.load(args.id),
  },
};

export default {
  typeDefs,
  resolvers,
};
