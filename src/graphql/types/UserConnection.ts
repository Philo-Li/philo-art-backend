export const typeDefs = `#graphql
  type UserEdge {
    cursor: String!
    node: User!
  }

  type UserConnection {
    pageInfo: PageInfo!
    edges: [UserEdge!]!
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
