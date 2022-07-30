/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('emails', (table) => {
    table.string('id', 255).primary().notNullable().unique();
    table
      .string('user_id')
      .references('users.id')
      .onDelete('cascade');
    table.string('email', 255).unique();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('email');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('emails');
};
