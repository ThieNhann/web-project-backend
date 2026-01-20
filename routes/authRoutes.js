// const express = require("express");
// const router = express.Router();
// const { check, body } = require("express-validator");
// const authController = require("../controllers/authController");
// const { verifyToken } = require("../middleware/authMiddleware");
// const { validateRequest } = require("../middleware/validateRequestMiddleware");

import express from "express";
import { body } from "express-validator";
import {
  signin,
  getMe,
  updateProfile,
  signup,
  requestNewAccessToken,
  validateAccessToken,
  getUserInfo,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequestMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Server is running
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SigninResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Account is disabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/validate/refresh-token:
 *   post:
 *     summary: Get new access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SigninResponse'
 *       400:
 *         description: Missing or invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/validate/access-token:
 *   get:
 *     summary: Validate access token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenValidationResponse'
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/user-info:
 *   get:
 *     summary: Get current user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       401:
 *         description: Unauthorized
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

// LEGACY ROUTES
router.post(
  "/register",
  [
    body("username", "Username must not be empty.").not().isEmpty(),
    body("password", "Password must have at least 6 characters.").isLength({ min: 6 }),
  ],
  validateRequest,
  signup,
);
router.post("/login", signin);
router.get("/me", verifyToken, getMe);
router.put("/profile", verifyToken, updateProfile);

// NEW ROUTES
// GET /api/auth/health
router.get("/health", (req, res) => {
  return res.status(200).json({ message: "it works bro" });
});

// POST /api/auth/signup
router.post(
  "/signup",
  [
    body("firstName").optional().isString().isLength({ max: 100 }),
    body("lastName").optional().isString().isLength({ max: 100 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 8 }),
  ],
  validateRequest,
  signup,
);

// POST /api/auth/signin
router.post(
  "/signin",
  [
    body("email").isString().isLength({ min: 3 }).trim(),
    body("password").isString().isLength({ min: 6 }),
  ],
  validateRequest,
  signin,
);

router.post(
  "/admin/signin",
  [
    body("email").isString().isLength({ min: 3 }).trim(),
    body("password").isString().isLength({ min: 6 }),
  ],
  validateRequest,
  signin,
);

// // POST /api/auth/validate/2fa
// router.post(
//   "/validate/2fa",
//   [
//     // body('tempToken').isString().isLength({ min: 10 }),
//   ],
//   validateRequest,
//   authController.validate2FA
// );

// POST /api/auth/validate/refresh-token
router.post(
  "/validate/refresh-token",
  [body("refreshToken").optional().isString()],
  validateRequest,
  requestNewAccessToken,
);

// GET /api/auth/validate/access-token
router.get("/validate/access-token", validateAccessToken);
// GET /api/auth/user-info
router.get(
  "/user-info",
  [
    body("email").optional().isEmail().normalizeEmail(),
    body("password").optional().isString().isLength({ min: 8 }),
  ],
  verifyToken,
  validateRequest,
  getUserInfo,
);

export default router;
