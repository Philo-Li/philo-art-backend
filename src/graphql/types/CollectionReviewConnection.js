import { gql } from 'apollo-server';

export const typeDefs = gql`
  type CollectionReviewEdge {
    cursor: String!
    node: CollectionReview!
  }

  type CollectionReviewConnection {
    pageInfo: PageInfo!
    edges: [CollectionReviewEdge!]!
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
