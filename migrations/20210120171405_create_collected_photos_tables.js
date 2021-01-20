/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('collected_photos', (table) => {
    table.text('id').primary();
    table
      .text('user_id')
      .references('users.id')
      .onDelete('cascade');
    table
      .text('photo_id')
      .references('photos.id')
      .onDelete('cascade');
    table
      .text('collection_id')
      .references('collections.id')
      .onDelete('cascade');
    table.timestamp('created_at');
    table.timestamp('updated_at');

    table.index(['photo_id', 'collection_id', 'user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('collected_photos');
};
