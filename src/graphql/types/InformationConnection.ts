export const typeDefs = `#graphql
  type InformationEdge {
    cursor: String!
    node: Information!
  }

  type InformationConnection {
    pageInfo: PageInfo!
    edges: [InformationEdge!]!
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
