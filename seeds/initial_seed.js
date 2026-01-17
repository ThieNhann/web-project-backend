const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

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

  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash('123456', salt); // tatsa cả user mẫu dùng pass: 123456

  const users = await knex('users').insert([
    { id: uuidv4(), username: 'admin_pro', password: commonPassword, full_name: 'Admin', role: 'admin', email: 'admin@example.com' },
    { id: uuidv4(), username: 'nguyenvana', password: commonPassword, full_name: 'Nguyen Van A', role: 'user', email: 'nguyenvana@example.com' },
    { id: uuidv4(), username: 'lethib', password: commonPassword, full_name: 'Le Thi B', role: 'user', email: 'lethib@example.com' },
    { id: uuidv4(), username: 'tranvanc', password: commonPassword, full_name: 'Tran Van C', role: 'user', email: 'tranvanc@example.com' },
    { id: uuidv4(), username: 'skibiditoilet', password: commonPassword, full_name: 'Skibidi Toilet', role: 'user', email: 'skibiditoilet@example.com' }
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

  // Achievements
  const achievements = await knex('achievements').insert([
    { id: 1, name: 'First Win', description: 'Win your first game', icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzWbJMKCp6HocUPQw8yfOJtcF4Im6nNlS1Mw&s' },
    { id: 2, name: 'High Scorer', description: 'Score over 2000 points in a game', icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzWbJMKCp6HocUPQw8yfOJtcF4Im6nNlS1Mw&' }
  ]).returning('id');

  // User Achievements
  await knex('user_achievements').insert([
    { id: 1, user_id: users[1].id, achievement_id: achievements[0].id, unlocked_at: new Date() },
    { id: 2, user_id: users[0].id, achievement_id: achievements[1].id, unlocked_at: new Date() }
  ]);

  // User Rankings
  await knex('game_records').insert([
    { user_id: users[0].id, game_id: games[0].id, score: 2500, play_time: 110 },
    { user_id: users[1].id, game_id: games[0].id, score: 1800, play_time: 130 },
    { user_id: users[2].id, game_id: games[0].id, score: 2200, play_time: 100 }
  ]);
};