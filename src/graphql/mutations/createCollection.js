import { gql } from 'apollo-server';
import * as yup from 'yup';

import { nanoid } from 'nanoid';

export const typeDefs = gql`
  input CreateCollectionInput {
    title: String!
    description: String
    public: Boolean!
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
  public: yup
    .boolean()
    .required(),
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

      const id = nanoid();

      await Collection.query().insert({
        id,
        userId,
        title: normalizedCollection.title,
        description: normalizedCollection.description,
        public: normalizedCollection.public,
      });

      return Collection.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
