import * as yup from 'yup';
import { nanoid } from 'nanoid';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  input CreateAndLikePhotoInput {
    width: Int
    height: Int
    tiny: String
    small: String
    large: String
    color: String
    downloadPage: String
    creditWeb: String
    creditId: String
    photographer: String
    description: String
    tags: String
  }

  extend type Mutation {
    """
    Create a new photo.
    """
    createAndLikePhoto(photo: CreatePhotoInput): Photo
  }
`;

const createPhotoInputSchema = yup.object().shape({
  width: yup.number(),
  height: yup.number(),
  tiny: yup.string().trim(),
  small: yup.string().required().trim(),
  large: yup.string().required().trim(),
  color: yup.string().trim(),
  downloadPage: yup.string().required().trim(),
  creditWeb: yup.string().required().trim(),
  creditId: yup.string().required().trim(),
  photographer: yup.string().trim(),
  description: yup.string().max(1000).trim(),
  tags: yup.string().trim(),
});

interface CreateAndLikePhotoArgs {
  photo: {
    width?: number;
    height?: number;
    tiny?: string;
    small: string;
    large: string;
    color?: string;
    downloadPage: string;
    creditWeb: string;
    creditId: string;
    photographer?: string;
    description?: string;
    tags?: string;
  };
}

export const resolvers = {
  Mutation: {
    createAndLikePhoto: async (
      _obj: unknown,
      args: CreateAndLikePhotoArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedPhoto = await createPhotoInputSchema.validate(
        args.photo,
        {
          stripUnknown: true,
        }
      );

      const id = nanoid();
      const likeId = nanoid();

      const findPhoto = await prisma.photo.findFirst({
        where: {
          downloadPage: normalizedPhoto.downloadPage,
          userId,
        },
      });

      if (findPhoto) {
        const findLike = await prisma.like.findFirst({
          where: { photoId: findPhoto.id, userId },
        });

        if (!findLike) {
          await prisma.like.create({
            data: {
              id: likeId,
              userId,
              photoId: findPhoto.id,
            },
          });
        }

        return findPhoto;
      }

      const newPhoto = await prisma.photo.create({
        data: {
          id,
          userId,
          width: normalizedPhoto.width,
          height: normalizedPhoto.height,
          srcTiny: normalizedPhoto.tiny,
          srcSmall: normalizedPhoto.small,
          srcLarge: normalizedPhoto.large,
          color: normalizedPhoto.color,
          creditWeb: normalizedPhoto.creditWeb,
          creditId: normalizedPhoto.creditId,
          photographer: normalizedPhoto.photographer,
          downloadPage: normalizedPhoto.downloadPage,
          description: normalizedPhoto.description,
          tags: '',
          labels: '',
          downloadCount: '0',
        },
      });

      await prisma.like.create({
        data: {
          id: likeId,
          userId,
          photoId: id,
        },
      });

      return newPhoto;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
