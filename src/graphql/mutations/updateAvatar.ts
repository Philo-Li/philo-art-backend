import { GraphQLError } from 'graphql';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Mutation {
    """
    Update one user's avatar.
    """
    updateAvatar(url: String!): Boolean
  }
`;

interface UpdateAvatarArgs {
  url: string;
}

export const resolvers = {
  Mutation: {
    updateAvatar: async (
      _obj: unknown,
      args: UpdateAvatarArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new GraphQLError('User does not exist.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const pathToImage = args.url.substring(53);
      const keyTiny = `300x300/${pathToImage}`;
      const srcTiny = `https://cdn.philoart.io/${keyTiny}`;

      await prisma.user.update({
        where: { id: userId },
        data: { profileImage: srcTiny },
      });

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
