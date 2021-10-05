// eslint-disable-next-line import/no-named-as-default
import BaseModel from './BaseModel';

class Email extends BaseModel {
  static get idColumn() {
    return 'id';
  }

  static get tableName() {
    return 'emails';
  }
}

export default Email;
