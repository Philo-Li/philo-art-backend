/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('collections', (table) => {
    table.text('id').primary();
    table
      .text('user_id')
      .references('users.id')
      .onDelete('cascade');
    table.text('title');
    table.text('description');
    table.text('cover');
    table.text('photo_count');
    table.timestamp('created_at');
    table.timestamp('updated_at');

    table.index(['title', 'user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('collections');
};
