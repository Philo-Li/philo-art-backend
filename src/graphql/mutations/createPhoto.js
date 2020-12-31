import { gql } from 'apollo-server';
import * as yup from 'yup';

const { v4: uuid } = require('uuid');

export const typeDefs = gql`
  input CreatePhotoInput {
    url: String
    description: String!
    tags: [String!]!
  }

  extend type Mutation {
    """
    Create a new photo.
    """
    createPhoto(photo: CreatePhotoInput): Photo
  }
`;

const createPhotoInputSchema = yup.object().shape({
  url: yup
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
        url: normalizedPhoto.url,
        description: normalizedPhoto.description,
        tags: normalizedPhoto.tags,
      });

      return Photo.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
