/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
    await knex.schema.alterTable("games", (table) => {
        table.integer('board_width').defaultTo(10);
        table.integer('board_height').defaultTo(10);
        table.integer('timer').defaultTo(0); // Thời gian chơi tính bằng giây
        table.dropColumn('board_size');
    });  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
    await knex.schema.alterTable("games", (table) => {
        table.integer('board_size').defaultTo(4);
        table.dropColumn('board_width');
        table.dropColumn('board_height');
        table.dropColumn('timer');
    });
};
