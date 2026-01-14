const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Định nghĩa route: GET /api/games
router.get('/', gameController.getGames);

module.exports = router;