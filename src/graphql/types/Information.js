import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Information {
    id: ID!
    name: String!
    value: String!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  Information: {},
};

export default {
  typeDefs,
  resolvers,
};
