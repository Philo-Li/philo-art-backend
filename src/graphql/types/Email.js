import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Email {
    id: ID!
    user: User!
    email: String!
    createdAt: DateTime!
  }
`;

export const resolvers = {
  Email: {},
};

export default {
  typeDefs,
  resolvers,
};
