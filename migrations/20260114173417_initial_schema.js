/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // USERS
  await knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.string('username').notNullable().unique();
    table.string('password').notNullable();
    table.string('full_name');
    table.string('role').defaultTo('user');
    table.string('avatar_url').defaultTo('default_avatar.png');
    table.string('bio');
    table.timestamps(true, true);
  });

  // GAMES
  await knex.schema.createTable('games', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('code').unique().notNullable();
    table.string('description');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // GAME SAVES
  await knex.schema.createTable('game_saves', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('game_id').references('id').inTable('games').onDelete('CASCADE');
    table.jsonb('data').notNullable();      // Trạng thái game dạng json?
    table.timestamp('saved_at').defaultTo(knex.fn.now());
  });

  // LỊCH SỬ ĐẤU / GAME RECORDS
  await knex.schema.createTable('game_records', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('game_id').references('id').inTable('games').onDelete('CASCADE');
    table.integer('score').defaultTo(0);
    table.float('play_time');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // BẠN BÈ
  await knex.schema.createTable('friends', table => {
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('friend_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('status').defaultTo('pending');
    table.primary(['user_id', 'friend_id']);
  });

  // RATING & COMMENT
  await knex.schema.createTable('reviews', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('game_id').references('id').inTable('games').onDelete('CASCADE');
    table.integer('rating').notNullable();
    table.text('comment');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // TIN NHẮN
  await knex.schema.createTable('messages', table => {
    table.increments('id').primary();
    table.integer('sender_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('receiver_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('content').notNullable();
    table.boolean('is_read').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // THÀNH TỰU
  await knex.schema.createTable('achievements', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('description');
    table.string('icon_url');
  });

  // USER - THÀNH TỰU
  await knex.schema.createTable('user_achievements', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('achievement_id').references('id').inTable('achievements').onDelete('CASCADE');
    table.timestamp('unlocked_at').defaultTo(knex.fn.now());
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('user_achievements');
  await knex.schema.dropTableIfExists('achievements');
  await knex.schema.dropTableIfExists('messages');
  await knex.schema.dropTableIfExists('reviews');
  await knex.schema.dropTableIfExists('friends');
  await knex.schema.dropTableIfExists('game_records');
  await knex.schema.dropTableIfExists('game_saves');
  await knex.schema.dropTableIfExists('games');
  await knex.schema.dropTableIfExists('users');
};