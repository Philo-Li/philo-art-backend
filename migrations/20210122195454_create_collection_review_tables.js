/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('collection_reviews', (table) => {
    table.text('id').primary();
    table
      .text('user_id')
      .references('users.id')
      .onDelete('cascade');
    table
      .text('collection_id')
      .references('collections.id')
      .onDelete('cascade');
    table.text('text');
    table.timestamp('created_at');
    table.timestamp('updated_at');

    table.index(['collection_id', 'user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('collection_reviews');
};
