import { gql } from 'apollo-server';

export const typeDefs = gql`
  type ArticleEdge {
    cursor: String!
    node: Article!
  }

  type ArticleConnection {
    pageInfo: PageInfo!
    edges: [ArticleEdge!]!
  }
`;

export const resolvers = {};

export default {
  typeDefs,
  resolvers,
};
