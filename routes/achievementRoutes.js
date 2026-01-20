import express from "express";
import {
  getUserAchievements,
  checkAndUnlockAchievements,
  getAllAchievements,
} from "../controllers/achievementController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/achievements:
 *   get:
 *     summary: Get all available achievements
 *     tags: [Achievements]
 *     responses:
 *       200:
 *         description: List of all achievements
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
 */
router.get("/", getAllAchievements);

/**
 * @swagger
 * /api/achievements/user:
 *   get:
 *     summary: Get user's unlocked achievements
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's achievements
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
 */
router.get("/user", verifyToken, getUserAchievements);

/**
 * @swagger
 * /api/achievements/check:
 *   post:
 *     summary: Check and unlock achievements for current user
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievement check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 unlockedCount:
 *                   type: integer
 *                 data:
 *                   type: object
 */
router.post("/check", verifyToken, checkAndUnlockAchievements);

export default router;
