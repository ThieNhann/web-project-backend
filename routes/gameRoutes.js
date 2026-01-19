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

// GET /api/games - Lấy danh sách game
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
