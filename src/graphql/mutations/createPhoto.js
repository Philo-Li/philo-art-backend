import { gql } from 'apollo-server';
import * as yup from 'yup';

const { v4: uuid } = require('uuid');

export const typeDefs = gql`
  input CreatePhotoInput {
    width: Int
    height: Int
    small: String
    large: String
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
    createPhoto(photo: CreatePhotoInput): Photo
  }
`;

const createPhotoInputSchema = yup.object().shape({
  width: yup
    .number(),
  height: yup
    .number(),
  small: yup
    .string()
    .required()
    .trim(),
  large: yup
    .string()
    .required()
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
    .required()
    .trim(),
  description: yup
    .string()
    .required()
    .max(1000)
    .trim(),
  tags: yup
    .string()
    .required()
    .trim(),
});

export const resolvers = {
  Mutation: {
    createPhoto: async (
      obj,
      args,
      { models: { Photo } },
    ) => {
      const normalizedPhoto = await createPhotoInputSchema.validate(
        args.photo,
        {
          stripUnknown: true,
        },
      );

      const id = uuid();

      await Photo.query().insert({
        id,
        width: normalizedPhoto.width,
        height: normalizedPhoto.height,
        small: normalizedPhoto.small,
        large: normalizedPhoto.large,
        creditWeb: normalizedPhoto.creditWeb,
        creditId: normalizedPhoto.creditId,
        photographer: normalizedPhoto.photographer,
        downloadPage: normalizedPhoto.downloadPage,
        description: normalizedPhoto.description,
        tags: normalizedPhoto.tags,
        downloadCount: 0,
      });

      return Photo.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
