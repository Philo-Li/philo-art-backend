// eslint-disable-next-line import/no-named-as-default
import BaseModel from './BaseModel';

class PhotoReview extends BaseModel {
  static get idColumn() {
    return 'id';
  }

  static get tableName() {
    return 'photo_reviews';
  }
}

export default PhotoReview;
