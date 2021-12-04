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
    table.text('title_zh');
    table.integer('year');
    table.text('description');
    table.text('all_tags');
    table.text('tags');
    table.text('photo_width');
    table.text('photo_height');
    table.text('artwork_width');
    table.text('artwork_height');
    table.text('src_tiny');
    table.text('src_small');
    table.text('src_large');
    table.text('src_youtube');
    table.text('color');
    table.text('all_colors');
    table.text('download_count');
    table.text('credit_id');
    table.text('artist');
    table.text('license');
    table.text('type');
    table.text('medium');
    table.text('status');
    table.text('related_photos');

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['user_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('photos');
};
