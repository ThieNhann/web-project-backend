/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable("achievements", (table) => {
    table.string("condition_type");
    table.jsonb("condition_value");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable("achievements", (table) => {
    table.dropColumn("condition_type");
    table.dropColumn("condition_value");
  });
}
