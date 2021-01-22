import { gql } from 'apollo-server';

export const typeDefs = gql`
  type PhotoReview {
    id: ID!
    user: User!
    photo: Photo!
    text: String!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  PhotoReview: {
    user: async ({ userId }, args, { dataLoaders: { userLoader } }) =>
      userLoader.load(userId),
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
