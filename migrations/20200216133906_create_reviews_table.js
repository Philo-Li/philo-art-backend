/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('reviews', (table) => {
    table.text('id').primary();
    table
      .text('user_id')
      .references('users.id')
      .onDelete('cascade');
    table
      .text('article_id')
      .references('articles.id')
      .onDelete('cascade');
    table.text('text');
    table.timestamp('created_at');
    table.timestamp('updated_at');

    table.index(['user_id', 'article_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('reviews');
};
