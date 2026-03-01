import * as yup from 'yup';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  enum AllCollectionsOrderBy {
    CREATED_AT
  }

  extend type Query {
    """
    Returns paginated collections.
    """
    collections(
      after: String
      first: Int
      orderDirection: OrderDirection
      orderBy: AllCollectionsOrderBy
      searchKeyword: String
      userId: String
      username: String
    ): CollectionConnection!
  }
`;

const collectionsArgsSchema = yup.object({
  after: yup.string(),
  first: yup.number().min(1).max(30).default(30),
  orderDirection: yup.string().default('DESC'),
  orderBy: yup.string().default('CREATED_AT'),
  searchKeyword: yup.string().trim(),
  userId: yup.string().trim(),
  username: yup.string().trim(),
});

interface CollectionsArgs {
  after?: string;
  first?: number;
  orderDirection?: string;
  orderBy?: string;
  searchKeyword?: string;
  userId?: string;
  username?: string;
}

export const resolvers = {
  Query: {
    collections: async (
      _obj: unknown,
      args: CollectionsArgs,
      { prisma }: AppContext
    ) => {
      const normalizedArgs = await collectionsArgsSchema.validate(args);

      const { first, orderDirection, after, searchKeyword, userId, username } =
        normalizedArgs;

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

      if (searchKeyword) {
        where = {
          ...where,
          OR: [
            { title: { contains: searchKeyword } },
            { description: { contains: searchKeyword } },
          ],
        };
      }

      const orderDir = orderDirection?.toLowerCase() === 'asc' ? 'asc' : 'desc';

      const collections = await prisma.collection.findMany({
        where,
        orderBy: [{ createdAt: orderDir }, { id: orderDir }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.collection.count({ where });

      const edges = collections.slice(0, first).map((c) => ({
        node: c,
        cursor: Buffer.from(JSON.stringify([c.id, c.createdAt])).toString(
          'base64'
        ),
      }));

      return {
        pageInfo: {
          totalCount,
          hasNextPage: collections.length > first,
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
