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

router.get("/", validateRequest, verifyToken, getFriendRequests);
router.post("/accept/:requestUserId", validateRequest, verifyToken, acceptFriendRequest);
router.post("/deny/:requestUserId", validateRequest, verifyToken, denyFriendRequest);

export default router;
