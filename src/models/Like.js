// eslint-disable-next-line import/no-named-as-default
import BaseModel from './BaseModel';

class Like extends BaseModel {
  static get idColumn() {
    return 'id';
  }

  static get tableName() {
    return 'likes';
  }
}

export default Like;
