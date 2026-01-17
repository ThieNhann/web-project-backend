const express = require('express');
const { validateRequest } = require('../middleware/validateRequestMiddleware');
const adminController = require('../controllers/adminController');
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


module.exports = router;