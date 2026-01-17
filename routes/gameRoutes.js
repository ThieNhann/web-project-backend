// const express = require('express');
// const router = express.Router();
// const gameController = require('../controllers/gameController');

import express from "express";
import { getGames } from "../controllers/gameController.js";

const router = express.Router();

// GET /api/games
router.get("/", getGames);

export default router;
