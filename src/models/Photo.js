// eslint-disable-next-line import/no-named-as-default
import BaseModel from './BaseModel';

class Photo extends BaseModel {
  static get idColumn() {
    return 'id';
  }

  static get tableName() {
    return 'photos';
  }
}

export default Photo;
