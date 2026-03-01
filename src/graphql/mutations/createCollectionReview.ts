import * as yup from 'yup';
import { nanoid } from 'nanoid';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
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
  collectionId: yup.string().required().trim(),
  text: yup.string().max(2000).trim(),
});

interface CreateCollectionReviewArgs {
  collectionReview: {
    collectionId: string;
    text: string;
  };
}

export const resolvers = {
  Mutation: {
    createCollectionReview: async (
      _obj: unknown,
      args: CreateCollectionReviewArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedCollectionReview =
        await createCollectionReviewInputSchema.validate(args.collectionReview, {
          stripUnknown: true,
        });

      const id = nanoid();

      const collectionReview = await prisma.collectionReview.create({
        data: {
          id,
          userId,
          collectionId: normalizedCollectionReview.collectionId,
          text: normalizedCollectionReview.text,
        },
      });

      return collectionReview;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
