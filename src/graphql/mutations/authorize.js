import { gql, UserInputError } from 'apollo-server';
import * as yup from 'yup';
import bcrypt from 'bcrypt';

export const typeDefs = gql`
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
  email: yup
    .string()
    .required()
    .trim(),
  password: yup
    .string()
    .required()
    .trim(),
});

export const resolvers = {
  Mutation: {
    authorize: async (obj, args, { models, authService }) => {
      const { User } = models;

      const normalizedAuthorization = await authorizeInputSchema.validate(
        args.credentials,
        {
          stripUnknown: true,
        },
      );

      const { email, password } = normalizedAuthorization;

      // login with email
      // login with insensitive case
      const findUser = await User.query().where('email', 'ilike', `%${email}%`);
      const user = findUser[0];

      if (!user) {
        throw new UserInputError('Invalid email or password');
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        throw new UserInputError('Invalid email or password');
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
