import { gql } from 'apollo-server';
import * as yup from 'yup';

import { nanoid } from 'nanoid';

export const typeDefs = gql`
  input CollectPhotoInput {
    photoId: ID!
    collectionId: ID!
  }

  extend type Mutation {
    """
    Collect a new photo to a Collection.
    """
    collectPhoto(collect: CollectPhotoInput): CollectedPhoto
  }
`;

const collectPhotoInputSchema = yup.object().shape({
  photoId: yup
    .string()
    .required()
    .trim(),
  collectionId: yup
    .string()
    .required()
    .trim(),
});

export const resolvers = {
  Mutation: {
    collectPhoto: async (
      obj,
      args,
      { models: { CollectedPhoto }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedCollect = await collectPhotoInputSchema.validate(
        args.collect,
        {
          stripUnknown: true,
        },
      );

      const findCollected = await CollectedPhoto.query().findOne({
        photoId: normalizedCollect.photoId,
        collectionId: normalizedCollect.collectionId,
      });

      if (findCollected) {
        return findCollected;
      }

      const id = nanoid();
      const newCollectedPhoto = {
        id,
        userId,
        collectionId: normalizedCollect.collectionId,
        photoId: normalizedCollect.photoId,
      };

      await CollectedPhoto.query().insert(newCollectedPhoto);

      return newCollectedPhoto;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
