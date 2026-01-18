import express from 'express';
import adminController from '../controllers/adminController.js';
const router = express.Router();

// GET /api/admin/game-management/available-games
router.get(
    '/game-management/available-games',
    adminController.getAvailableGames
);

// GET /api/admin/game-management/game-details/:gameId
router.get(
    '/game-management/game-details/:gameId',
    adminController.getGameDetails
);


// POST /api/admin/game-management/activate-game-mode/:gameId
router.post(
    '/game-management/activate-game-mode/:gameId',
    adminController.activateGameMode
);

// POST /api/admin/game-management/deactivate-game-mode/:gameId
router.post(
    '/game-management/deactivate-game-mode/:gameId',
    adminController.deactivateGameMode
);

// PUT /api/admin/game-management/update-board-size/:gameId
router.put(
    '/game-management/update-board-size/:gameId',
    adminController.updateBoardSize
);

// GET /api/admin/statistics/24hour-players
router.get(
    '/statistics/24hour-players', 
    adminController.get24HourPlayers);

// GET /api/admin/statistics/24hour-games
router.get(
    '/statistics/24hour-games', 
    adminController.get24HourGames);

// GET /api/admin/statistics/24hour-server-load
router.get(
    '/statistics/24hour-server-load', 
    adminController.get24HourServerLoad);

// GET /api/admin/statistics/monthly-game-type-percentage
router.get(
    '/statistics/monthly-game-type-percentage', 
    adminController.getMonthlyGameTypePercentage);

// GET /api/admin/statistics/yearly-players
router.get(
    '/statistics/yearly-players', 
    adminController.getYearlyPlayers);

export default router;