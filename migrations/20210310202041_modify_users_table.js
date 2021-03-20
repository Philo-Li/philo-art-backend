/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.table('users', (table) => {
    table.text('first_name');
    table.text('last_name');
    table.text('email');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
