/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();               // Self-incrementing ID
    table.string('username').notNullable().unique(); // Tên đăng nhập
    table.string('password').notNullable(); // Mật khẩu (hash sau)
    table.string('full_name');
    table.string('role').defaultTo('user'); // Admin / user
    table.timestamps(true, true); // Tạo cột created_at, updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
