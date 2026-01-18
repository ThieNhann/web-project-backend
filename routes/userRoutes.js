// const express = require("express");
// const router = express.Router();
// const { check, body } = require("express-validator");
// const { verifyToken } = require("../middleware/authMiddleware");
// const { validateRequest } = require("../middleware/validateRequestMiddleware");
// const userController = require("../controllers/userController");

import express from "express";
import {
  getUserProfile,
  addFriend,
  getFriendStatus,
  removeFriend,
  createOrGetDirectMessage,
} from "../controllers/userController.js";
import { validateRequest } from "../middleware/validateRequestMiddleware.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/:userId/friend-status", verifyToken, getFriendStatus);
router.get("/:userId", getUserProfile);
router.post("/:userId/add-friend", validateRequest, verifyToken, addFriend);
router.post("/:userId/remove-friend", validateRequest, verifyToken, removeFriend);
router.post("/:userId/direct-message", validateRequest, verifyToken, createOrGetDirectMessage);

export default router;
