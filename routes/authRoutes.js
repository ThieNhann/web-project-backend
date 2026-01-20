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
