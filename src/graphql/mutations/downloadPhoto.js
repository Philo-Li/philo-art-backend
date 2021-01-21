import { gql } from 'apollo-server';
import * as yup from 'yup';

export const typeDefs = gql`
  input DownloadPhotoInput {
    photoId: ID!
  }

  extend type Mutation {
    """
    Download a photo.
    """
    downloadPhoto(download: DownloadPhotoInput): Photo
  }
`;

const downloadPhotoInputSchema = yup.object().shape({
  photoId: yup
    .string()
    .required()
    .trim(),
});

export const resolvers = {
  Mutation: {
    downloadPhoto: async (
      obj,
      args,
      { models: { Photo } },
    ) => {
      const normalizedDownload = await downloadPhotoInputSchema.validate(
        args.download,
        {
          stripUnknown: true,
        },
      );

      await Photo.query()
        .where({ id: normalizedDownload.photoId })
        .increment('download_count', 1);

      return Photo.query().findById(normalizedDownload.photoId);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
