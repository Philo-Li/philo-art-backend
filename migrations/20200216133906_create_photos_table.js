/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('photos', (table) => {
    table.text('id').primary();
    table
      .text('user_id')
      .references('users.id')
      .onDelete('cascade');
    table.text('width');
    table.text('height');
    table.text('tiny');
    table.text('small');
    table.text('large');
    table.text('color');
    table.text('download_count');
    table.text('credit_web');
    table.text('credit_id');
    table.text('download_page');
    table.text('photographer');
    table.text('description');
    table.text('tags');
    table.text('labels');
    table.timestamp('created_at');
    table.timestamp('updated_at');

    table.index(['user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('photos');
};
