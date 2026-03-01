import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Query {
    """
    Returns photo by an id.
    """
    photo(id: ID!): Photo
  }
`;

interface PhotoArgs {
  id: string;
}

export const resolvers = {
  Query: {
    photo: async (
      _obj: unknown,
      args: PhotoArgs,
      { dataLoaders: { photoLoader } }: AppContext
    ) => photoLoader.load(args.id),
  },
};

export default {
  typeDefs,
  resolvers,
};
