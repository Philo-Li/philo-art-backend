import { gql } from 'apollo-server';
import * as yup from 'yup';

import createPaginationQuery from '../../utils/createPaginationQuery';

export const typeDefs = gql`
  enum AllPhotosOrderBy {
    CREATED_AT
  }

  extend type Query {
    """
    Returns paginated photos.
    """
    photos(
      after: String
      first: Int
      orderDirection: OrderDirection
      orderBy: AllPhotosOrderBy
      searchKeyword: String
      userId: String
      username: String
    ): PhotoConnection!
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
    photos: async (obj, args, { models: { Photo, User } }) => {
      const normalizedArgs = await photosArgsSchema.validate(args);

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

      let query = Photo.query();

      const type = ['Photograph', 'Painting', 'Digital Art', 'Drawing'];
      let likeFilter;
      let typeFilter = '';

      if (searchKeyword) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < type.length; i++) {
          if (type[i] === searchKeyword) {
            typeFilter = type[i];
            likeFilter = getLikeFilter(searchKeyword);
            query = query.where({
              type: type[i],
            });
            break;
          }
        }
        if (searchKeyword === 'Free to Use') {
          query = query.where({
            allowDownload: true,
            type: 'Photograph',
          });
        } else if (typeFilter !== searchKeyword) {
          likeFilter = getLikeFilter(searchKeyword);
          query = query.where('tags', 'like', likeFilter);
        }
      }

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
