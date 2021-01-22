import { gql, UserInputError, ForbiddenError } from 'apollo-server';

export const typeDefs = gql`
  extend type Mutation {
    """
    Unlike the photo which has the given id, if it is created by the authorized user.
    """
    unlikePhoto(id: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    unlikePhoto: async (obj, args, { models: { Like }, authService }) => {
      const userId = authService.assertIsAuthorized();
      const like = await Like.query().findById(args.id);

      if (!like) {
        throw new UserInputError(`Like with id ${args.id} does not exist`);
      }

      if (like.userId !== userId) {
        throw new ForbiddenError('User is not authorized to delete the collection');
      }

      await Like.query()
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
