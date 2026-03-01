import * as yup from 'yup';
import { nanoid } from 'nanoid';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  input CreateCollectionAndCollectPhotoInput {
    title: String!
    description: String
    public: Boolean!
    photoId: ID!
    cover: String
  }

  extend type Mutation {
    """
    Creates a collection and collect the photo.
    """
    createCollectionAndCollectPhoto(collection: CreateCollectionAndCollectPhotoInput): CollectedPhoto
  }
`;

const createCollectionAndCollectPhotoInputSchema = yup.object().shape({
  title: yup.string().required().trim(),
  description: yup.string().max(2000).trim(),
  public: yup.boolean().required(),
  photoId: yup.string().required().trim(),
  cover: yup.string().trim(),
});

interface CreateCollectionAndCollectPhotoArgs {
  collection: {
    title: string;
    description?: string;
    public: boolean;
    photoId: string;
    cover?: string;
  };
}

export const resolvers = {
  Mutation: {
    createCollectionAndCollectPhoto: async (
      _obj: unknown,
      args: CreateCollectionAndCollectPhotoArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedCollection =
        await createCollectionAndCollectPhotoInputSchema.validate(
          args.collection,
          {
            stripUnknown: true,
          }
        );

      const id = nanoid(6);

      await prisma.collection.create({
        data: {
          id,
          userId,
          title: normalizedCollection.title,
          description: normalizedCollection.description,
          public: normalizedCollection.public,
          cover: normalizedCollection.cover,
        },
      });

      const id2 = nanoid();

      const collectedPhoto = await prisma.collectedPhoto.create({
        data: {
          id: id2,
          userId,
          collectionId: id,
          photoId: normalizedCollection.photoId,
        },
      });

      return collectedPhoto;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
