import { gql } from 'apollo-server';
import * as yup from 'yup';
import { nanoid } from 'nanoid';
import config from '../../config';

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
      { models: { Photo }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedPhoto = await createPhotoInputSchema.validate(
        args.photo,
        {
          stripUnknown: true,
        },
      );

      let newTags;
      let newTags2;
      let getlabels = '';

      const { apiKey } = config.imagga;
      const { apiSecret } = config.imagga;

      const imageUrl = normalizedPhoto.small;
      const url = `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(imageUrl)}`;

      await (async () => {
        try {
          const response = await got(url, { username: apiKey, password: apiSecret });
          const temp = JSON.parse(response.body);
          newTags = JSON.stringify(temp.result.tags);
          newTags2 = temp.result.tags;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error.response.body);
        }
      })();

      const id = nanoid();

      for (let i = 0; i < newTags2.length; i += 1) {
        if (newTags2[i].confidence > 15) {
          getlabels = getlabels ? getlabels.concat(',', newTags2[i].tag.en) : newTags2[i].tag.en;
        }
      }

      await Photo.query().insert({
        id,
        userId,
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
        labels: getlabels,
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
