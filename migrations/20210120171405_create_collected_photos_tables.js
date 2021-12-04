/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('collected_photos', (table) => {
    table.string('id', 255).primary().notNullable().unique();
    table
      .string('user_id')
      .references('users.id')
      .onDelete('cascade');
    table
      .string('photo_id')
      .references('photos.id')
      .onDelete('cascade');
    table
      .string('collection_id')
      .references('collections.id')
      .onDelete('cascade');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['photo_id', 'collection_id', 'user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('collected_photos');
};
