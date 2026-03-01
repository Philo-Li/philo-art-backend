export const typeDefs = `#graphql
  type LikeEdge {
    cursor: String!
    node: Like!
  }

  type LikeConnection {
    pageInfo: PageInfo!
    edges: [LikeEdge!]!
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
