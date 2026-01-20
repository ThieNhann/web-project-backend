import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function seed(knex) {
  // Delete old data
  await knex('user_achievements').del();
  await knex('achievements').del();
  await knex('user_stats').del();
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
    { id: 1, name: 'Caro 5', code: 'caro_5', description: 'Win with 5 pieces in a row', board_width: 10, board_height: 10, timer: 0 },
    { id: 2, name: 'Caro 4', code: 'caro_4', description: 'Win with 4 pieces in a row', board_width: 10, board_height: 10, timer: 0 },
    { id: 3, name: 'Tic-tac-toe', code: 'tictactoe', description: 'Classic 3x3 board game', board_width: 3, board_height: 3, timer: 0 },
    { id: 4, name: 'Snake', code: 'snake', description: 'Move and collect food', board_width: 10, board_height: 10, timer: 60 },
    { id: 5, name: 'Match 3', code: 'match_3', description: 'Arrange candies like Candy Crush', board_width: 10, board_height: 10, timer: 60 },
    { id: 6, name: 'Memory Card', code: 'memory_card', description: 'Find matching card pairs', board_width: 6, board_height: 6, timer: 150 },
    { id: 7, name: 'Sketch', code: 'sketch', description: 'Create freehand drawings', board_width: 10, board_height: 10, timer: 0 }
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
    { id: 1, name: 'First Win', description: 'Win your first game', icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzWbJMKCp6HocUPQw8yfOJtcF4Im6nNlS1Mw&s', condition_type: 'win_count', condition_value: JSON.stringify({ threshold: 1 }) },
    { id: 2, name: 'Five Time Winner', description: 'Win 5 matches', icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzWbJMKCp6HocUPQw8yfOJtcF4Im6nNlS1Mw&', condition_type: 'win_count', condition_value: JSON.stringify({ threshold: 5 }) },
    { id: 3, name: 'Regular Player', description: 'Play 5 matches', icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzWbJMKCp6HocUPQw8yfOJtcF4Im6nNlS1Mw&', condition_type: 'match_count', condition_value: JSON.stringify({ threshold: 5 }) },
    { id: 4, name: 'Newbie', description: 'First Login', icon_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzWbJMKCp6HocUPQw8yfOJtcF4Im6nNlS1Mw&', condition_type: 'login_count', condition_value: JSON.stringify({ threshold: 1 }) }
  ]).returning('id');

  // User Stats
  await knex('user_stats').insert([
    { user_id: users[0].id, login_count: 100, win_count: 50, match_count: 75, max_score: 2500 },
    { user_id: users[1].id, login_count: 25, win_count: 10, match_count: 20, max_score: 1800 },
    { user_id: users[2].id, login_count: 30, win_count: 15, match_count: 25, max_score: 2200 },
    { user_id: users[3].id, login_count: 5, win_count: 2, match_count: 5, max_score: 1200 },
    { user_id: users[4].id, login_count: 10, win_count: 5, match_count: 10, max_score: 1500 }
  ]);

  // User Achievements
  await knex('user_achievements').insert([
    // First Win
    { user_id: users[0].id, achievement_id: 1, unlocked_at: new Date() },
    { user_id: users[1].id, achievement_id: 1, unlocked_at: new Date() },
    { user_id: users[2].id, achievement_id: 1, unlocked_at: new Date() },
    // Five Time Winner (win_count >= 5)
    { user_id: users[0].id, achievement_id: 2, unlocked_at: new Date() },
    { user_id: users[2].id, achievement_id: 2, unlocked_at: new Date() },
    // Regular Player (match_count >= 5)
    { user_id: users[0].id, achievement_id: 3, unlocked_at: new Date() },
    { user_id: users[1].id, achievement_id: 3, unlocked_at: new Date() },
    { user_id: users[2].id, achievement_id: 3, unlocked_at: new Date() },
    { user_id: users[4].id, achievement_id: 3, unlocked_at: new Date() },
    // Newbie (login_count >= 1)
    { user_id: users[0].id, achievement_id: 4, unlocked_at: new Date() },
    { user_id: users[1].id, achievement_id: 4, unlocked_at: new Date() },
    { user_id: users[2].id, achievement_id: 4, unlocked_at: new Date() },
    { user_id: users[3].id, achievement_id: 4, unlocked_at: new Date() },
    { user_id: users[4].id, achievement_id: 4, unlocked_at: new Date() }
  ]);

  // User Rankings
  await knex('game_records').insert([
    { user_id: users[0].id, game_id: games[0].id, score: 2500, play_time: 110 },
    { user_id: users[1].id, game_id: games[0].id, score: 1800, play_time: 130 },
    { user_id: users[2].id, game_id: games[0].id, score: 2200, play_time: 100 }
  ]);
};