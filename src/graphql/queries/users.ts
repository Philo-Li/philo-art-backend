import * as yup from 'yup';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Query {
    """
    Returns paginated users.
    """
    users(first: Int, after: String): UserConnection!
  }
`;

const usersArgsSchema = yup.object({
  after: yup.string(),
  first: yup.number().min(1).max(30).default(30),
});

interface UsersArgs {
  after?: string;
  first?: number;
}

export const resolvers = {
  Query: {
    users: async (_obj: unknown, args: UsersArgs, { prisma }: AppContext) => {
      const { first, after } = await usersArgsSchema.validate(args);
      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const users = await prisma.user.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.user.count();

      const edges = users.slice(0, first).map((u) => ({
        node: u,
        cursor: Buffer.from(JSON.stringify([u.id, u.createdAt])).toString(
          'base64'
        ),
      }));

      return {
        pageInfo: {
          totalCount,
          hasNextPage: users.length > first,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        edges,
      };
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
