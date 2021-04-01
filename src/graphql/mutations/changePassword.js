import { gql, UserInputError } from 'apollo-server';
import * as yup from 'yup';
import bcrypt from 'bcrypt';

export const typeDefs = gql`
  input changePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  extend type Mutation {
    """
    Change one user's password.
    """
    changePassword(user: changePasswordInput): User
  }
`;

const changePasswordInputSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .min(6)
    .max(50)
    .required()
    .trim(),
  newPassword: yup
    .string()
    .min(6)
    .max(50)
    .required()
    .trim(),
});

export const resolvers = {
  Mutation: {
    changePassword: async (obj, args, { models, authService }) => {
      const { User } = models;
      const userId = authService.assertIsAuthorized();

      const normalizedUser = await changePasswordInputSchema.validate(args.user, {
        stripUnknown: true,
      });

      const newPasswordHash = await bcrypt.hash(normalizedUser.newPassword, 10);

      const user = await User.query().findOne({ id: userId });

      const match = await bcrypt.compare(normalizedUser.currentPassword, user.password);

      if (!match) {
        throw new UserInputError('Invalid password');
      }

      await User.query()
        .where({ id: userId })
        .update({
          password: newPasswordHash,
        });

      return User.query().findById(userId);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
