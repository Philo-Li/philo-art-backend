/* eslint-disable max-len */
import { gql, UserInputError, ForbiddenError } from 'apollo-server';

export const typeDefs = gql`
  extend type Mutation {
    """
    Deletes the collection which has the given id, if it is created by the authorized user.
    """
    deleteCollection(id: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    deleteCollection: async (obj, args, { models: { Collection, CollectedPhoto }, authService }) => {
      const userId = authService.assertIsAuthorized();

      const collection = await Collection.query().findById(args.id);

      if (!collection) {
        throw new UserInputError(`Collected photo with id ${args.id} does not exist`);
      }

      if (collection.userId !== userId) {
        throw new ForbiddenError('User is not authorized to delete the collection');
      }

      await CollectedPhoto.query()
        .where('collectionId', args.id)
        .delete();

      await Collection.query()
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
