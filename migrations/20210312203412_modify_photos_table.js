/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.table('photos', (table) => {
    table.dropColumn('genres');
    table.specificType('labels', 'text ARRAY');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('photos');
};
