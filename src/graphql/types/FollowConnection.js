import { gql } from 'apollo-server';

export const typeDefs = gql`
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
