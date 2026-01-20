// const express = require("express");
// const router = express.Router();
// const { check, body } = require("express-validator");
// const authController = require("../controllers/authController");
// const { verifyToken } = require("../middleware/authMiddleware");
// const { validateRequest } = require("../middleware/validateRequestMiddleware");
// const friendController = require("../controllers/friendController");

import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequestMiddleware.js";
import {
  getFriendRequests,
  acceptFriendRequest,
  denyFriendRequest,
} from "../controllers/friendController.js";

const router = express.Router();

/**
 * @swagger
 * /api/friend-requests:
 *   get:
 *     summary: Get pending friend requests
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending friend requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendRequestsResponse'
 */

/**
 * @swagger
 * /api/friend-requests/accept/{requestUserId}:
 *   post:
 *     summary: Accept friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request accepted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Friend request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/friend-requests/deny/{requestUserId}:
 *   post:
 *     summary: Deny friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend request denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Friend request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get("/", validateRequest, verifyToken, getFriendRequests);
router.post("/accept/:requestUserId", validateRequest, verifyToken, acceptFriendRequest);
router.post("/deny/:requestUserId", validateRequest, verifyToken, denyFriendRequest);

export default router;
