import { gql, UserInputError } from 'apollo-server';

export const typeDefs = gql`
  extend type Mutation {
    """
    Downloads the photo which has the given id.
    """
    downloadPhoto(id: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    downloadPhoto: async (obj, args, { models: { Photo } }) => {
      const photo = await Photo.query().findById(args.id);

      if (!photo) {
        throw new UserInputError(`Photo with id ${args.id} does not exist`);
      }

      const count = parseInt(photo.downloadCount, 10) + 1;

      await Photo.query()
        .where({ id: args.id })
        .update({ downloadCount: count });

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
