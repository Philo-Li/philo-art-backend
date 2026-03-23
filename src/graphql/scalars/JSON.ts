import { JSONResolver } from 'graphql-scalars';

export const typeDefs = `#graphql
  scalar JSON
`;

export const resolvers = {
  JSON: JSONResolver,
};

export default {
  typeDefs,
  resolvers,
};
