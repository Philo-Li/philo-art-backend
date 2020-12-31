import { gql } from 'apollo-server';
import * as yup from 'yup';

const { v4: uuid } = require('uuid');

export const typeDefs = gql`
  input CreatePhotoInput {
    title: String!
    titleEn: String!
    description: String!
    text: String!
  }

  extend type Mutation {
    """
    Create a new photo.
    """
    createPhoto(photo: CreatePhotoInput): Photo
  }
`;

const createPhotoInputSchema = yup.object().shape({
  title: yup
    .string()
    .required()
    .trim(),
  titleEn: yup
    .string()
    .required()
    .trim(),
  description: yup
    .string()
    .required()
    .max(1000)
    .trim(),
  text: yup
    .string()
    .max(5000)
    .required()
    .trim(),
});

export const resolvers = {
  Mutation: {
    createPhoto: async (
      obj,
      args,
      { models: { Photo }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedPhoto = await createPhotoInputSchema.validate(
        args.photo,
        {
          stripUnknown: true,
        },
      );

      const id = uuid();

      await Photo.query().insert({
        id,
        userId,
        title: normalizedPhoto.title,
        titleEn: normalizedPhoto.titleEn,
        description: normalizedPhoto.description,
        text: normalizedPhoto.text,
      });

      return Photo.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
