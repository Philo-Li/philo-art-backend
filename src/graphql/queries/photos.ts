import * as yup from 'yup';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
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
  first: yup.number().min(1).max(30).default(30),
  orderDirection: yup.string().default('DESC'),
  orderBy: yup.string().default('CREATED_AT'),
  searchKeyword: yup.string().trim(),
  userId: yup.string().trim(),
  username: yup.string().trim(),
});

interface PhotosArgs {
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
    photos: async (_obj: unknown, args: PhotosArgs, { prisma }: AppContext) => {
      const normalizedArgs = await photosArgsSchema.validate(args);

      const { first, orderDirection, after, searchKeyword, userId, username } =
        normalizedArgs;

      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const type = ['Photograph', 'Painting', 'Digital Art', 'Drawing'];
      let where: Record<string, unknown> = {};

      if (searchKeyword) {
        let typeFilter = '';
        for (let i = 0; i < type.length; i++) {
          if (type[i] === searchKeyword) {
            typeFilter = type[i];
            where = { ...where, type: type[i] };
            break;
          }
        }
        if (searchKeyword === 'Free to Use') {
          where = { ...where, allowDownload: true, type: 'Photograph' };
        } else if (typeFilter !== searchKeyword) {
          where = { ...where, tags: { contains: searchKeyword } };
        }
      }

      if (userId) {
        where = { ...where, userId };
      } else if (username) {
        const user = await prisma.user.findFirst({ where: { username } });
        if (user) {
          where = { ...where, userId: user.id };
        }
      }

      const orderDir = orderDirection?.toLowerCase() === 'asc' ? 'asc' : 'desc';

      const photos = await prisma.photo.findMany({
        where,
        orderBy: [{ createdAt: orderDir }, { id: orderDir }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.photo.count({ where });

      const edges = photos.slice(0, first).map((p) => ({
        node: p,
        cursor: Buffer.from(JSON.stringify([p.id, p.createdAt])).toString(
          'base64'
        ),
      }));

      return {
        pageInfo: {
          totalCount,
          hasNextPage: photos.length > first,
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
