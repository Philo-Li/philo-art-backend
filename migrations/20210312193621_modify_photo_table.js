/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.table('photos', (table) => {
    table.text('genres');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('photos');
};
