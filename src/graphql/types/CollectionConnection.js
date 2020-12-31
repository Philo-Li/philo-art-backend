import { gql } from 'apollo-server';

export const typeDefs = gql`
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
