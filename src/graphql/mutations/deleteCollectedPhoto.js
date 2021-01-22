import { gql, UserInputError, ForbiddenError } from 'apollo-server';

export const typeDefs = gql`
  extend type Mutation {
    """
    Deletes the collected photo which has the given id, if it is created by the authorized user.
    """
    deleteCollectedPhoto(id: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    deleteCollectedPhoto: async (obj, args, { models: { CollectedPhoto }, authService }) => {
      const userId = authService.assertIsAuthorized();

      const collectedPhoto = await CollectedPhoto.query().findById(args.id);

      if (!collectedPhoto) {
        throw new UserInputError(`Collected photo with id ${args.id} does not exist`);
      }

      if (collectedPhoto.userId !== userId) {
        throw new ForbiddenError('User is not authorized to delete the collected photo');
      }

      await CollectedPhoto.query()
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
