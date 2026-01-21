/**
 * Users Controller - Handle HTTP requests for user operations
 */

import db from "../config/db.js";
import UserService from "../services/userService.js";
import FriendService from "../services/friendService.js";
import "dotenv/config";

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

const getUserFriendships = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const friendships = await UserService.getUserFriendships(userId, limit, offset);

    return res.status(200).json({
      data: friendships.map((friend) => ({
        userId: friend.id,
        username: friend.username || null,
        fullName: friend.full_name || null,
        avatarUrl: friend.avatar_url ? process.env.SERVER_URL + friend.avatar_url : null,
      })),
      hasMore: friendships.length === limit,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user friendships",
    });
  }
};

// ===== USER RANKINGS =====
const getUsersRankings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const filter = req.query.type || "global";
    const game = req.query.game;

    const rankings = await UserService.getUserRankings(userId, filter, game);
    console.log("User rankings fetched:", rankings);

    let userRankingIndex = rankings.findIndex((r) => r.id === parseInt(userId));
    console.log("User ranking index:", userRankingIndex);

    let userRanking = {};

    if (userRankingIndex === -1) {
      userRanking = await UserService.getUserOwnRanking(userId, filter, game, 1);
      console.log("Separate user ranking fetched:", userRanking);
    }

    return res.json({
      rankings: rankings.map((r, index) => ({
        rank: index + 1,
        userId: r.id,
        username: r.username,
        fullName: r.full_name,
        avatarUrl: r.avatar_url ? process.env.SERVER_URL + r.avatar_url : null,
        score: r.total_score,
      })),
      userOwnRanking: {
        rank: userRankingIndex !== -1 ? userRankingIndex + 1 : null,
        score:
          userRankingIndex !== -1
            ? rankings[userRankingIndex]?.total_score || 0
            : userRanking
              ? userRanking.total_score
              : 0,
      },
    });
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

    // Get paginated achievements
    const achievements = await db("user_achievements")
      .join("achievements", "user_achievements.achievement_id", "=", "achievements.id")
      .where("user_achievements.user_id", userId)
      .select(
        "achievements.name as title",
        "achievements.icon_url as iconUrl",
        "achievements.description",
        "user_achievements.unlocked_at as dateAchieved",
      )
      .orderBy("user_achievements.unlocked_at", "desc")
      .limit(limit)
      .offset(offset);

    // Get total count of user achievements
    const totalCount = await db("user_achievements")
      .join("achievements", "user_achievements.achievement_id", "=", "achievements.id")
      .where("user_achievements.user_id", userId)
      .count("* as count")
      .first();

    const totalAchievements = totalCount?.count || 0;

    // Check if there are more achievements
    const hasMore = offset + limit < totalAchievements;

    return res.json({
      achievements,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return res.status(500).json({ error: "Failed to fetch achievements" });
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
      return res.status(400).json({ message: "Missing userId" });
    }

    if (requesterId === userId) {
      return res.status(400).json({ message: "Cannot create direct message with yourself" });
    }

    const targetUser = await db("users").where({ id: userId }).first();
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!targetUser.is_active) {
      return res.status(403).json({ message: "Target user's account is disabled" });
    }

    let existingConversation = await db("conversations")
      .join("conversation_members", "conversations.id", "conversation_members.conversation_id")
      .whereIn("conversation_members.user_id", [requesterId, userId])
      .groupBy("conversations.id")
      .havingRaw("COUNT(DISTINCT conversation_members.user_id) = 2")
      .select("conversations.id")
      .first();

    if (existingConversation) {
      return res.status(200).json({
        hasConversation: true,
        conversationId: existingConversation.id,
      });
    }

    return res.status(200).json({ hasConversation: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  getUsersAchievements,
  getUsersRankings,
  getFriendStatus,
  getUserProfile,
  getUserFriendships,
  addFriend,
  removeFriend,
  createOrGetDirectMessage,
};
