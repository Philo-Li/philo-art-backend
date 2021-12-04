/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('informations', (table) => {
    table.string('id', 255).primary().notNullable().unique();
    table.string('name', 255).unique();
    table.text('value');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index('name');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('informations');
};
