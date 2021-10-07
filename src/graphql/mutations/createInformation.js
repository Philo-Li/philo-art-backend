import { gql, UserInputError } from 'apollo-server';
import * as yup from 'yup';
import { nanoid } from 'nanoid';

export const typeDefs = gql`
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
  name: yup
    .string()
    .min(1)
    .max(30)
    .lowercase()
    .required()
    .trim(),
  value: yup
    .string()
    .required()
    .trim(),
});

export const resolvers = {
  Mutation: {
    createInformation: async (obj, args, { models: { Information } }) => {
      const normalizedInput = await createInformationInputSchema.validate(args.info, {
        stripUnknown: true,
      });

      let existingKey = await Information.query().findOne({
        name: normalizedInput.name,
      });

      if (existingKey) {
        throw new UserInputError(`key with name ${normalizedInput.name} already exists`);
      }

      const id = nanoid();

      await Information.query()
        .insert({
          id,
          name: normalizedInput.name,
          value: normalizedInput.value,
        });

        return Information.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
