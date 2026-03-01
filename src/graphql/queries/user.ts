import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Query {
    """
    Returns user by an username.
    """
    user(username: String!): User
  }
`;

interface UserArgs {
  username: string;
}

export const resolvers = {
  Query: {
    user: async (_obj: unknown, args: UserArgs, { prisma }: AppContext) => {
      const { username } = args;
      const user = await prisma.user.findFirst({ where: { username } });
      return user;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
