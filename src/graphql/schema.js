/* eslint-disable import/no-named-as-default-member */
import { makeExecutableSchema, gql } from 'apollo-server';
import { merge } from 'lodash';

import Article from './types/Article';
import articleQuery from './queries/article';
import createArticleMutation from './mutations/createArticle';
import User from './types/User';
import createUserMutation from './mutations/createUser';
import authorizeMutation from './mutations/authorize';
import usersQuery from './queries/users';
import authorizedUserQuery from './queries/authorizedUser';
import articlesQuery from './queries/articles';
import PageInfo from './types/PageInfo';
import ArticleConnection from './types/ArticleConnection';
import OrderDirection from './enums/OrderDirection';
import createReviewMutation from './mutations/createReview';
import Review from './types/Review';
import ReviewConnection from './types/ReviewConnection';
import UserConnection from './types/UserConnection';
import deleteReviewMutation from './mutations/deleteReview';
import DateTime from './scalars/DateTime';

const rootTypeDefs = gql`
  type Query {
    root: String
  }

  type Mutation {
    root: String
  }
`;

const typeDefs = [
  rootTypeDefs,
  DateTime.typeDefs,
  Article.typeDefs,
  articleQuery.typeDefs,
  createArticleMutation.typeDefs,
  User.typeDefs,
  createUserMutation.typeDefs,
  authorizeMutation.typeDefs,
  usersQuery.typeDefs,
  authorizedUserQuery.typeDefs,
  articlesQuery.typeDefs,
  PageInfo.typeDefs,
  ArticleConnection.typeDefs,
  OrderDirection.typeDefs,
  createReviewMutation.typeDefs,
  Review.typeDefs,
  ReviewConnection.typeDefs,
  UserConnection.typeDefs,
  deleteReviewMutation.typeDefs,
];

const resolvers = merge(
  DateTime.resolvers,
  Article.resolvers,
  articleQuery.resolvers,
  createArticleMutation.resolvers,
  User.resolvers,
  createUserMutation.resolvers,
  authorizeMutation.resolvers,
  usersQuery.resolvers,
  authorizedUserQuery.resolvers,
  articlesQuery.resolvers,
  PageInfo.resolvers,
  ArticleConnection.resolvers,
  OrderDirection.resolvers,
  createReviewMutation.resolvers,
  Review.resolvers,
  ReviewConnection.resolvers,
  UserConnection.resolvers,
  deleteReviewMutation.resolvers,
);

const createSchema = () => {
  return makeExecutableSchema({
    typeDefs,
    resolvers,
  });
};

export default createSchema;
