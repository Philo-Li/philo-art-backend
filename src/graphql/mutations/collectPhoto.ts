import * as yup from 'yup';
import { nanoid } from 'nanoid';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  input CollectPhotoInput {
    photoId: ID!
    collectionId: ID!
  }

  extend type Mutation {
    """
    Collect a new photo to a Collection.
    """
    collectPhoto(collect: CollectPhotoInput): CollectedPhoto
  }
`;

const collectPhotoInputSchema = yup.object().shape({
  photoId: yup.string().required().trim(),
  collectionId: yup.string().required().trim(),
});

interface CollectPhotoArgs {
  collect: {
    photoId: string;
    collectionId: string;
  };
}

export const resolvers = {
  Mutation: {
    collectPhoto: async (
      _obj: unknown,
      args: CollectPhotoArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedCollect = await collectPhotoInputSchema.validate(
        args.collect,
        {
          stripUnknown: true,
        }
      );

      const findCollected = await prisma.collectedPhoto.findFirst({
        where: {
          photoId: normalizedCollect.photoId,
          collectionId: normalizedCollect.collectionId,
        },
      });

      if (findCollected) {
        return findCollected;
      }

      const id = nanoid();
      const newCollectedPhoto = await prisma.collectedPhoto.create({
        data: {
          id,
          userId,
          collectionId: normalizedCollect.collectionId,
          photoId: normalizedCollect.photoId,
        },
      });

      return newCollectedPhoto;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
