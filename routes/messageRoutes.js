import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  getMessageContent,
  getMessageList,
  getMessageMeta,
  sendMessage,
  sendNewDirectMessage,
} from "../controllers/messageController.js";

const router = express.Router();

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Get user's message list (conversations)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */

/**
 * @swagger
 * /api/messages/{conversationId}:
 *   get:
 *     summary: Get messages from a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation messages
 */

/**
 * @swagger
 * /api/messages/{conversationId}/meta:
 *   get:
 *     summary: Get conversation metadata
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation metadata
 */

/**
 * @swagger
 * /api/messages/{conversationId}/send:
 *   post:
 *     summary: Send message to conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
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
 *               - message_text
 *             properties:
 *               message_text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */

/**
 * @swagger
 * /api/messages/new/{targetUserId}/send:
 *   post:
 *     summary: Send direct message to a user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_text
 *             properties:
 *               message_text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.get("/", verifyToken, getMessageList);
router.get("/:conversationId", verifyToken, getMessageContent);
router.get("/:conversationId/meta", verifyToken, getMessageMeta);
router.post("/:conversationId/send", verifyToken, sendMessage);
router.post("/new/:targetUserId/send", verifyToken, sendNewDirectMessage);

export default router;
