import { gql } from 'apollo-server';
import * as yup from 'yup';

import createPaginationQuery from '../../utils/createPaginationQuery';

export const typeDefs = gql`
  enum AllColletedPhotosOrderBy {
    CREATED_AT
  }

  extend type Query {
    """
    Returns paginated photos.
    """
    photosInCollection(
      after: String
      first: Int
      orderDirection: OrderDirection
      orderBy: AllColletedPhotosOrderBy
      id: ID!
    ): CollectedPhotoConnection!
  }
`;

const photosArgsSchema = yup.object({
  after: yup.string(),
  first: yup
    .number()
    .min(1)
    .max(30)
    .default(30),
  orderDirection: yup.string().default('DESC'),
  orderBy: yup.string().default('CREATED_AT'),
  id: yup.string().trim(),
});

const orderColumnByOrderBy = {
  CREATED_AT: 'createdAt',
};

export const resolvers = {
  Query: {
    photosInCollection: async (obj, args, { models: { CollectedPhoto } }) => {
      const normalizedArgs = await photosArgsSchema.validate(args);

      const {
        first,
        orderDirection,
        after,
        orderBy,
      } = normalizedArgs;

      const orderColumn = orderColumnByOrderBy[orderBy];

      return createPaginationQuery(
        () =>
          CollectedPhoto.query().where({
            collectionId: args.id,
          }),
        {
          first,
          after,
          orderBy,
          orderDirection: orderDirection.toLowerCase(),
          orderColumn,
        },
      );
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
