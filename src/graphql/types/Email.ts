export const typeDefs = `#graphql
  type Email {
    id: ID!
    user: User!
    email: String!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  Email: {},
};

export default {
  typeDefs,
  resolvers,
};
