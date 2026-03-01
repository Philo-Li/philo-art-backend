import * as yup from 'yup';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Query {
    """
    Returns paginated collected photos.
    """
    collectedPhotos(first: Int, after: String): CollectedPhotoConnection!
  }
`;

const collectedPhotosArgsSchema = yup.object({
  after: yup.string(),
  first: yup.number().min(1).max(30).default(30),
});

interface CollectedPhotosArgs {
  after?: string;
  first?: number;
}

export const resolvers = {
  Query: {
    collectedPhotos: async (
      _obj: unknown,
      args: CollectedPhotosArgs,
      { prisma }: AppContext
    ) => {
      const { first, after } = await collectedPhotosArgsSchema.validate(args);
      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const collectedPhotos = await prisma.collectedPhoto.findMany({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.collectedPhoto.count();

      const edges = collectedPhotos.slice(0, first).map((cp) => ({
        node: cp,
        cursor: Buffer.from(JSON.stringify([cp.id, cp.createdAt])).toString(
          'base64'
        ),
      }));

      return {
        pageInfo: {
          totalCount,
          hasNextPage: collectedPhotos.length > first,
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
