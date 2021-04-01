import { gql, UserInputError, ForbiddenError } from 'apollo-server';

export const typeDefs = gql`
  extend type Mutation {
    """
    Deletes user account.
    """
    deleteUser(id: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    deleteUser: async (obj, args,
      { models: { User, Photo, Like, CollectedPhoto, Collection }, authService }) => {
      const userId = authService.assertIsAuthorized();
      const user = await User.query().findById(args.id);

      if (!user) {
        throw new UserInputError(`User with id ${args.id} does not exist`);
      }

      if (user.id !== userId) {
        throw new ForbiddenError('User is not authorized to delete the user');
      }

      await CollectedPhoto.query()
        .where('userId', args.id)
        .delete();

      await Collection.query()
        .where('userId', args.id)
        .delete();

      await Like.query()
        .where('userId', args.id)
        .delete();

      await Photo.query()
        .where('userId', args.id)
        .delete();

      await User.query()
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
