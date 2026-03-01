export const typeDefs = `#graphql
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
