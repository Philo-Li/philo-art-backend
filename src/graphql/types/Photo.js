import { gql } from 'apollo-server';
import * as yup from 'yup';

import createPaginationQuery from '../../utils/createPaginationQuery';

export const typeDefs = gql`
  type Photo {
    id: ID!
    title: String!
    titleEn: String!
    userId: String!
    user: User!
    createdAt: DateTime!
    likes(first: Int, after: String): LikeConnection!
    viewsCount: Int
    likesCount: Int
    url: String
    description: String!
    text: String!
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
    user: ({ userId }, args, { dataLoaders: { userLoader } }) => {
      return userLoader.load(userId);
    },
    likes: async (obj, args, { models: { Like } }) => {
      const normalizedArgs = await likesArgsSchema.validate(args);

      return createPaginationQuery(
        () =>
          Like.query().where({
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
