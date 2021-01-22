import { gql, UserInputError, ForbiddenError } from 'apollo-server';

export const typeDefs = gql`
  extend type Mutation {
    """
    Delete the photo review which has the given id, if it is created by the authorized user.
    """
    deletePhotoReview(id: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    deletePhotoReview: async (obj, args, { models: { PhotoReview }, authService }) => {
      const userId = authService.assertIsAuthorized();
      const photoReview = await PhotoReview.query().findById(args.id);

      if (!photoReview) {
        throw new UserInputError(`photo review with id ${args.id} does not exist`);
      }

      if (photoReview.userId !== userId) {
        throw new ForbiddenError('User is not authorized to delete the review');
      }

      await PhotoReview.query()
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
