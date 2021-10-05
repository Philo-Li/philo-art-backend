/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('informations', (table) => {
    table.text('id').primary();
    table.text('name').unique();
    table.text('value');
    table.timestamp('created_at');
    table.timestamp('updated_at');

    table.index('name');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('informations');
};
