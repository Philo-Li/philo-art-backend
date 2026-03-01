export const typeDefs = `#graphql
  type CollectionEdge {
    cursor: String!
    node: Collection!
  }

  type CollectionConnection {
    pageInfo: PageInfo!
    edges: [CollectionEdge!]!
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
