import { GraphQLError } from 'graphql';
import * as yup from 'yup';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  input editCollectionInput {
    collectionId: ID!
    newTitle: String!
    newDescription: String!
  }

  extend type Mutation {
    """
    Edit collection details.
    """
    editCollection(edit: editCollectionInput): Collection!
  }
`;

const editCollectionInputSchema = yup.object().shape({
  collectionId: yup.string().required().trim(),
  newTitle: yup.string().min(1).max(50).required().trim(),
  newDescription: yup.string().max(50).trim(),
});

interface EditCollectionArgs {
  edit: {
    collectionId: string;
    newTitle: string;
    newDescription: string;
  };
}

export const resolvers = {
  Mutation: {
    editCollection: async (
      _obj: unknown,
      args: EditCollectionArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedEdit = await editCollectionInputSchema.validate(
        args.edit,
        {
          stripUnknown: true,
        }
      );

      const collection = await prisma.collection.findUnique({
        where: { id: normalizedEdit.collectionId },
      });

      if (!collection) {
        throw new GraphQLError(
          `Collection with id ${normalizedEdit.collectionId} does not exist`,
          {
            extensions: { code: 'BAD_USER_INPUT' },
          }
        );
      }

      if (collection.userId !== userId) {
        throw new GraphQLError(
          'User is not authorized to edit the collection',
          {
            extensions: { code: 'FORBIDDEN' },
          }
        );
      }

      const updatedCollection = await prisma.collection.update({
        where: { id: normalizedEdit.collectionId },
        data: {
          title: normalizedEdit.newTitle,
          description: normalizedEdit.newDescription,
        },
      });

      return updatedCollection;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
