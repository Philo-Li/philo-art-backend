import User from './User';
import Review from './Review';
import Article from './Article';

export const bindModels = (knex) => {
  return {
    User: User.bindKnex(knex),
    Article: Article.bindKnex(knex),
    Review: Review.bindKnex(knex),
  };
};

export default bindModels;
