import { gql } from 'apollo-server';
import * as yup from 'yup';
import { nanoid } from 'nanoid';
import config from '../../config';

const got = require('got');

export const typeDefs = gql`
  input CreatePhotoInput {
    title: String!
    year: Int!
    description: String
    tags: String
    photoWidth: Int
    photoHeight: Int
    artworkWidth: Int
    artworkHeight: Int
    srcTiny: String
    srcSmall: String
    srcLarge: String
    srcYoutube: String
    color: String
    downloadCount: String
    creditId: String
    artist: String
    license: String
    type: String
    description: String
    medium: String
    status: String
    relatedPhotos: [String]
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
  year: yup
    .string()
    .required()
    .trim(),  
  tags: yup
    .string()
    .trim(),
  description: yup
    .string()
    .required()
    .trim(),
  photoWidth: yup
    .number(),
  photoHeight: yup
    .number(),
  artworkWidth: yup
    .number(),
  artworkHeight: yup
    .number(),
  srcTiny: yup
    .string()
    .required()
    .trim(),
  srcSmall: yup
    .string()
    .required()
    .trim(),
  srcLarge: yup
    .string()
    .required()
    .trim(),
  srcYoutube: yup
    .string()
    .trim(),
  color: yup
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
    .array()
    .of(yup.string()),
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

      const findPhoto = await Photo.query()
        .findOne({ downloadPage: normalizedPhoto.downloadPage, userId });

      if (findPhoto) {
        return Photo.query().findById(findPhoto.id);
      }

      let newTags;
      let newTags2;
      let getRelatedTags = '';

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
          getRelatedTags = getRelatedTags ? getRelatedTags.concat(',', newTags2[i].tag.en) : newTags2[i].tag.en;
        }
      }

      await Photo.query().insert({
        id,
        userId,
        title: normalizedPhoto.title,
        year: normalizedPhoto.year,
        description: normalizedPhoto.description,
        photoWidth: normalizedPhoto.photoWidth,
        photoHeight: normalizedPhoto.photoHeight,
        artworkWidth: normalizedPhoto.artworkWidth,
        artworkHeight: normalizedPhoto.artworkHeight,
        srcTiny: normalizedPhoto.srcTiny,
        srcSmall: normalizedPhoto.srcSmall,
        srcLarge: normalizedPhoto.srcLarge,
        srcYoutube: normalizedPhoto.srcYoutube,
        color: normalizedPhoto.color,
        creditId: id,
        artist: normalizedPhoto.artist,
        license: normalizedPhoto.license,
        type: normalizedPhoto.type,
        description: normalizedPhoto.description,
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
