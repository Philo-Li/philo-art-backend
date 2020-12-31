import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Collection {
    id: ID!
    userId: String!
    user: User!
    title: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
    photos(first: Int, after: String): PhotoConnection!
    cover_photo_url: String
  }
`;

export const resolvers = {
  Collection: {
    user: async ({ userId }, args, { dataLoaders: { userLoader } }) =>
      userLoader.load(userId),
    photos: async (obj, args, { models: { Photo } }) => {
      const normalizedArgs = await photosArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          Photo.query().where({
            collectionId: obj.id,
          }),
        {
          orderColumn: 'createdAt',
          orderDirection: 'desc',
          first: normalizedArgs.first,
          after: normalizedArgs.after,
        },
      );
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
