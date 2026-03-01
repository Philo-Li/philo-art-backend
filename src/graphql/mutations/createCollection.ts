import * as yup from 'yup';
import { nanoid } from 'nanoid';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  input CreateCollectionInput {
    title: String!
    description: String
    public: Boolean!
  }

  extend type Mutation {
    """
    Creates a collection for the photo.
    """
    createCollection(collection: CreateCollectionInput): Collection!
  }
`;

const createCollectionInputSchema = yup.object().shape({
  title: yup.string().required().trim(),
  description: yup.string().max(2000).trim(),
  public: yup.boolean().required(),
});

interface CreateCollectionArgs {
  collection: {
    title: string;
    description?: string;
    public: boolean;
  };
}

export const resolvers = {
  Mutation: {
    createCollection: async (
      _obj: unknown,
      args: CreateCollectionArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedCollection = await createCollectionInputSchema.validate(
        args.collection,
        {
          stripUnknown: true,
        }
      );

      const id = nanoid();

      const collection = await prisma.collection.create({
        data: {
          id,
          userId,
          title: normalizedCollection.title,
          description: normalizedCollection.description,
          public: normalizedCollection.public,
        },
      });

      return collection;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
