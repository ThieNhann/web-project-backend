/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Thêm các trường mới vào bảng users
  await knex.schema.alterTable("users", (table) => {
    table.string("email").notNullable().unique();
    table.string("full_name");
    table.boolean("is_active").defaultTo(true);
    table.timestamp("last_login");
    table.string("avatar_url");
  });

  // Tạo bảng 2FA
  await knex.schema.createTable("two_factor_auth", (table) => {
    table.string("user_id").primary().references("id").inTable("users").onDelete("CASCADE");
    table.string("code", 6).notNullable();
    table.string("two_factor_token").notNullable();
    table.timestamp("expires_at").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("two_factor_auth");

  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("email");
    table.dropColumn("full_name");
    table.dropColumn("is_active");
    table.dropColumn("last_login");
    table.dropColumn("avatar_url");
  });
};
