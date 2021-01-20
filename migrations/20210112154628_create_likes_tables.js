/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('likes', (table) => {
    table.text('id').primary();
    table
      .text('user_id')
      .references('users.id')
      .onDelete('cascade');
    table
      .text('photo_id')
      .references('photos.id')
      .onDelete('cascade');
    table.timestamp('created_at');
    table.timestamp('updated_at');

    table.index(['photo_id', 'user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('likes');
};
