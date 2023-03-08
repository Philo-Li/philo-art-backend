import { gql, ApolloError, UserInputError } from 'apollo-server';
import * as yup from 'yup';
import bcrypt from 'bcrypt';

export const typeDefs = gql`
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
  description: yup
    .string()
    .trim(),
});

export const resolvers = {
  Mutation: {
    updateUserProfile: async (obj, args, { models, authService }) => {
      const { User } = models;
      const userId = authService.assertIsAuthorized();

      const normalizedUser = await updateUserProfileInputSchema.validate(args.user, {
        stripUnknown: true,
      });

      const existingUser = await User.query().findOne({
        username: normalizedUser.username,
      });

      if (existingUser && existingUser.id !== userId) {
        throw UsernameTakenError.fromUsername(normalizedUser.username);
      }

      const user = await User.query().findOne({ id: userId });

      const match = await bcrypt.compare(normalizedUser.password, user.password);

      if (!match) {
        throw new UserInputError('Wrong password!');
      }

      await User.query()
        .where({ id: userId })
        .update({
          username: normalizedUser.username,
          firstName: normalizedUser.firstName,
          lastName: normalizedUser.lastName,
          email: normalizedUser.email,
          description: normalizedUser.description,
        });

      return User.query().findById(userId);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
