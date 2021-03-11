import { gql } from 'apollo-server';
import * as yup from 'yup';
import config from '../../config';

const { v4: uuid } = require('uuid');
const got = require('got');

export const typeDefs = gql`
  input CreatePhotoInput {
    width: Int
    height: Int
    tiny: String
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
  tiny: yup
    .string()
    .required()
    .trim(),
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

      let newTags;

      const { apiKey } = config.imagga;
      const { apiSecret } = config.imagga;

      const imageUrl = normalizedPhoto.small;
      const url = `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(imageUrl)}`;

      await (async () => {
        try {
          const response = await got(url, { username: apiKey, password: apiSecret });
          const temp = JSON.parse(response.body);
          newTags = JSON.stringify(temp.result.tags);
          // console.log(newTags);
        } catch (error) {
          console.log(error.response.body);
        }
      })();

      const id = uuid();

      await Photo.query().insert({
        id,
        width: normalizedPhoto.width,
        height: normalizedPhoto.height,
        tiny: normalizedPhoto.tiny,
        small: normalizedPhoto.small,
        large: normalizedPhoto.large,
        creditWeb: normalizedPhoto.creditWeb,
        creditId: normalizedPhoto.creditId,
        photographer: normalizedPhoto.photographer,
        downloadPage: normalizedPhoto.downloadPage,
        description: normalizedPhoto.description,
        tags: newTags,
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
