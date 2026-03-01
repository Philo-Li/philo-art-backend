import { GraphQLError } from 'graphql';
import * as yup from 'yup';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
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

const createUserInputSchema = yup.object().shape({
  username: yup.string().min(1).max(30).lowercase().required().trim(),
  password: yup.string().min(6).max(50).required().trim(),
  firstName: yup.string().min(2).max(30).required().trim(),
  lastName: yup.string().min(2).max(30).trim(),
  email: yup.string().required().email(),
});

interface CreateUserArgs {
  user: {
    username: string;
    password: string;
    firstName: string;
    lastName?: string;
    email: string;
  };
}

export const resolvers = {
  Mutation: {
    createUser: async (
      _obj: unknown,
      args: CreateUserArgs,
      { prisma }: AppContext
    ) => {
      const normalizedUser = await createUserInputSchema.validate(args.user, {
        stripUnknown: true,
      });

      const passwordHash = await bcrypt.hash(normalizedUser.password, 10);

      const existingUser = await prisma.user.findFirst({
        where: { username: normalizedUser.username },
      });

      if (existingUser) {
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

      const findPhiloartId = await prisma.information.findFirst({
        where: { name: 'philoart_id' },
      });

      let philoartId = 1;

      if (findPhiloartId && findPhiloartId.value) {
        philoartId = parseInt(findPhiloartId.value, 10) + 1;
        await prisma.information.update({
          where: { id: findPhiloartId.id },
          data: { value: String(philoartId) },
        });
      } else {
        await prisma.information.create({
          data: {
            id: nanoid(),
            name: 'philoart_id',
            value: String(philoartId),
          },
        });
      }

      const id = nanoid(7);

      const user = await prisma.user.create({
        data: {
          id,
          username: normalizedUser.username,
          password: passwordHash,
          firstName: normalizedUser.firstName,
          lastName: normalizedUser.lastName,
          email: normalizedUser.email,
          philoartId,
          description: '',
          socialMediaLink: '',
        },
      });

      return user;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
