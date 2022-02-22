import { gql, ApolloError } from 'apollo-server';
import * as yup from 'yup';
import bcrypt from 'bcrypt';

import { nanoid } from 'nanoid';

export const typeDefs = gql`
  input CreateUserInput {
    username: String!
    password: String!
    firstName: String!
    lastName: String
    email: String!
  }

  extend type Mutation {
    """
    Creates a new user, if the provided username does not already exist.
    """
    createUser(user: CreateUserInput): User
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

const createUserInputSchema = yup.object().shape({
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
    .min(2)
    .max(30)
    .trim(),
  email: yup
    .string()
    .required()
    .email(),
});

export const resolvers = {
  Mutation: {
    createUser: async (obj, args, { models: { User, Information } }) => {
      const normalizedUser = await createUserInputSchema.validate(args.user, {
        stripUnknown: true,
      });

      const passwordHash = await bcrypt.hash(normalizedUser.password, 10);

      const existingUser = await User.query().findOne({
        username: normalizedUser.username,
      });

      if (existingUser) {
        throw UsernameTakenError.fromUsername(normalizedUser.username);
      }

      const findPhiloartId = await Information.query().findOne({
        name: 'philoart_id',
      });

      let philoartId = 1;

      if (findPhiloartId) {
        philoartId = parseInt(findPhiloartId.value, 10) + 1;
        await Information.query()
          .where({ id: findPhiloartId.id })
          .update({ value: philoartId });
      } else {
        await Information.query().insert({
          id: nanoid(),
          name: 'philoart_id',
          value: philoartId,
        });
      }

      const id = nanoid();

      await User.query().insert({
        ...normalizedUser,
        philoartId,
        password: passwordHash,
        description: '',
        socialMediaLink: '',
        id,
      });

      return User.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
