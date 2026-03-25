import * as yup from 'yup';
import type { Photo as PrismaPhoto } from '@prisma/client';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  type Photo {
    id: ID!
    user: User!
    title: String!
    slug: String
    year: Int!
    description: String
    allTags: String
    tags: String
    imageKey: String!
    srcTiny: String
    srcSmall: String
    srcLarge: String
    srcOriginal: String
    srcYoutube: String
    color: String
    allColors: String
    downloadCount: String
    creditId: String
    license: String
    type: String
    status: String
    width: Int
    height: Int
    cameraMake: String
    cameraModel: String
    lens: String
    focalLength: Float
    aperture: Float
    shutterSpeed: String
    iso: Int
    dateTaken: DateTime
    allowDownload: Boolean!
    likes(first: Int, after: String): LikeConnection!
    likeCount: Int
    collections(first: Int, after: String): CollectedPhotoConnection!
    collectionCount: Int
    reviews(first: Int, after: String): PhotoReviewConnection!
    reviewCount: Int
    isLiked(checkUserLike: ID): Boolean!
    isCollected(checkUserCollect: ID): Boolean!
    createdAt: DateTime!
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

interface IsLikedArgs {
  checkUserLike?: string;
}

interface IsCollectedArgs {
  checkUserCollect?: string;
}

export const resolvers = {
  Photo: {
    user: async (
      { userId }: PrismaPhoto,
      _args: unknown,
      { dataLoaders: { userLoader } }: AppContext
    ) => userLoader.load(userId!),
    likes: async (
      obj: PrismaPhoto,
      args: PaginationArgs,
      { prisma }: AppContext
    ) => {
      const { first, after } = await paginationArgsSchema.validate(args);
      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const likes = await prisma.like.findMany({
        where: { photoId: obj.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.like.count({
        where: { photoId: obj.id },
      });

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
    likeCount: async (
      { id }: PrismaPhoto,
      _args: unknown,
      { dataLoaders: { photoLikeCountLoader } }: AppContext
    ) => photoLikeCountLoader.load(id),
    collections: async (
      obj: PrismaPhoto,
      args: PaginationArgs,
      { prisma }: AppContext
    ) => {
      const { first, after } = await paginationArgsSchema.validate(args);
      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const collectedPhotos = await prisma.collectedPhoto.findMany({
        where: { photoId: obj.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.collectedPhoto.count({
        where: { photoId: obj.id },
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
    collectionCount: async (
      { id }: PrismaPhoto,
      _args: unknown,
      { dataLoaders: { photoCollectionCountLoader } }: AppContext
    ) => photoCollectionCountLoader.load(id),
    reviews: async (
      obj: PrismaPhoto,
      args: PaginationArgs,
      { prisma }: AppContext
    ) => {
      const { first, after } = await paginationArgsSchema.validate(args);
      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const reviews = await prisma.photoReview.findMany({
        where: { photoId: obj.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.photoReview.count({
        where: { photoId: obj.id },
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
      { id }: PrismaPhoto,
      _args: unknown,
      { dataLoaders: { photoReviewCountLoader } }: AppContext
    ) => photoReviewCountLoader.load(id),
    isLiked: async (
      obj: PrismaPhoto,
      args: IsLikedArgs,
      { prisma }: AppContext
    ): Promise<boolean> => {
      const userId = args.checkUserLike;

      if (userId) {
        const like = await prisma.like.findFirst({
          where: {
            userId,
            photoId: obj.id,
          },
        });
        if (like) return true;
      }

      return false;
    },
    isCollected: async (
      obj: PrismaPhoto,
      args: IsCollectedArgs,
      { prisma }: AppContext
    ): Promise<boolean> => {
      const userId = args.checkUserCollect;

      if (userId) {
        const collectedPhoto = await prisma.collectedPhoto.findFirst({
          where: {
            userId,
            photoId: obj.id,
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
