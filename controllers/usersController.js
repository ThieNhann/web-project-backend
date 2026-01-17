

const db = require('../config/db');

const getUsersAchievements = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Get paginated achievements
    const achievements = await db('user_achievements')
      .join('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
      .where('user_achievements.user_id', userId)
      .select(
        'achievements.name as title',
        'achievements.icon_url as iconUrl',
        'achievements.description',
        'user_achievements.unlocked_at as dateAchieved'
      )
      .orderBy('user_achievements.unlocked_at', 'desc')
      .limit(limit)
      .offset(offset);


    // Get total count of user achievements
    const totalCount = await db('user_achievements')
      .join('achievements', 'user_achievements.achievement_id', '=', 'achievements.id')
      .where('user_achievements.user_id', userId)
      .count('* as count')
      .first();

    const totalAchievements = totalCount?.count || 0;

    // Check if there are more achievements
    const hasMore = offset + limit < totalAchievements;

    res.json({
      achievements,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
}

const getUsersRankings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const filter = req.query.type || 'global'; // only-me, friends, global
    const game = req.query.game; // snake, caro-5, caro-4, tic-tac-toe, memory, match-3
    

    let query = db('game_records')
      .join('users', 'game_records.user_id', '=', 'users.id')
      .join('games', 'game_records.game_id', '=', 'games.id')
      .select('users.id', 'users.username', 'users.avatar_url', db.raw('SUM(game_records.score) as total_score'))
      .groupBy('users.id', 'users.username', 'users.avatar_url')
      .orderBy('total_score', 'desc');

    // Apply game filter
    if (game) {
      query = query.where('games.code', game);
    }

    // Apply user type filter
    if (filter === 'only-me') {
      query = query.where('game_records.user_id', userId);
    } else if (filter === 'friends') {
      query = query.whereIn('game_records.user_id', db('friends')
        .select('friend_id')
        .where('user_id', userId)
        .where('status', 'accepted')
      );
    }
    // filter === 'global' - no additional where clause

    const rankings = await query.limit(100);

    res.json({ rankings });
  } catch (error) {
    console.error('Error fetching user rankings:', error);
    res.status(500).json({ error: 'Failed to fetch rankings' });
  }
}

module.exports = {
  getUsersAchievements,
  getUsersRankings,
};

