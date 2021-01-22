// eslint-disable-next-line import/no-named-as-default
import BaseModel from './BaseModel';

class CollectionReview extends BaseModel {
  static get idColumn() {
    return 'id';
  }

  static get tableName() {
    return 'collection_reviews';
  }
}

export default CollectionReview;
