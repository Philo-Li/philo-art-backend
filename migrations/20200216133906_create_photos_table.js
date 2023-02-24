/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema.createTable('photos', (table) => {
    table.string('id', 255).primary().notNullable().unique();
    table
      .string('user_id')
      .references('users.id')
      .onDelete('cascade');
    table.text('nft');
    table.text('title');
    table.integer('year');
    table.text('description');
    table.text('tags');
    table.text('image_key').notNullable();
    table.text('src_tiny');
    table.text('src_small');
    table.text('src_large');
    table.text('src_original');
    table.text('src_youtube');
    table.text('color');
    table.text('all_colors');
    table.text('download_count');
    table.text('credit_id');
    table.text('license');
    table.text('type');
    table.text('status');
    table.boolean('allow_download').notNullable().defaultTo(false);

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('photos');
};
