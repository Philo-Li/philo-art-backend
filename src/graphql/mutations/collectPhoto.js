import { gql } from 'apollo-server';
import * as yup from 'yup';

const { v4: uuid } = require('uuid');

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

      const id = uuid();

      await CollectedPhoto.query().insert({
        id,
        userId,
        collectionId: normalizedCollect.collectionId,
        photoId: normalizedCollect.photoId,
      });

      return CollectedPhoto.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
