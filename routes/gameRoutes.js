// const express = require('express');
// const router = express.Router();
// const gameController = require('../controllers/gameController');

import express from "express";
import { getGames, saveGame, loadGame } from "../controllers/gameController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/games - Lấy danh sách game
router.get("/", getGames);

// POST /api/games/save - Lưu game (yêu cầu authentication)
router.post("/save", verifyToken, saveGame);

// GET /api/games/load - Tải game đã lưu (yêu cầu authentication)
router.get("/load", verifyToken, loadGame);

export default router;
