exports.seed = async function(knex) {
  // Delete old data
  await knex('user_achievements').del();
  await knex('achievements').del();
  await knex('messages').del();
  await knex('reviews').del();
  await knex('game_records').del();
  await knex('games').del();
  await knex('users').del();

  // 5 users
  const users = await knex('users').insert([
    { username: 'admin_pro', password: 'hashed_password', full_name: 'Admin', role: 'admin' },
    { username: 'nguyenvana', password: 'hashed_password', full_name: 'Nguyen Van A', role: 'user' },
    { username: 'lethib', password: 'hashed_password', full_name: 'Le Thi B', role: 'user' },
    { username: 'tranvanc', password: 'hashed_password', full_name: 'Tran Van C', role: 'user' },
    { username: 'skibiditoilet', password: 'hashed_password', full_name: 'Skibidi Toilet', role: 'user' }
  ]).returning('id');

  // 7 games
  const games = await knex('games').insert([
    { name: 'Caro 5', code: 'caro_5', description: 'Win with 5 pieces in a row' },
    { name: 'Caro 4', code: 'caro_4', description: 'Win with 4 pieces in a row' },
    { name: 'Tic-tac-toe', code: 'tictactoe', description: 'Classic 3x3 board game' },
    { name: 'Snake', code: 'snake', description: 'Move and collect food' },
    { name: 'Match 3', code: 'match_3', description: 'Arrange candies like Candy Crush' },
    { name: 'Memory Card', code: 'memory_card', description: 'Find matching card pairs' },
    { name: 'Sketch', code: 'sketch', description: 'Create freehand drawings' }
  ]).returning('id');

  // Game history
  await knex('game_records').insert([
    { user_id: users[1].id, game_id: games[0].id, score: 1500, play_time: 120 },
    { user_id: users[2].id, game_id: games[0].id, score: 1200, play_time: 95 }
  ]);

  // Messages
  await knex('messages').insert([
    { sender_id: users[1].id, receiver_id: users[2].id, content: 'Wanna play Caro?' }
  ]);
};