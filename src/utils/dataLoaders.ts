import DataLoader from 'dataloader';
import type { PrismaClient, User, Photo, Collection } from '@prisma/client';

export const createDataLoaders = (prisma: PrismaClient) => ({
  userLoader: new DataLoader<string, User | null>(async (ids) => {
    const users = await prisma.user.findMany({
      where: { id: { in: [...ids] } },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    return ids.map((id) => userMap.get(id) ?? null);
  }),

  photoLoader: new DataLoader<string, Photo | null>(async (ids) => {
    const photos = await prisma.photo.findMany({
      where: { id: { in: [...ids] } },
    });
    const photoMap = new Map(photos.map((p) => [p.id, p]));
    return ids.map((id) => photoMap.get(id) ?? null);
  }),

  collectionLoader: new DataLoader<string, Collection | null>(async (ids) => {
    const collections = await prisma.collection.findMany({
      where: { id: { in: [...ids] } },
    });
    const collectionMap = new Map(collections.map((c) => [c.id, c]));
    return ids.map((id) => collectionMap.get(id) ?? null);
  }),

  collectionPhotoCountLoader: new DataLoader<string, number>(
    async (collectionIds) => {
      const counts = await prisma.collectedPhoto.groupBy({
        by: ['collectionId'],
        where: { collectionId: { in: [...collectionIds] } },
        _count: { collectionId: true },
      });
      const countMap = new Map(
        counts.map((c) => [c.collectionId, c._count.collectionId])
      );
      return collectionIds.map((id) => countMap.get(id) ?? 0);
    }
  ),

  userPhotoCountLoader: new DataLoader<string, number>(async (userIds) => {
    const counts = await prisma.photo.groupBy({
      by: ['userId'],
      where: { userId: { in: [...userIds] } },
      _count: { userId: true },
    });
    const countMap = new Map(counts.map((c) => [c.userId, c._count.userId]));
    return userIds.map((id) => countMap.get(id) ?? 0);
  }),

  userLikeCountLoader: new DataLoader<string, number>(async (userIds) => {
    const counts = await prisma.like.groupBy({
      by: ['userId'],
      where: { userId: { in: [...userIds] } },
      _count: { userId: true },
    });
    const countMap = new Map(counts.map((c) => [c.userId, c._count.userId]));
    return userIds.map((id) => countMap.get(id) ?? 0);
  }),

  userFollowerCountLoader: new DataLoader<string, number>(async (userIds) => {
    const counts = await prisma.follow.groupBy({
      by: ['followingId'],
      where: { followingId: { in: [...userIds] } },
      _count: { followingId: true },
    });
    const countMap = new Map(
      counts.map((c) => [c.followingId, c._count.followingId])
    );
    return userIds.map((id) => countMap.get(id) ?? 0);
  }),

  userFollowingCountLoader: new DataLoader<string, number>(async (userIds) => {
    const counts = await prisma.follow.groupBy({
      by: ['userId'],
      where: { userId: { in: [...userIds] } },
      _count: { userId: true },
    });
    const countMap = new Map(counts.map((c) => [c.userId, c._count.userId]));
    return userIds.map((id) => countMap.get(id) ?? 0);
  }),

  userCollectionCountLoader: new DataLoader<string, number>(async (userIds) => {
    const counts = await prisma.collection.groupBy({
      by: ['userId'],
      where: { userId: { in: [...userIds] } },
      _count: { userId: true },
    });
    const countMap = new Map(counts.map((c) => [c.userId, c._count.userId]));
    return userIds.map((id) => countMap.get(id) ?? 0);
  }),

  photoLikeCountLoader: new DataLoader<string, number>(async (photoIds) => {
    const counts = await prisma.like.groupBy({
      by: ['photoId'],
      where: { photoId: { in: [...photoIds] } },
      _count: { photoId: true },
    });
    const countMap = new Map(counts.map((c) => [c.photoId, c._count.photoId]));
    return photoIds.map((id) => countMap.get(id) ?? 0);
  }),

  photoCollectionCountLoader: new DataLoader<string, number>(
    async (photoIds) => {
      const counts = await prisma.collectedPhoto.groupBy({
        by: ['photoId'],
        where: { photoId: { in: [...photoIds] } },
        _count: { photoId: true },
      });
      const countMap = new Map(
        counts.map((c) => [c.photoId, c._count.photoId])
      );
      return photoIds.map((id) => countMap.get(id) ?? 0);
    }
  ),

  photoReviewCountLoader: new DataLoader<string, number>(async (photoIds) => {
    const counts = await prisma.photoReview.groupBy({
      by: ['photoId'],
      where: { photoId: { in: [...photoIds] } },
      _count: { photoId: true },
    });
    const countMap = new Map(counts.map((c) => [c.photoId, c._count.photoId]));
    return photoIds.map((id) => countMap.get(id) ?? 0);
  }),

  collectionReviewCountLoader: new DataLoader<string, number>(
    async (collectionIds) => {
      const counts = await prisma.collectionReview.groupBy({
        by: ['collectionId'],
        where: { collectionId: { in: [...collectionIds] } },
        _count: { collectionId: true },
      });
      const countMap = new Map(
        counts.map((c) => [c.collectionId, c._count.collectionId])
      );
      return collectionIds.map((id) => countMap.get(id) ?? 0);
    }
  ),

  userPhotoLikeExistsLoader: new DataLoader<[string, string], boolean>(
    async (userIdPhotoIdTuples) => {
      const userIds = userIdPhotoIdTuples.map(([userId]) => userId);
      const photoIds = userIdPhotoIdTuples.map(([, photoId]) => photoId);

      const likes = await prisma.like.findMany({
        where: {
          photoId: { in: photoIds },
          userId: { in: userIds },
        },
        select: { photoId: true, userId: true },
      });

      return userIdPhotoIdTuples.map(([userId, photoId]) => {
        return likes.some(
          (like) => like.userId === userId && like.photoId === photoId
        );
      });
    },
    {
      cacheKeyFn: ((key: [string, string]) => JSON.stringify(key)) as unknown as (
        key: [string, string]
      ) => [string, string],
    }
  ),
});

export type DataLoaders = ReturnType<typeof createDataLoaders>;
