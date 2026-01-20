// const express = require('express');
// const router = express.Router();
// const gameController = require('../controllers/gameController');

import express from "express";
import { 
    getGames, 
    saveGame, 
    loadGame,
    getGameBoardSize,
    updateGameBoardSize,
    getGameTimer,
    updateGameTimer,
    postGameRecord,
    getGameRecords,
} from "../controllers/gameController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/games:
 *   get:
 *     summary: Get all available games
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: List of games
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameListResponse'
 */

/**
 * @swagger
 * /api/games/save:
 *   post:
 *     summary: Save current game progress
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - game_id
 *               - data
 *             properties:
 *               game_id:
 *                 type: integer
 *               data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Game saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseWithSuccess'
 */

/**
 * @swagger
 * /api/games/load:
 *   get:
 *     summary: Load saved game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: game_id
 *         schema:
 *           type: integer
 *         description: Game ID to load saves for (optional - if not provided, returns all saves)
 *     responses:
 *       200:
 *         description: Saved game data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   nullable: true
 */

/**
 * @swagger
 * /api/games/{id}/board-size:
 *   get:
 *     summary: Get game board size
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Board size information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BoardSizeResponse'
 *   put:
 *     summary: Update game board size
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - board_width
 *               - board_height
 *             properties:
 *               board_width:
 *                 type: integer
 *               board_height:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Board size updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/games/{id}/records:
 *   get:
 *     summary: Get game records and statistics
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Game records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *   post:
 *     summary: Post game record
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *               - play_time
 *             properties:
 *               score:
 *                 type: number
 *               play_time:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Record saved successfully
 */
router.get("/", getGames);

// POST /api/games/save - Lưu game (yêu cầu authentication)
router.post("/save", verifyToken, saveGame);

// GET /api/games/load - Tải game đã lưu (yêu cầu authentication)
router.get("/load", verifyToken, loadGame);

// GET /api/games/:id/board-size - Lấy kích thước bảng cho game cụ thể
router.get('/:id/board-size', getGameBoardSize);

// PUT /api/games/:id/update-board-size - Cập nhật kích thước bảng cho game cụ thể
router.put('/:id/update-board-size', verifyToken, updateGameBoardSize);

// GET /api/games/:id/timer - Lấy thời gian chơi cho game cụ thể
router.get('/:id/timer', getGameTimer);

// PUT /api/games/:id/update-timer - Cập nhật thời gian chơi cho game cụ thể
router.put('/:id/update-timer', verifyToken, updateGameTimer);

// POST /api/games/:id/play-record - Ghi lại lịch sử chơi game (yêu cầu authentication)
router.post('/:id/play-record', verifyToken, postGameRecord);

// GET /api/games/:id/records - Lấy lịch sử chơi game (yêu cầu authentication)
router.get('/:id/records', verifyToken, getGameRecords);

export default router;
