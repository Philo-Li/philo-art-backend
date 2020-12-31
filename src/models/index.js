import User from './User';
import Photo from './Photo';
import Collection from './Collection';
import Like from './Like';

export const bindModels = (knex) => {
  return {
    User: User.bindKnex(knex),
    Photo: Photo.bindKnex(knex),
    Collection: Collection.bindKnex(knex),
    Like: Like.bindKnex(knex),
  };
};

export default bindModels;
