const db = require('../config/db');

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

module.exports = {
    getAvailableGames,
    getGameDetails,
    activateGameMode,
    deactivateGameMode,
    updateBoardSize,
};