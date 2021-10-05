/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.text('id').primary();
    table.integer('philoart_id');
    table.text('username').unique();
    table.text('password');
    table.text('profile_image');
    table.text('first_name');
    table.text('last_name');
    table.text('email');
    table.timestamp('created_at');
    table.timestamp('updated_at');

    table.index('username', 'email');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
