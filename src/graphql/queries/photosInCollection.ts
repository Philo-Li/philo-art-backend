import * as yup from 'yup';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  enum AllColletedPhotosOrderBy {
    CREATED_AT
  }

  extend type Query {
    """
    Returns paginated photos.
    """
    photosInCollection(
      after: String
      first: Int
      orderDirection: OrderDirection
      orderBy: AllColletedPhotosOrderBy
      id: ID!
    ): CollectedPhotoConnection!
  }
`;

const photosArgsSchema = yup.object({
  after: yup.string(),
  first: yup.number().min(1).max(30).default(30),
  orderDirection: yup.string().default('DESC'),
  orderBy: yup.string().default('CREATED_AT'),
  id: yup.string().trim().required(),
});

interface PhotosInCollectionArgs {
  after?: string;
  first?: number;
  orderDirection?: string;
  orderBy?: string;
  id: string;
}

export const resolvers = {
  Query: {
    photosInCollection: async (
      _obj: unknown,
      args: PhotosInCollectionArgs,
      { prisma }: AppContext
    ) => {
      const normalizedArgs = await photosArgsSchema.validate(args);

      const { first, orderDirection, after, id } = normalizedArgs;

      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const orderDir = orderDirection?.toLowerCase() === 'asc' ? 'asc' : 'desc';

      const collectedPhotos = await prisma.collectedPhoto.findMany({
        where: { collectionId: id },
        orderBy: [{ createdAt: orderDir }, { id: orderDir }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.collectedPhoto.count({
        where: { collectionId: id },
      });

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
