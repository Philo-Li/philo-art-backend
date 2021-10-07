// eslint-disable-next-line import/no-named-as-default
import BaseModel from './BaseModel';

class Information extends BaseModel {
  static get idColumn() {
    return 'id';
  }

  static get tableName() {
    return 'informations';
  }
}

export default Information;
