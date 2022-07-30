/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('follows', (table) => {
    table.string('id', 255).primary().notNullable().unique();
    table
      .string('user_id')
      .references('users.id')
      .onDelete('cascade');
    table
      .string('following_id')
      .references('users.id')
      .onDelete('cascade');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['user_id', 'following_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('follows');
};
