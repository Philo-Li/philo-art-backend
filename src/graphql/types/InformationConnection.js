import { gql } from 'apollo-server';

export const typeDefs = gql`
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
