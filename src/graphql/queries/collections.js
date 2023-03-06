import { gql } from 'apollo-server';
import * as yup from 'yup';

import createPaginationQuery from '../../utils/createPaginationQuery';

export const typeDefs = gql`
  enum AllCollectionsOrderBy {
    CREATED_AT
  }

  extend type Query {
    """
    Returns paginated collections.
    """
    collections(
      after: String
      first: Int
      orderDirection: OrderDirection
      orderBy: AllCollectionsOrderBy
      searchKeyword: String
      userId: String
      username: String
    ): CollectionConnection!
  }
`;

const collectionsArgsSchema = yup.object({
  after: yup.string(),
  first: yup
    .number()
    .min(1)
    .max(30)
    .default(30),
  orderDirection: yup.string().default('DESC'),
  orderBy: yup.string().default('CREATED_AT'),
  searchKeyword: yup.string().trim(),
  userId: yup.string().trim(),
  username: yup.string().trim(),
});

const orderColumnByOrderBy = {
  CREATED_AT: 'createdAt',
};

const getLikeFilter = (value) => `%${value}%`;

export const resolvers = {
  Query: {
    collections: async (obj, args, { models: { Collection, User } }) => {
      const normalizedArgs = await collectionsArgsSchema.validate(args);

      const {
        first,
        orderDirection,
        after,
        orderBy,
        searchKeyword,
        userId,
        username,
      } = normalizedArgs;

      const orderColumn = orderColumnByOrderBy[orderBy];

      let query = Collection.query();

      if (userId) {
        query = query.where({
          userId,
        });
      } else if (username) {
        const user = await User.query().findOne({ username });
        if (user) {
          query = query.where({
            userId: user.id,
          });
        }
      }

      if (searchKeyword) {
        const likeFilter = getLikeFilter(searchKeyword);

        query = query
          .where('title', 'like', likeFilter)
          .orWhere('description', 'like', likeFilter);
      }

      return createPaginationQuery(() => query.clone(), {
        first,
        after,
        orderDirection: orderDirection.toLowerCase(),
        orderColumn,
      });
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
