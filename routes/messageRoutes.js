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
router.get("/", verifyToken, getMessageList);
router.get("/:conversationId", verifyToken, getMessageContent);
router.get("/:conversationId/meta", verifyToken, getMessageMeta);
router.post("/:conversationId/send", verifyToken, sendMessage);
router.post("/new/:targetUserId/send", verifyToken, sendNewDirectMessage);

export default router;
