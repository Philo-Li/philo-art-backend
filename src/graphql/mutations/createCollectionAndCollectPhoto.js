import { gql } from 'apollo-server';
import * as yup from 'yup';

const { v4: uuid } = require('uuid');

export const typeDefs = gql`
  input CreateCollectionAndCollectPhotoInput {
    title: String!
    description: String
    public: Boolean!
    photoId: ID!
  }

  extend type Mutation {
    """
    Creates a collection and collect the photo.
    """
    createCollectionAndCollectPhoto(collection: CreateCollectionAndCollectPhotoInput): CollectedPhoto
  }
`;

const createCollectionAndCollectPhotoInputSchema = yup.object().shape({
  title: yup
    .string()
    .required()
    .trim(),
  description: yup
    .string()
    .max(2000)
    .trim(),
  public: yup
    .boolean()
    .required(),
  photoId: yup
    .string()
    .required()
    .trim(),
});

export const resolvers = {
  Mutation: {
    createCollectionAndCollectPhoto: async (
      obj,
      args,
      { models: { Collection, CollectedPhoto }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedCollection = await createCollectionAndCollectPhotoInputSchema.validate(
        args.collection,
        {
          stripUnknown: true,
        },
      );

      const id = uuid();

      await Collection.query().insert({
        id,
        userId,
        title: normalizedCollection.title,
        description: normalizedCollection.description,
        public: normalizedCollection.public,
      });

      const id2 = uuid();

      await CollectedPhoto.query().insert({
        id: id2,
        userId,
        collectionId: id,
        photoId: normalizedCollection.photoId,
      });

      return CollectedPhoto.query().findById(id2);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
