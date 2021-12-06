// eslint-disable-next-line import/no-named-as-default
import BaseModel from './BaseModel';

class Follow extends BaseModel {
  static get idColumn() {
    return 'id';
  }

  static get tableName() {
    return 'follows';
  }
}

export default Follow;
