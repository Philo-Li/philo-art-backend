import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Query {
    """
    Returns information by an id.
    """
    information(id: ID!): Information
  }
`;

interface InformationArgs {
  id: string;
}

export const resolvers = {
  Query: {
    information: async (
      _obj: unknown,
      args: InformationArgs,
      { prisma }: AppContext
    ) => {
      return prisma.information.findUnique({ where: { id: args.id } });
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
