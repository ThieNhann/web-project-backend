/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del()
  await knex('users').insert([
    { username: 'admin01', password: 'hashed_password_123', full_name: 'Super Admin', role: 'admin' },
    { username: 'user01', password: 'hashed_password_123', full_name: 'Nguyen Van A', role: 'user' },
    { username: 'user02', password: 'hashed_password_123', full_name: 'Tran Thi B', role: 'user' },
    { username: 'user03', password: 'hashed_password_123', full_name: 'Le Van C', role: 'user' },
    { username: 'gamer_vip', password: 'hashed_password_123', full_name: 'Pro Player', role: 'user' }
  ]);
};
