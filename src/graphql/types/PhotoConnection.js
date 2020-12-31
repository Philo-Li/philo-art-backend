import { gql } from 'apollo-server';

export const typeDefs = gql`
  type PhotoEdge {
    cursor: String!
    node: Photo!
  }

  type PhotoConnection {
    pageInfo: PageInfo!
    edges: [PhotoEdge!]!
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
