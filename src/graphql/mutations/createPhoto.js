import { gql } from 'apollo-server';
import * as yup from 'yup';
import { nanoid } from 'nanoid';
import config from '../../config';

const got = require('got');

export const typeDefs = gql`
  input CreatePhotoInput {
    photoId: String
    title: String!
    year: Int!
    description: String
    imageUrl: String
    srcYoutube: String
    license: String
    type: String
    status: String
    allowDownload: Boolean!
  }

  extend type Mutation {
    """
    Create a new photo.
    """
    createPhoto(photo: CreatePhotoInput): Photo
  }
`;

const createPhotoInputSchema = yup.object().shape({
  photoId: yup
    .string()
    .trim(),
  title: yup
    .string()
    .required()
    .trim(),
  year: yup
    .string()
    .required()
    .trim(),
  tags: yup
    .string()
    .trim(),
  description: yup
    .string()
    .trim(),
  imageUrl: yup
    .string()
    .required()
    .trim(),
  srcYoutube: yup
    .string()
    .trim(),
  license: yup
    .string()
    .trim(),
  type: yup
    .string()
    .trim(),
  status: yup
    .string()
    .trim(),
  allowDownload: yup
    .boolean()
    .required(),
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
      let colors;
      let colors2;
      let getRelatedTags = '';

      const { apiKey } = config.imagga;
      const { apiSecret } = config.imagga;

      const { imageUrl } = normalizedPhoto;
      const urlTag = `https://api.imagga.com/v2/tags?image_url=${encodeURIComponent(imageUrl)}`;
      const urlColor = `https://api.imagga.com/v2/colors?image_url=${encodeURIComponent(imageUrl)}`;
      await (async () => {
        try {
          const response = await got(urlTag, { username: apiKey, password: apiSecret });
          const temp = JSON.parse(response.body);
          newTags = temp.result.tags;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error.response.body);
        }
      })();

      await (async () => {
        try {
          const response = await got(urlColor, { username: apiKey, password: apiSecret });
          const temp = JSON.parse(response.body);
          const imageColors = temp.result.colors.image_colors;
          colors2 = imageColors[0].html_code;
          // eslint-disable-next-line max-len
          const closestPaletteColorHtmlCodes = imageColors.map((c) => c.closest_palette_color_html_code);
          // eslint-disable-next-line no-useless-escape
          colors = JSON.stringify(closestPaletteColorHtmlCodes).replace(/\"/g, '').slice(-1, 1);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error.response.body);
        }
      })();

      const id = normalizedPhoto.photoId || nanoid();

      if (newTags) {
        for (let i = 0; i < newTags.length; i += 1) {
          if (newTags[i].confidence > 15) {
            getRelatedTags = getRelatedTags ? getRelatedTags.concat(',', newTags[i].tag.en) : newTags[i].tag.en;
          }
        }
      }

      const pathToImage = imageUrl.substring(53);
      const srcOriginal = `https://media.philoart.io/${pathToImage}`;
      const srcLarge = `https://cdn.philoart.io/1200x1200/${pathToImage}`;
      const srcSmall = `https://cdn.philoart.io/700x700/${pathToImage}`;
      const srcTiny = `https://cdn.philoart.io/300x300/${pathToImage}`;

      await Photo.query().insert({
        id,
        userId,
        title: normalizedPhoto.title,
        year: normalizedPhoto.year,
        description: normalizedPhoto.description,
        imageKey: pathToImage,
        srcTiny,
        srcSmall,
        srcLarge,
        srcOriginal,
        srcYoutube: normalizedPhoto.srcYoutube,
        color: colors2,
        allColors: colors,
        creditId: id,
        license: normalizedPhoto.license,
        type: normalizedPhoto.type,
        status: normalizedPhoto.status,
        allowDownload: normalizedPhoto.allowDownload,
        tags: getRelatedTags,
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
