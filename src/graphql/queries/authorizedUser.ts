import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Query {
    """
    Returns the authorized user.
    """
    authorizedUser: User
  }
`;

export const resolvers = {
  Query: {
    authorizedUser: (
      _obj: unknown,
      _args: unknown,
      { dataLoaders: { userLoader }, authService }: AppContext
    ) => {
      const userId = authService.getUserId();

      if (!userId) {
        return null;
      }

      return userLoader.load(userId);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
