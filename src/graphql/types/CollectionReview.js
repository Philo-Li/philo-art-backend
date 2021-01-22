import { gql } from 'apollo-server';

export const typeDefs = gql`
  type CollectionReview {
    id: ID!
    user: User!
    collection: Collection!
    text: String!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  CollectionReview: {
    user: async ({ userId }, args, { dataLoaders: { userLoader } }) =>
      userLoader.load(userId),
    collection: (
      { collectionId },
      args,
      { dataLoaders: { collectionLoader } },
    ) => collectionLoader.load(collectionId),
  },
};

export default {
  typeDefs,
  resolvers,
};
