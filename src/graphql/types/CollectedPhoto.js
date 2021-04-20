import { gql } from 'apollo-server';

export const typeDefs = gql`
  type CollectedPhoto {
    id: ID!
    user: User!
    collection: Collection!
    photo(userId: ID): Photo!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  CollectedPhoto: {
    user: async ({ userId }, args, { dataLoaders: { userLoader } }) =>
      userLoader.load(userId),
    collection: (
      { collectionId },
      args,
      { dataLoaders: { collectionLoader } },
    ) => collectionLoader.load(collectionId),
    photo: (
      { photoId },
      args,
      { dataLoaders: { photoLoader } },
    ) => photoLoader.load(photoId),
  },
};

export default {
  typeDefs,
  resolvers,
};
