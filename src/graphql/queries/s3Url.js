import { gql } from 'apollo-server';
import generateUploadURL from '../../utils/s3';

export const typeDefs = gql`
  extend type Query {
    """
    Returns the s3 upload url.
    """
    s3Url: String
  }
`;

export const resolvers = {
  Query: {
    s3Url: async (
      obj,
      args,
      { authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      if (!userId) {
        return null;
      }

      const url = await generateUploadURL();

      return url;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
