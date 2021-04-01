import { gql } from 'apollo-server';
import * as yup from 'yup';

import createPaginationQuery from '../../utils/createPaginationQuery';

export const typeDefs = gql`
  enum AllLikesOrderBy {
    CREATED_AT
  }

  extend type Query {
    """
    Returns paginated liked photos.
    """
    likes(
      after: String
      first: Int
      orderDirection: OrderDirection
      orderBy: AllLikesOrderBy
      userId: String
      username: String
    ): LikeConnection!
  }
`;

const likesArgsSchema = yup.object({
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

export const resolvers = {
  Query: {
    likes: async (obj, args, { models: { Like, User } }) => {
      const normalizedArgs = await likesArgsSchema.validate(args);

      const {
        first,
        orderDirection,
        after,
        orderBy,
        userId,
        username,
      } = normalizedArgs;

      const orderColumn = orderColumnByOrderBy[orderBy];

      let query = Like.query();

      if (userId) {
        query = query.where({
          userId,
        });
      } else if (username) {
        const user = await User.query().findOne({ username });
        query = query.where({
          userId: user.id,
        });
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
