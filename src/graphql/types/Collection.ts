import * as yup from 'yup';
import type { Collection as PrismaCollection } from '@prisma/client';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  type Collection {
    id: ID!
    userId: String!
    user: User!
    title: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime
    photos(first: Int, after: String): CollectedPhotoConnection!
    photoCount: Int
    reviews(first: Int, after: String): CollectionReviewConnection!
    reviewCount: Int
    cover: String
    public: Boolean!
    isCollected(checkPhotoCollect: ID): Boolean!
  }
`;

const paginationArgsSchema = yup.object({
  after: yup.string(),
  first: yup.number().min(1).max(30).default(30),
});

interface PaginationArgs {
  after?: string;
  first?: number;
}

interface IsCollectedArgs {
  checkPhotoCollect?: string;
}

export const resolvers = {
  Collection: {
    user: async (
      { userId }: PrismaCollection,
      _args: unknown,
      { dataLoaders: { userLoader } }: AppContext
    ) => userLoader.load(userId!),
    photos: async (
      obj: PrismaCollection,
      args: PaginationArgs,
      { prisma }: AppContext
    ) => {
      const { first, after } = await paginationArgsSchema.validate(args);
      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const collectedPhotos = await prisma.collectedPhoto.findMany({
        where: { collectionId: obj.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.collectedPhoto.count({
        where: { collectionId: obj.id },
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
    photoCount: async (
      { id }: PrismaCollection,
      _args: unknown,
      { dataLoaders: { collectionPhotoCountLoader } }: AppContext
    ) => collectionPhotoCountLoader.load(id),
    reviews: async (
      obj: PrismaCollection,
      args: PaginationArgs,
      { prisma }: AppContext
    ) => {
      const { first, after } = await paginationArgsSchema.validate(args);
      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const reviews = await prisma.collectionReview.findMany({
        where: { collectionId: obj.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.collectionReview.count({
        where: { collectionId: obj.id },
      });

      const edges = reviews.slice(0, first).map((r) => ({
        node: r,
        cursor: Buffer.from(JSON.stringify([r.id, r.createdAt])).toString(
          'base64'
        ),
      }));

      return {
        pageInfo: {
          totalCount,
          hasNextPage: reviews.length > first,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        edges,
      };
    },
    reviewCount: async (
      { id }: PrismaCollection,
      _args: unknown,
      { dataLoaders: { collectionReviewCountLoader } }: AppContext
    ) => collectionReviewCountLoader.load(id),
    isCollected: async (
      obj: PrismaCollection,
      args: IsCollectedArgs,
      { prisma }: AppContext
    ): Promise<boolean> => {
      const photoId = args.checkPhotoCollect;

      if (photoId) {
        const collectedPhoto = await prisma.collectedPhoto.findFirst({
          where: {
            photoId,
            collectionId: obj.id,
          },
        });
        if (collectedPhoto) return true;
      }

      return false;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
