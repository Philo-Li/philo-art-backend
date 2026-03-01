import { GraphQLError } from 'graphql';
import * as yup from 'yup';
import { nanoid } from 'nanoid';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  input CreateInformationInput {
    name: String!
    value: String!
  }

  extend type Mutation {

    """
    create Information with key and value
    """
    createInformation(info: CreateInformationInput ): Information
  }
`;

const createInformationInputSchema = yup.object().shape({
  name: yup.string().min(1).max(30).lowercase().required().trim(),
  value: yup.string().required().trim(),
});

interface CreateInformationArgs {
  info: {
    name: string;
    value: string;
  };
}

export const resolvers = {
  Mutation: {
    createInformation: async (
      _obj: unknown,
      args: CreateInformationArgs,
      { prisma }: AppContext
    ) => {
      const normalizedInput = await createInformationInputSchema.validate(
        args.info,
        {
          stripUnknown: true,
        }
      );

      const existingKey = await prisma.information.findFirst({
        where: { name: normalizedInput.name },
      });

      if (existingKey) {
        throw new GraphQLError(
          `key with name ${normalizedInput.name} already exists`,
          {
            extensions: { code: 'BAD_USER_INPUT' },
          }
        );
      }

      const id = nanoid();

      const information = await prisma.information.create({
        data: {
          id,
          name: normalizedInput.name,
          value: normalizedInput.value,
        },
      });

      return information;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
