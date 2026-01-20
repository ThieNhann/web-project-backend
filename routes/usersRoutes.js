import express from "express";
import { validateRequest } from "../middleware/validateRequestMiddleware.js";

const router = express.Router();
import usersController from "../controllers/usersController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       400:
 *         description: Missing userId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/users/{userId}/achievements:
 *   get:
 *     summary: Get user achievements
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User achievements with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Achievements'
 */

/**
 * @swagger
 * /api/users/{userId}/rankings:
 *   get:
 *     summary: Get user rankings
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [only-me, friends, global]
 *       - in: query
 *         name: game
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User rankings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rankings'
 */

/**
 * @swagger
 * /api/users/{userId}/friend-status:
 *   get:
 *     summary: Get friend status with another user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendStatus'
 */

/**
 * @swagger
 * /api/users/{userId}/add-friend:
 *   post:
 *     summary: Send friend request
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Friend request sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/users/{userId}/remove-friend:
 *   post:
 *     summary: Remove friend
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/users/{userId}/direct-message:
 *   post:
 *     summary: Create or get direct message conversation
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation created or retrieved
 */
router.get("/:userId/achievements", validateRequest, usersController.getUsersAchievements);

// GET /api/users/:userId/rankings?type=${filter}&game=${game}
// filter: only-me, friends, global
// game: snake, caro-5, caro-4, tic-tac-toe, memory, match-3
router.get("/:userId/rankings", validateRequest, usersController.getUsersRankings);
router.get("/:userId/friend-status", verifyToken, usersController.getFriendStatus);
router.get("/:userId", usersController.getUserProfile);
router.post("/:userId/add-friend", validateRequest, verifyToken, usersController.addFriend);
router.post("/:userId/remove-friend", validateRequest, verifyToken, usersController.removeFriend);
router.post(
  "/:userId/direct-message",
  validateRequest,
  verifyToken,
  usersController.createOrGetDirectMessage,
);

export default router;
