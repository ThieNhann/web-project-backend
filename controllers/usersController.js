/**
 * Users Controller - Handle HTTP requests for user operations
 */

import UserService from "../services/userService.js";
import FriendService from "../services/friendService.js";

// ===== USER PROFILE =====
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const userInfo = await UserService.getUserProfile(userId);

    return res.status(200).json(userInfo);
  } catch (err) {
    console.error(err);
    const status = err.message === "User not found" ? 404 : 500;
    return res.status(status).json({ message: err.message });
  }
};

// ===== USER RANKINGS =====
const getUsersRankings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const filter = req.query.type || "global";
    const game = req.query.game;

    const rankings = await UserService.getUserRankings(userId, filter, game);

    return res.json({ rankings });
  } catch (error) {
    console.error("Error fetching user rankings:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ===== USER ACHIEVEMENTS =====
const getUsersAchievements = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // TODO: Implement achievement fetching when achievement table is available
    return res.json({
      achievements: [],
      hasMore: false,
    });
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ===== FRIEND OPERATIONS =====
const getFriendStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    if (!requesterId) {
      return res.status(200).json({ friendStatus: "not_friends" });
    }

    if (requesterId === userId) {
      return res.status(400).json({ message: "Cannot get friend status with yourself" });
    }

    const status = await FriendService.checkFriendStatus(requesterId, userId);

    return res.status(200).json({
      friendStatus: status.status || "not_friends",
    });
  } catch (err) {
    console.error(err);
    const httpStatus = err.message === "User not found" ? 404 : 500;
    return res.status(httpStatus).json({ message: err.message });
  }
};

const addFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId",
      });
    }

    await FriendService.sendFriendRequest(requesterId, userId);

    return res.status(201).json({
      success: true,
      message: "Friend request sent",
    });
  } catch (err) {
    console.error(err);
    const status = err.message.includes("already") ? 409 : 400;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

const removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId",
      });
    }

    await FriendService.removeFriend(requesterId, userId);

    return res.status(200).json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (err) {
    console.error(err);
    const status = err.message === "Not friends" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

// ===== DIRECT MESSAGES =====
const createOrGetDirectMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterId = req.user.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId",
      });
    }

    if (requesterId === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot create direct message with yourself",
      });
    }

    // TODO: Implement conversation creation/retrieval
    // This requires a conversations table setup

    return res.status(200).json({
      success: true,
      hasConversation: false,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export default {
  getUsersAchievements,
  getUsersRankings,
  getFriendStatus,
  getUserProfile,
  addFriend,
  removeFriend,
  createOrGetDirectMessage,
};
