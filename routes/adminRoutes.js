const express = require('express');
const { validateRequest } = require('../middleware/validateRequestMiddleware');
const adminController = require('../controllers/adminController');
const router = express.Router();


// -- GAME MANAGEMENT ROUTES --
router.get('/game-management/available-games', adminController.getAvailableGames);
router.get('/game-management/game-details/:gameId', adminController.getGameDetails);
router.post('/game-management/activate-game-mode/:gameId', adminController.activateGameMode);
router.post('/game-management/deactivate-game-mode/:gameId', adminController.deactivateGameMode);
router.put('/game-management/update-board-size/:gameId', adminController.updateBoardSize);

// -- STATISTICS ROUTES --
router.get('/statistics/24hour-players', adminController.get24HourPlayers);
router.get('/statistics/24hour-games', adminController.get24HourGames);
router.get('/statistics/24hour-server-load', adminController.get24HourServerLoad);
router.get('/statistics/monthly-game-type-percentage', adminController.getMonthlyGameTypePercentage);
router.get('/statistics/yearly-players', adminController.getYearlyPlayers);


module.exports = router;