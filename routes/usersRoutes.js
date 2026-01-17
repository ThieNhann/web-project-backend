const express = require('express');
const { validateRequest } = require('../middleware/validateRequestMiddleware');
const router = express.Router();
const usersController = require('../controllers/usersController');


// GET /api/users/:userId/achievements?page={page}
router.get('/:userId/achievements',
    validateRequest,
    usersController.getUsersAchievements
);

// GET /api/users/:userId/rankings?type=${filter}&game=${game}
// filter: only-me, friends, global
// game: snake, caro-5, caro-4, tic-tac-toe, memory, match-3
router.get('/:userId/rankings',
    validateRequest,
    usersController.getUsersRankings
)

module.exports = router;