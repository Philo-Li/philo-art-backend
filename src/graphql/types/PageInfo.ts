export const typeDefs = `#graphql
  type PageInfo {
    hasNextPage: Boolean!
    totalCount: Int!
    startCursor: String
    endCursor: String
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
