import type { AppContext } from '../../types/context.js';
import generateUploadURL from '../../utils/s3.js';

export const typeDefs = `#graphql
  extend type Query {
    """
    Returns the s3 upload url.
    """
    s3Url: String
  }
`;

export const resolvers = {
  Query: {
    s3Url: async (_obj: unknown, _args: unknown, { authService }: AppContext) => {
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
