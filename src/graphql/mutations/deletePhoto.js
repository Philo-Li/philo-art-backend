import { gql, UserInputError, ForbiddenError } from 'apollo-server';

export const typeDefs = gql`
  extend type Mutation {
    """
    Deletes the photo which has the given id, if it is created by the authorized user.
    """
    deletePhoto(id: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    deletePhoto: async (obj, args, { models: { Photo }, authService }) => {
      const userId = authService.assertIsAuthorized();
      const photo = await Photo.query().findById(args.id);

      if (!photo) {
        throw new UserInputError(`Photo with id ${args.id} does not exist`);
      }

      if (photo.userId !== userId) {
        throw new ForbiddenError('User is not authorized to delete the photo');
      }

      await Photo.query()
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
