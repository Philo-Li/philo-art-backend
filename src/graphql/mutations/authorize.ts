import { GraphQLError } from 'graphql';
import * as yup from 'yup';
import bcrypt from 'bcrypt';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  input AuthorizeInput {
    email: String!
    password: String!
  }

  type AuthorizationPayload {
    user: User!
    accessToken: String!
    expiresAt: DateTime!
  }

  extend type Mutation {
    """
    Generates a new access token, if provided credentials (email and password) match any registered user.
    """
    authorize(credentials: AuthorizeInput): AuthorizationPayload
  }
`;

const authorizeInputSchema = yup.object().shape({
  email: yup.string().required().trim(),
  password: yup.string().required().trim(),
});

interface AuthorizeArgs {
  credentials: {
    email: string;
    password: string;
  };
}

export const resolvers = {
  Mutation: {
    authorize: async (
      _obj: unknown,
      args: AuthorizeArgs,
      { prisma, authService }: AppContext
    ) => {
      const normalizedAuthorization = await authorizeInputSchema.validate(
        args.credentials,
        {
          stripUnknown: true,
        }
      );

      const { email, password } = normalizedAuthorization;

      // login with email (case insensitive)
      const user = await prisma.user.findFirst({
        where: {
          email: {
            contains: email,
            mode: 'insensitive',
          },
        },
      });

      if (!user || !user.password) {
        throw new GraphQLError('Invalid email or password', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        throw new GraphQLError('Invalid email or password', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      return {
        user,
        ...authService.createAccessToken(user.id),
      };
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
