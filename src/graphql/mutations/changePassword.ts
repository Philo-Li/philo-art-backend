import { GraphQLError } from 'graphql';
import * as yup from 'yup';
import bcrypt from 'bcrypt';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  input changePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  extend type Mutation {
    """
    Change one user's password.
    """
    changePassword(user: changePasswordInput): Boolean
  }
`;

const changePasswordInputSchema = yup.object().shape({
  currentPassword: yup.string().min(6).max(50).required().trim(),
  newPassword: yup.string().min(6).max(50).required().trim(),
});

interface ChangePasswordArgs {
  user: {
    currentPassword: string;
    newPassword: string;
  };
}

export const resolvers = {
  Mutation: {
    changePassword: async (
      _obj: unknown,
      args: ChangePasswordArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedUser = await changePasswordInputSchema.validate(
        args.user,
        {
          stripUnknown: true,
        }
      );

      const newPasswordHash = await bcrypt.hash(normalizedUser.newPassword, 10);

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user || !user.password) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const match = await bcrypt.compare(
        normalizedUser.currentPassword,
        user.password
      );

      if (!match) {
        throw new GraphQLError('Wrong password!', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { password: newPasswordHash },
      });

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
