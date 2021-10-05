/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('emails', (table) => {
    table.text('id').primary();
    table.text('email').unique();
    table.timestamp('created_at');
    table.timestamp('updated_at');

    table.index('email');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('emails');
};
