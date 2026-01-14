/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Bảng danh sách các Game (Caro, Snake, v.v.)
  await knex.schema.createTable('games', table => {
    table.increments('id').primary();
    table.string('name').notNullable(); // Tên hiển thị: Caro 5
    table.string('code').unique().notNullable(); // Tên code: caro_5
    table.string('description');
    table.boolean('is_active').defaultTo(true); // Admin dùng để bật/tắt game (-1đ nếu thiếu quản lý game)
    table.timestamps(true, true);
  });

  // 2. Bảng lưu trạng thái save game (save/load)
  await knex.schema.createTable('game_saves', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE'); // User xóa thì save mất
    table.integer('game_id').references('id').inTable('games').onDelete('CASCADE');
    table.jsonb('data').notNullable(); // lưu mảng 2 chiều/vị trí rắn dưới dạng JSON
    table.timestamp('saved_at').defaultTo(knex.fn.now());
  });

  // 3. Bảng lịch sử đấu & xếp hạng
  await knex.schema.createTable('game_records', table => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('game_id').references('id').inTable('games').onDelete('CASCADE');
    table.integer('score').defaultTo(0); // điểm
    table.float('play_time'); // poppy play time
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
  
  // 4. Bảng bạn bè
  await knex.schema.createTable('friends', table => {
     table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
     table.integer('friend_id').references('id').inTable('users').onDelete('CASCADE');
     table.string('status').defaultTo('pending'); // pending, accepted, blocked
     table.primary(['user_id', 'friend_id']);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('friends');
  await knex.schema.dropTableIfExists('game_records');
  await knex.schema.dropTableIfExists('game_saves');
  await knex.schema.dropTableIfExists('games');
};