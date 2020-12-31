/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('articles', (table) => {
    table.text('id').primary();
    table
      .text('user_id')
      .references('users.id')
      .onDelete('cascade');
    table.text('title');
    table.text('title_en');
    table.text('description');
    table.text('text');
    table.timestamp('created_at');
    table.timestamp('updated_at');

    table.index(['title_en', 'user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('articles');
};
