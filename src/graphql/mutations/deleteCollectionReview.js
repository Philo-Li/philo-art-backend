import { gql, UserInputError, ForbiddenError } from 'apollo-server';

export const typeDefs = gql`
  extend type Mutation {
    """
    Delete the collection review which has the given id, if it is created by the authorized user.
    """
    deleteCollectionReview(id: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    deleteCollectionReview: async (obj, args, { models: { CollectionReview }, authService }) => {
      const userId = authService.assertIsAuthorized();
      const collectionReview = await CollectionReview.query().findById(args.id);

      if (!collectionReview) {
        throw new UserInputError(`collection review with id ${args.id} does not exist`);
      }

      if (collectionReview.userId !== userId) {
        throw new ForbiddenError('User is not authorized to delete the review');
      }

      await CollectionReview.query()
        .findById(args.id)
        .delete();

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
