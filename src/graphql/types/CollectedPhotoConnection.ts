export const typeDefs = `#graphql
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
