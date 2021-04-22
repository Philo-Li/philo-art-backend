import { gql, ApolloError } from 'apollo-server';
import * as yup from 'yup';
import bcrypt from 'bcrypt';

export const typeDefs = gql`
  input UpdateUserProfileInput {
    username: String!
    password: String!
    firstName: String!
    lastName: String
    email: String!
  }

  extend type Mutation {
    """
    Update one user's profile.
    """
    updateUserProfile(user: UpdateUserProfileInput): User
  }
`;

class UsernameTakenError extends ApolloError {
  constructor(message, properties) {
    super(message, 'USERNAME_TAKEN', properties);
  }

  static fromUsername(username) {
    return new UsernameTakenError(
      `Username ${username} is already taken. Choose another username`,
      { username },
    );
  }
}

const updateUserProfileInputSchema = yup.object().shape({
  username: yup
    .string()
    .min(1)
    .max(30)
    .lowercase()
    .required()
    .trim(),
  password: yup
    .string()
    .min(6)
    .max(50)
    .required()
    .trim(),
  firstName: yup
    .string()
    .min(2)
    .max(30)
    .required()
    .trim(),
  lastName: yup
    .string()
    .max(30)
    .trim(),
  email: yup
    .string()
    .required()
    .email(),
});

export const resolvers = {
  Mutation: {
    updateUserProfile: async (obj, args, { models, authService }) => {
      const { User } = models;
      const userId = authService.assertIsAuthorized();

      const normalizedUser = await updateUserProfileInputSchema.validate(args.user, {
        stripUnknown: true,
      });

      const passwordHash = await bcrypt.hash(normalizedUser.password, 10);

      const existingUser = await User.query().findOne({
        username: normalizedUser.username,
      });

      if (existingUser && existingUser.id !== userId) {
        throw UsernameTakenError.fromUsername(normalizedUser.username);
      }

      await User.query()
        .where({ id: userId })
        .update({
          username: normalizedUser.username,
          password: passwordHash,
          firstName: normalizedUser.firstName,
          lastName: normalizedUser.lastName,
          email: normalizedUser.email,
        });

      return User.query().findById(userId);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
