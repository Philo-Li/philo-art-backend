import { GraphQLError } from 'graphql';
import { nanoid } from 'nanoid';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Mutation {
    """
    Downloads the photo which has the given id.
    """
    downloadPhoto(id: ID!): Boolean
  }
`;

interface DownloadPhotoArgs {
  id: string;
}

export const resolvers = {
  Mutation: {
    downloadPhoto: async (
      _obj: unknown,
      args: DownloadPhotoArgs,
      { prisma }: AppContext
    ) => {
      const photo = await prisma.photo.findUnique({
        where: { id: args.id },
      });

      if (!photo) {
        throw new GraphQLError(`Photo with id ${args.id} does not exist`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const currentCount = parseInt(photo.downloadCount || '0', 10);
      const count = currentCount + 1;

      await prisma.photo.update({
        where: { id: args.id },
        data: { downloadCount: String(count) },
      });

      if (photo.userId) {
        await prisma.user.update({
          where: { id: photo.userId },
          data: {
            downloadCount: {
              increment: 1,
            },
          },
        });
      }

      let downloadCount = 1;

      const findDownloadCount = await prisma.information.findFirst({
        where: { name: 'download_count' },
      });

      if (findDownloadCount && findDownloadCount.value) {
        downloadCount = parseInt(findDownloadCount.value, 10) + 1;
        await prisma.information.update({
          where: { id: findDownloadCount.id },
          data: { value: String(downloadCount) },
        });
      } else {
        await prisma.information.create({
          data: {
            id: nanoid(),
            name: 'download_count',
            value: String(downloadCount),
          },
        });
      }

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
