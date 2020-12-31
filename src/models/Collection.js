// eslint-disable-next-line import/no-named-as-default
import BaseModel from './BaseModel';

class Collection extends BaseModel {
  static get idColumn() {
    return 'id';
  }

  static get tableName() {
    return 'collections';
  }
}

export default Collection;
