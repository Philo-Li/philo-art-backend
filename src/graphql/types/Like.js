import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Like {
    id: ID!
    user: User!
    createdAt: DateTime!
    photo: Photo!
  }
`;

export const resolvers = {
  Like: {
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
