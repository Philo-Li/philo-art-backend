import { gql, UserInputError, ForbiddenError } from 'apollo-server';
import * as yup from 'yup';

export const typeDefs = gql`
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
  collectionId: yup
    .string()
    .required()
    .trim(),
  newTitle: yup
    .string()
    .min(1)
    .max(50)
    .required()
    .trim(),
  newDescription: yup
    .string()
    .max(50)
    .trim(),
});

export const resolvers = {
  Mutation: {
    editCollection: async (obj, args, { models: { Collection }, authService }) => {
      const userId = authService.assertIsAuthorized();

      const normalizedEdit = await editCollectionInputSchema.validate(args.edit, {
        stripUnknown: true,
      });
      const collection = await Collection.query().findById(normalizedEdit.collectionId);

      if (!collection) {
        throw new UserInputError(`Collection with id ${normalizedEdit.collectionId} does not exist`);
      }

      if (collection.userId !== userId) {
        throw new ForbiddenError('User is not authorized to edit the collection');
      }

      await Collection.query()
        .findById(normalizedEdit.collectionId)
        .update({
          title: normalizedEdit.newTitle,
          description: normalizedEdit.newDescription,
        });

      return Collection.query().findById(normalizedEdit.collectionId);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
