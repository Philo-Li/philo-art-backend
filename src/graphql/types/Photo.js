import { gql } from 'apollo-server';
import * as yup from 'yup';

import createPaginationQuery from '../../utils/createPaginationQuery';

export const typeDefs = gql`
  type Photo {
    id: ID!
    width: Int!
    height: Int!
    color: String!
    createdAt: DateTime!
    likes: Int
    downloads: Int
    url: String
    description: String!
    tags: [String!]!
    collections(first: Int, after: String): CollectionConnection!
  }
`;

const likesArgsSchema = yup.object({
  after: yup.string(),
  first: yup
    .number()
    .min(1)
    .max(30)
    .default(30),
});

export const resolvers = {
  Photo: {
    collections: async (obj, args, { models: { Collection } }) => {
      const normalizedArgs = await collectionsArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          Collection.query().where({
            photoId: obj.id,
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
