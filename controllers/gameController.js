const db = require('../config/db');

const getGames = async (req, res) => {
  try {
    // lấy game đang active
    // sort theo id
    const games = await db('games')
      .where('is_active', true)
      .select('id', 'name', 'code', 'description')
      .orderBy('id', 'asc');

    res.json({
      success: true,
      count: games.length,
      data: games
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi lấy danh sách game' 
    });
  }
};

module.exports = { getGames };