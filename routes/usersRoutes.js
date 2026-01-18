import express from 'express';
import { validateRequest } from '../middleware/validateRequestMiddleware.js';
const router = express.Router();
import usersController from '../controllers/usersController.js';


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

export default router;