export const typeDefs = `#graphql
  type FollowEdge {
    cursor: String!
    node: Follow!
  }

  type FollowConnection {
    pageInfo: PageInfo!
    edges: [FollowEdge!]!
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
