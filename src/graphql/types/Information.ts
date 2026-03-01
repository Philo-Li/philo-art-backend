export const typeDefs = `#graphql
  type Information {
    id: ID!
    name: String!
    value: String!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  Information: {},
};

export default {
  typeDefs,
  resolvers,
};
