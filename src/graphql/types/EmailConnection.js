import { gql } from 'apollo-server';

export const typeDefs = gql`
  type EmailEdge {
    cursor: String!
    node: Email!
  }

  type EmailConnection {
    pageInfo: PageInfo!
    edges: [EmailEdge!]!
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
