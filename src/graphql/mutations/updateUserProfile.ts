import { GraphQLError } from 'graphql';
import * as yup from 'yup';
import bcrypt from 'bcrypt';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  input UpdateUserProfileInput {
    username: String!
    password: String!
    firstName: String!
    lastName: String
    email: String!
    description: String
  }

  extend type Mutation {
    """
    Update one user's profile.
    """
    updateUserProfile(user: UpdateUserProfileInput): User
  }
`;

const updateUserProfileInputSchema = yup.object().shape({
  username: yup.string().min(1).max(30).lowercase().required().trim(),
  password: yup.string().min(6).max(50).required().trim(),
  firstName: yup.string().min(2).max(30).required().trim(),
  lastName: yup.string().max(30).trim(),
  email: yup.string().required().email(),
  description: yup.string().trim(),
});

interface UpdateUserProfileArgs {
  user: {
    username: string;
    password: string;
    firstName: string;
    lastName?: string;
    email: string;
    description?: string;
  };
}

export const resolvers = {
  Mutation: {
    updateUserProfile: async (
      _obj: unknown,
      args: UpdateUserProfileArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedUser = await updateUserProfileInputSchema.validate(
        args.user,
        {
          stripUnknown: true,
        }
      );

      const existingUser = await prisma.user.findFirst({
        where: { username: normalizedUser.username },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new GraphQLError(
          `Username ${normalizedUser.username} is already taken. Choose another username`,
          {
            extensions: {
              code: 'USERNAME_TAKEN',
              username: normalizedUser.username,
            },
          }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.password) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const match = await bcrypt.compare(normalizedUser.password, user.password);

      if (!match) {
        throw new GraphQLError('Wrong password!', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          username: normalizedUser.username,
          firstName: normalizedUser.firstName,
          lastName: normalizedUser.lastName,
          email: normalizedUser.email,
          description: normalizedUser.description,
        },
      });

      return updatedUser;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
