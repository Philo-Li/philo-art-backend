import User from './User';
import Photo from './Photo';
import PhotoReview from './PhotoReview';
import Collection from './Collection';
import CollectedPhoto from './CollectedPhoto';
import CollectionReview from './CollectionReview';
import Like from './Like';
import Information from './Information';
import Email from './Email';

export const bindModels = (knex) => {
  return {
    User: User.bindKnex(knex),
    Photo: Photo.bindKnex(knex),
    PhotoReview: PhotoReview.bindKnex(knex),
    Collection: Collection.bindKnex(knex),
    CollectedPhoto: CollectedPhoto.bindKnex(knex),
    CollectionReview: CollectionReview.bindKnex(knex),
    Like: Like.bindKnex(knex),
    Information: Information.bindKnex(knex),
    Email: Email.bindKnex(knex),
  };
};

export default bindModels;
