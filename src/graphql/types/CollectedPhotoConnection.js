import { gql } from 'apollo-server';

export const typeDefs = gql`
  type CollectedPhotoEdge {
    cursor: String!
    node: CollectedPhoto!
  }

  type CollectedPhotoConnection {
    pageInfo: PageInfo!
    edges: [CollectedPhotoEdge!]!
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
