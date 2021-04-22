import { gql } from 'apollo-server';
import * as yup from 'yup';
import { nanoid } from 'nanoid';

export const typeDefs = gql`
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
  width: yup
    .number(),
  height: yup
    .number(),
  tiny: yup
    .string()
    .trim(),
  small: yup
    .string()
    .required()
    .trim(),
  large: yup
    .string()
    .required()
    .trim(),
  color: yup
    .string()
    .trim(),
  downloadPage: yup
    .string()
    .required()
    .trim(),
  creditWeb: yup
    .string()
    .required()
    .trim(),
  creditId: yup
    .string()
    .required()
    .trim(),
  photographer: yup
    .string()
    .trim(),
  description: yup
    .string()
    .max(1000)
    .trim(),
  tags: yup
    .string()
    .trim(),
});

export const resolvers = {
  Mutation: {
    createAndLikePhoto: async (
      obj,
      args,
      { models: { Photo, Like }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedPhoto = await createPhotoInputSchema.validate(
        args.photo,
        {
          stripUnknown: true,
        },
      );

      const id = nanoid();
      const likeId = nanoid();

      const findPhoto = await Photo.query()
        .findOne({ downloadPage: normalizedPhoto.downloadPage, userId });

      if (findPhoto) {
        const findLike = await Like.query().findOne({ photoId: findPhoto.id, userId });

        if (!findLike) {
          const newLikedPhoto = {
            id: likeId,
            userId,
            photoId: findPhoto.id,
          };
          await Like.query().insert(newLikedPhoto);
        }

        return findPhoto;
      }

      const newPhoto = {
        id,
        userId,
        width: normalizedPhoto.width,
        height: normalizedPhoto.height,
        tiny: normalizedPhoto.tiny,
        small: normalizedPhoto.small,
        large: normalizedPhoto.large,
        color: normalizedPhoto.color,
        creditWeb: normalizedPhoto.creditWeb,
        creditId: normalizedPhoto.creditId,
        photographer: normalizedPhoto.photographer,
        downloadPage: normalizedPhoto.downloadPage,
        description: normalizedPhoto.description,
        tags: '',
        labels: '',
        downloadCount: 0,
      };

      await Photo.query().insert(newPhoto);

      await Like.query().insert({
        id: likeId,
        userId,
        photoId: id,
      });

      return newPhoto;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
