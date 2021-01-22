/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('photo_reviews', (table) => {
    table.text('id').primary();
    table
      .text('user_id')
      .references('users.id')
      .onDelete('cascade');
    table
      .text('photo_id')
      .references('photos.id')
      .onDelete('cascade');
    table.text('text');
    table.timestamp('created_at');
    table.timestamp('updated_at');

    table.index(['photo_id', 'user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('photo_reviews');
};
