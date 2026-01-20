import express from "express";
import {
  getUserStats,
  updateUserStats,
  incrementLoginCount,
  incrementWinCount,
  incrementMatchCount,
  updateMaxScore,
  getAllUserStats,
} from "../controllers/userStatsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/user-stats:
 *   get:
 *     summary: Get current user's stats
 *     tags: [User Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.get("/", verifyToken, getUserStats);

/**
 * @swagger
 * /api/user-stats:
 *   put:
 *     summary: Update user stats
 *     tags: [User Stats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login_count:
 *                 type: integer
 *               win_count:
 *                 type: integer
 *               match_count:
 *                 type: integer
 *               max_score:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stats updated
 */
router.put("/", verifyToken, updateUserStats);

/**
 * @swagger
 * /api/user-stats/increment-login:
 *   post:
 *     summary: Increment login count
 *     tags: [User Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Login count incremented
 */
router.post("/increment-login", verifyToken, incrementLoginCount);

/**
 * @swagger
 * /api/user-stats/increment-win:
 *   post:
 *     summary: Increment win count
 *     tags: [User Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Win count incremented
 */
router.post("/increment-win", verifyToken, incrementWinCount);

/**
 * @swagger
 * /api/user-stats/increment-match:
 *   post:
 *     summary: Increment match count
 *     tags: [User Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Match count incremented
 */
router.post("/increment-match", verifyToken, incrementMatchCount);

/**
 * @swagger
 * /api/user-stats/update-max-score:
 *   post:
 *     summary: Update max score if higher
 *     tags: [User Stats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Max score updated
 */
router.post("/update-max-score", verifyToken, updateMaxScore);

/**
 * @swagger
 * /api/user-stats/leaderboard:
 *   get:
 *     summary: Get all user stats (leaderboard)
 *     tags: [User Stats]
 *     responses:
 *       200:
 *         description: User stats leaderboard
 */
router.get("/leaderboard", getAllUserStats);

export default router;
