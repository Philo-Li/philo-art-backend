import { gql } from 'apollo-server';

export const typeDefs = gql`
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
