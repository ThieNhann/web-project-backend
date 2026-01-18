import db from '../config/db.js';

// --------------------------------- GAME MANAGEMENT CONTROLLERS -----------------------------------------

const getAvailableGames = async (req, res) => {
    try {
        const games = await db('games')
            .where('is_active', true)
            .select('code as gameId', 'name as title', 'description');

        res.json(games);
    } catch (error) {
        console.error('Error fetching available games:', error);
        res.status(500).json({ error: 'Failed to fetch available games' });
    }
};

const getGameDetails = async (req, res) => {
    try {
        const { gameId } = req.params; 

        // Find game by gameId
        const game = await db('games')
            .where('id', gameId)
            .first();
        
        // If not found
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json({
            gameId: game.code,
            title: game.name,
            description: game.description,
            status: game.is_active ? 'active' : 'inactive',
            boardSize: game.board_size || null,
        });
    } catch (error) {
        console.error('Error fetching game details:', error);
        res.status(500).json({ error: 'Failed to fetch game details' });
    }
};

const activateGameMode = async (req, res) => {
    try {
        const { gameId } = req.params;

        const updated = await db('games')
            .where('id', gameId)
            .update( { is_active: true } );

        if (!updated) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json({ message: 'Game mode activated' });
    } catch (error) {
        console.error('Error activating game mode:', error);
        res.status(500).json({ error: 'Failed to activate game mode' });
    }
};

const deactivateGameMode = async (req, res) => {
    try {
        const { gameId } = req.params;

        const updated = await db('games')
            .where('id', gameId)
            .update({ is_active: false });

        if (!updated) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json({ message: 'Game mode deactivated' });
    } catch (error) {
        console.error('Error deactivating game mode:', error);
        res.status(500).json({ error: 'Failed to deactivate game mode' });
    }
};

const updateBoardSize = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { boardSize } = req.body;

        const updated = await db('games')
            .where('id', gameId)
            .update({ board_size: boardSize });

        if (!updated) {
            return res.status(404).json({ error: 'Game not found' });
        }

        res.json({ message: 'Board size updated' });
    } catch (error) {
        console.error('Error updating board size:', error);
        res.status(500).json({ error: 'Failed to update board size' });
    }
};


// --------------------------------- STATISTICS CONTROLLERS -----------------------------------------

// Lấy số người chơi hoạt động 24h qua
const get24HourPlayers = async (req, res) => {
    try {
        const result = await db('game_records')
            .where('created_at', '>=', db.raw("NOW() - INTERVAL '24 HOURS'"))
            .countDistinct('user_id as count')
            .first();

        res.json({ count: parseInt(result.count) || 0 });
    } catch (error) {
        console.error('Error fetching 24h players:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Lấy số game đã tạo 24h qua
const get24HourGames = async (req, res) => {
    try {
        const result = await db('game_records')
            .where('created_at', '>=', db.raw("NOW() - INTERVAL '24 HOURS'"))
            .count('id as count')
            .first();

        res.json({ count: parseInt(result.count) || 0 });
    } catch (error) {
        console.error('Error fetching 24h games:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Thống kê serverload
const get24HourServerLoad = async (req, res) => {
    try {
        // Số record trong 1 giờ chia cho 100 (ngưỡng)
        const recentActivity = await db('game_records')
            .where('created_at', '>=', db.raw("NOW() - INTERVAL '1 HOUR'"))
            .count('id as count')
            .first();
        
        const loadPercentage = Math.min(100, (parseInt(recentActivity.count) / 100) * 100);
        res.json({ load: loadPercentage.toFixed(2) });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Phần trăm các loại game chơi trong vòng 30d
const getMonthlyGameTypePercentage = async (req, res) => {
    try {
        const stats = await db('game_records')
            .join('games', 'game_records.game_id', 'games.id')
            .where('game_records.created_at', '>=', db.raw("NOW() - INTERVAL '30 DAYS'"))
            .select('games.name as label')
            .count('game_records.id as value')
            .groupBy('games.name');

        res.json(stats);
    } catch (error) {
        console.error('Error fetching game type stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Thống kê lượng người chơi theo từng tháng trong vòng 1 năm qua
const getYearlyPlayers = async (req, res) => {
    try {
        const stats = await db('game_records')
            .select(db.raw("to_char(created_at, 'Mon') as month"))
            .countDistinct('user_id as players')
            .where('created_at', '>=', db.raw("NOW() - INTERVAL '1 YEAR'"))
            .groupByRaw("to_char(created_at, 'Mon'), extract(month from created_at)")
            .orderByRaw("extract(month from created_at)");

        res.json(stats);
    } catch (error) {
        console.error('Error fetching yearly stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// --------------------------------- USERS MANAGEMENT CONTROLLERS -----------------------------------------

// Lấy danh sách user có phân trang (?page=1 default)
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Mỗi trang 10 user
        const offset = (page - 1) * limit;

        const users = await db('users')
            .select('id', 'username', 'full_name', 'role', 'is_active', 'created_at')
            .limit(limit)
            .offset(offset)
            .orderBy('created_at', 'desc');

        const totalCount = await db('users').count('id as count').first();

        res.json({
            users,
            totalPages: Math.ceil(parseInt(totalCount.count) / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Tìm kiếm user theo username hoặc full_name
const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: 'Query is required' });

        const users = await db('users')
            .where('username', 'ilike', `%${query}%`)
            .orWhere('full_name', 'ilike', `%${query}%`)
            .select('id', 'username', 'full_name', 'role', 'is_active');

        res.json(users);
    } catch (error) {
        console.error('Search failed:', error);
        res.status(500).json({ error: 'Search failed' });
    }
};

// Kích hoạt tài khoản
const activateUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const updated = await db('users').where({ id: userId }).update({ is_active: true });
        
        if (!updated) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User account activated' });
    } catch (error) {
        res.status(500).json({ error: 'Activation failed' });
    }
};

// Khóa tài khoản
const deactivateUser = async (req, res) => {
    try {
        const { userId } = req.body;
        const updated = await db('users').where({ id: userId }).update({ is_active: false });
        
        if (!updated) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User account deactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Deactivation failed' });
    }
};

export default {
    getAvailableGames,
    getGameDetails,
    activateGameMode,
    deactivateGameMode,
    updateBoardSize,

    get24HourPlayers,
    get24HourGames,
    get24HourServerLoad,
    getMonthlyGameTypePercentage,
    getYearlyPlayers,

    getUsers,
    searchUsers,
    activateUser,
    deactivateUser,
}