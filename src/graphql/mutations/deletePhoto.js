import { gql, UserInputError } from 'apollo-server';

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
    deletePhoto: async (obj, args, { models: { Photo } }) => {
      const photo = await Photo.query().findById(args.id);

      if (!photo) {
        throw new UserInputError(`Photo with id ${args.id} does not exist`);
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
