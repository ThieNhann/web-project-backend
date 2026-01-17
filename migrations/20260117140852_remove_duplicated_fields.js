/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.dropTableIfExists('two_factor_auth');

    // Remove duplicaited fields from users table 
    await knex.schema.alterTable('users', table => {
        table.dropColumn('display_name');
        table.dropColumn('profile_image_url');
    });

    // Add board_size field to games table
    await knex.schema.alterTable('games', table => {
        table.integer('board_size').defaultTo(4);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
    // Restore
    await knex.schema.alterTable('users', table => {
        table.string('display_name');
        table.string('profile_image_url');
    });

    // Remove board_size field from games table
    await knex.schema.alterTable('games', table => {
        table.dropColumn('board_size');
    });
};
