/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('collections', (table) => {
    table.string('id', 255).primary().notNullable().unique();
    table
      .string('user_id')
      .references('users.id')
      .onDelete('cascade');
    table.string('title', 255).notNullable();
    table.text('description');
    table.text('cover');
    table.boolean('public').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['title', 'user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('collections');
};
