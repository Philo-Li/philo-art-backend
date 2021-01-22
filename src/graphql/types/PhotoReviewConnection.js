import { gql } from 'apollo-server';

export const typeDefs = gql`
  type PhotoReviewEdge {
    cursor: String!
    node: PhotoReview!
  }

  type PhotoReviewConnection {
    pageInfo: PageInfo!
    edges: [PhotoReviewEdge!]!
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
