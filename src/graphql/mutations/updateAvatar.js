import { gql, UserInputError } from 'apollo-server';

export const typeDefs = gql`
  extend type Mutation {
    """
    Update one user's avatar.
    """
    updateAvatar(url: String!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    updateAvatar: async (obj, args, { models, authService }) => {
      const { User } = models;
      const userId = authService.assertIsAuthorized();

      const user = await User.query().findOne({ id: userId });

      if (!user) {
        throw new UserInputError('User does not exist.');
      }

      const pathToImage = args.url.substring(53);
      const prefix = pathToImage.split('/');
      const keyTiny = `${prefix[0]}/300x300/${prefix[2]}`;
      const srcTiny = `https://cdn.philoart.io/${keyTiny}`;

      await User.query()
        .where({ id: userId })
        .update({
          profileImage: srcTiny,
        });

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
