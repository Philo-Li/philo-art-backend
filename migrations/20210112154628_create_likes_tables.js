/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('likes', (table) => {
    table.string('id', 255).primary().notNullable().unique();
    table
      .string('user_id')
      .references('users.id')
      .onDelete('cascade');
    table
      .string('photo_id')
      .references('photos.id')
      .onDelete('cascade');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['photo_id', 'user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('likes');
};
