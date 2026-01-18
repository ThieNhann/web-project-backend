import express from "express";
import { validateRequest } from "../middleware/validateRequestMiddleware.js";

const router = express.Router();
import usersController from "../controllers/usersController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

// GET /api/users/:userId/achievements?page={page}
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
