/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable("user_stats", (table) => {
    table.string("user_id").primary().references("id").inTable("users").onDelete("CASCADE");
    table.integer("login_count").defaultTo(0);
    table.integer("win_count").defaultTo(0);
    table.integer("match_count").defaultTo(0);
    table.integer("max_score").defaultTo(0);
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("user_stats");
}
