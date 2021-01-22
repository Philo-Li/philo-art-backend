import { gql } from 'apollo-server';
import * as yup from 'yup';

const { v4: uuid } = require('uuid');

export const typeDefs = gql`
  input CreateCollectionReviewInput {
    collectionId: ID!
    text: String!
  }

  extend type Mutation {
    """
    Creates a collectionReview for the collection.
    """
    createCollectionReview(collectionReview: CreateCollectionReviewInput): CollectionReview
  }
`;

const createCollectionReviewInputSchema = yup.object().shape({
  collectionId: yup
    .string()
    .required()
    .trim(),
  text: yup
    .string()
    .max(2000)
    .trim(),
});

export const resolvers = {
  Mutation: {
    createCollectionReview: async (
      obj,
      args,
      { models: { CollectionReview }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedCollectionReview = await createCollectionReviewInputSchema.validate(
        args.collectionReview,
        {
          stripUnknown: true,
        },
      );

      const id = uuid();

      await CollectionReview.query().insert({
        id,
        userId,
        collectionId: normalizedCollectionReview.collectionId,
        text: normalizedCollectionReview.text,
      });

      return CollectionReview.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
