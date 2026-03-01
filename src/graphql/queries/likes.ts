import * as yup from 'yup';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
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
  first: yup.number().min(1).max(30).default(30),
  orderDirection: yup.string().default('DESC'),
  orderBy: yup.string().default('CREATED_AT'),
  userId: yup.string().trim(),
  username: yup.string().trim(),
});

interface LikesArgs {
  after?: string;
  first?: number;
  orderDirection?: string;
  orderBy?: string;
  userId?: string;
  username?: string;
}

export const resolvers = {
  Query: {
    likes: async (_obj: unknown, args: LikesArgs, { prisma }: AppContext) => {
      const normalizedArgs = await likesArgsSchema.validate(args);

      const { first, orderDirection, after, userId, username } = normalizedArgs;

      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      let where: Record<string, unknown> = {};

      if (userId) {
        where = { ...where, userId };
      } else if (username) {
        const user = await prisma.user.findFirst({ where: { username } });
        if (user) {
          where = { ...where, userId: user.id };
        }
      }

      const orderDir = orderDirection?.toLowerCase() === 'asc' ? 'asc' : 'desc';

      const likes = await prisma.like.findMany({
        where,
        orderBy: [{ createdAt: orderDir }, { id: orderDir }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.like.count({ where });

      const edges = likes.slice(0, first).map((l) => ({
        node: l,
        cursor: Buffer.from(JSON.stringify([l.id, l.createdAt])).toString(
          'base64'
        ),
      }));

      return {
        pageInfo: {
          totalCount,
          hasNextPage: likes.length > first,
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
