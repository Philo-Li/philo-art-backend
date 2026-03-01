import * as yup from 'yup';
import type { User as PrismaUser } from '@prisma/client';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    philoartId: Int!
    firstName: String
    lastName: String
    email: String
    profileImage: String
    description: String
    socialMediaLink: String
    isFollowed(checkUserFollow: ID): Boolean!
    photos(first: Int, after: String): PhotoConnection
    photoCount: Int
    followings(first: Int, after: String): FollowConnection
    followingCount: Int
    followers(first: Int, after: String): FollowConnection
    followerCount: Int
    likes(first: Int, after: String): LikeConnection
    likeCount: Int
    collections(first: Int, after: String): CollectionConnection
    collectionCount: Int
    downloadCount: Int
    createdAt: DateTime!
    updatedAt: DateTime
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

interface IsFollowedArgs {
  checkUserFollow?: string;
}

export const resolvers = {
  User: {
    isFollowed: async (
      obj: PrismaUser,
      args: IsFollowedArgs,
      { prisma }: AppContext
    ): Promise<boolean> => {
      const userId = args.checkUserFollow;

      if (userId) {
        const follow = await prisma.follow.findFirst({
          where: {
            userId,
            followingId: obj.id,
          },
        });
        if (follow) return true;
      }

      return false;
    },
    photos: async (
      obj: PrismaUser,
      args: PaginationArgs,
      { prisma }: AppContext
    ) => {
      const { first, after } = await paginationArgsSchema.validate(args);
      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const photos = await prisma.photo.findMany({
        where: { userId: obj.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.photo.count({ where: { userId: obj.id } });

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
    photoCount: async (
      { id }: PrismaUser,
      _args: unknown,
      { dataLoaders: { userPhotoCountLoader } }: AppContext
    ) => userPhotoCountLoader.load(id),
    likes: async (
      obj: PrismaUser,
      args: PaginationArgs,
      { prisma }: AppContext
    ) => {
      const { first, after } = await paginationArgsSchema.validate(args);
      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const likes = await prisma.like.findMany({
        where: { userId: obj.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.like.count({ where: { userId: obj.id } });

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
      { id }: PrismaUser,
      _args: unknown,
      { dataLoaders: { userLikeCountLoader } }: AppContext
    ) => userLikeCountLoader.load(id),
    collections: async (
      obj: PrismaUser,
      args: PaginationArgs,
      { prisma }: AppContext
    ) => {
      const { first, after } = await paginationArgsSchema.validate(args);
      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const collections = await prisma.collection.findMany({
        where: { userId: obj.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.collection.count({
        where: { userId: obj.id },
      });

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
    collectionCount: async (
      { id }: PrismaUser,
      _args: unknown,
      { dataLoaders: { userCollectionCountLoader } }: AppContext
    ) => userCollectionCountLoader.load(id),
    followings: async (
      obj: PrismaUser,
      args: PaginationArgs,
      { prisma }: AppContext
    ) => {
      const { first, after } = await paginationArgsSchema.validate(args);
      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const follows = await prisma.follow.findMany({
        where: { userId: obj.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.follow.count({
        where: { userId: obj.id },
      });

      const edges = follows.slice(0, first).map((f) => ({
        node: f,
        cursor: Buffer.from(JSON.stringify([f.id, f.createdAt])).toString(
          'base64'
        ),
      }));

      return {
        pageInfo: {
          totalCount,
          hasNextPage: follows.length > first,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        edges,
      };
    },
    followingCount: async (
      { id }: PrismaUser,
      _args: unknown,
      { dataLoaders: { userFollowingCountLoader } }: AppContext
    ) => userFollowingCountLoader.load(id),
    followers: async (
      obj: PrismaUser,
      args: PaginationArgs,
      { prisma }: AppContext
    ) => {
      const { first, after } = await paginationArgsSchema.validate(args);
      const parsedCursor = after
        ? JSON.parse(Buffer.from(after, 'base64').toString('ascii'))
        : undefined;

      const follows = await prisma.follow.findMany({
        where: { followingId: obj.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: first + 1,
        ...(parsedCursor && {
          cursor: { id: parsedCursor[0] },
          skip: 1,
        }),
      });

      const totalCount = await prisma.follow.count({
        where: { followingId: obj.id },
      });

      const edges = follows.slice(0, first).map((f) => ({
        node: f,
        cursor: Buffer.from(JSON.stringify([f.id, f.createdAt])).toString(
          'base64'
        ),
      }));

      return {
        pageInfo: {
          totalCount,
          hasNextPage: follows.length > first,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        edges,
      };
    },
    followerCount: async (
      { id }: PrismaUser,
      _args: unknown,
      { dataLoaders: { userFollowerCountLoader } }: AppContext
    ) => userFollowerCountLoader.load(id),
  },
};

export default {
  typeDefs,
  resolvers,
};
