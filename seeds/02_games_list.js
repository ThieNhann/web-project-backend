exports.seed = async function(knex) {
  // xóa dữ liệu cũ
  await knex('games').del();

  // 7 game
  await knex('games').insert([
    { name: 'Caro 5', code: 'caro_5', description: 'Classic, win with 5 consecutive pieces', is_active: true },
    { name: 'Caro 4', code: 'caro_4', description: 'Smaller variant, win with 4 pieces', is_active: true },
    { name: 'Tic-Tac-Toe', code: 'tictactoe', description: 'Simple 3x3 game', is_active: true },
    { name: 'Snake', code: 'snake', description: 'Eat food and avoid hitting walls', is_active: true },
    { name: 'Match 3', code: 'match3', description: 'Similar to Candy Crush', is_active: true },
    { name: 'Memory', code: 'memory', description: 'Flip cards to find matching pairs', is_active: true },
    { name: 'Freehand Drawing', code: 'paint', description: 'Unlimited creativity', is_active: true },
  ]);
};