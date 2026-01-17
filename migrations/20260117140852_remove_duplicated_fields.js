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
};
