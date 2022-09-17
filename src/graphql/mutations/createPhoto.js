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
    artworkWidth: Int
    artworkHeight: Int
    imageUrl: String
    srcYoutube: String
    artist: String
    license: String
    type: String
    medium: String
    status: String
    relatedPhotos: String
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
  artworkWidth: yup
    .number(),
  artworkHeight: yup
    .number(),
  imageUrl: yup
    .string()
    .required()
    .trim(),
  srcYoutube: yup
    .string()
    .trim(),
  artist: yup
    .string()
    .trim(),
  license: yup
    .string()
    .trim(),
  type: yup
    .string()
    .trim(),
  medium: yup
    .string()
    .trim(),
  status: yup
    .string()
    .trim(),
  relatedPhotos: yup
    .string()
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
          newTags = JSON.stringify(temp.result.tags);
          newTags2 = temp.result.tags;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error.response.body);
        }
      })();

      await (async () => {
        try {
          const response = await got(urlColor, { username: apiKey, password: apiSecret });
          const temp = JSON.parse(response.body);
          colors = JSON.stringify(temp.result.colors);
          colors2 = temp.result.colors.image_colors[0].html_code;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error.response.body);
        }
      })();

      const id = normalizedPhoto.photoId || nanoid();

      for (let i = 0; i < newTags2.length; i += 1) {
        if (newTags2[i].confidence > 15) {
          getRelatedTags = getRelatedTags ? getRelatedTags.concat(',', newTags2[i].tag.en) : newTags2[i].tag.en;
        }
      }

      const initPhotoWidth = 0;
      const initPhotoHeight = 0;

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
        photoWidth: initPhotoWidth,
        photoHeight: initPhotoHeight,
        artworkWidth: normalizedPhoto.artworkWidth,
        artworkHeight: normalizedPhoto.artworkHeight,
        imageKey: pathToImage,
        srcTiny,
        srcSmall,
        srcLarge,
        srcOriginal,
        srcYoutube: normalizedPhoto.srcYoutube,
        color: colors2,
        allColors: colors,
        creditId: id,
        artist: normalizedPhoto.artist,
        license: normalizedPhoto.license,
        type: normalizedPhoto.type,
        medium: normalizedPhoto.medium,
        status: normalizedPhoto.status,
        relatedPhotos: normalizedPhoto.relatedPhotos,
        allTags: newTags,
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
