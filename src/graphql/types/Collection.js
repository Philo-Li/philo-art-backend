import { gql } from 'apollo-server';
import * as yup from 'yup';

import createPaginationQuery from '../../utils/createPaginationQuery';

export const typeDefs = gql`
  type Collection {
    id: ID!
    userId: String!
    user: User!
    title: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime
    photos(first: Int, after: String): PhotoConnection!
    cover: String
  }
`;

const photosArgsSchema = yup.object({
  after: yup.string(),
  first: yup
    .number()
    .min(1)
    .max(30)
    .default(30),
});

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
