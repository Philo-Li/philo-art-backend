// eslint-disable-next-line import/no-named-as-default
import BaseModel from './BaseModel';

class CollectedPhoto extends BaseModel {
  static get idColumn() {
    return 'id';
  }

  static get tableName() {
    return 'collected_photos';
  }
}

export default CollectedPhoto;
