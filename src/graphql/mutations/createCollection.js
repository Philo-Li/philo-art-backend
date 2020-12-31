import { gql } from 'apollo-server';
import * as yup from 'yup';

const { v4: uuid } = require('uuid');

export const typeDefs = gql`
  input CreateCollectionInput {
    title: String!
    description: String
  }

  extend type Mutation {
    """
    Creates a collection for the photo.
    """
    createCollection(collection: CreateCollectionInput): Collection
  }
`;

const createCollectionInputSchema = yup.object().shape({
  title: yup
    .string()
    .required()
    .trim(),
  description: yup
    .string()
    .max(2000)
    .trim(),
});

export const resolvers = {
  Mutation: {
    createCollection: async (
      obj,
      args,
      { models: { Collection }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedCollection = await createCollectionInputSchema.validate(
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
      });

      return Collection.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
