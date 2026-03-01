import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Query {
    """
    Returns collection by an id.
    """
    collection(id: ID!): Collection
  }
`;

interface CollectionArgs {
  id: string;
}

export const resolvers = {
  Query: {
    collection: async (
      _obj: unknown,
      args: CollectionArgs,
      { dataLoaders: { collectionLoader } }: AppContext
    ) => collectionLoader.load(args.id),
  },
};

export default {
  typeDefs,
  resolvers,
};
