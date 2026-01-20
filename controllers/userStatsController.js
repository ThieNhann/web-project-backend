/**
 * User Stats Controller - Handle HTTP requests for user statistics
 */

import UserStatsModel from "../models/userStatsModel.js";
import AchievementService from "../services/achievementService.js";

// ===== GET USER STATS =====
export const getUserStats = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const stats = await UserStatsModel.getOrCreateUserStats(user_id);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user stats",
    });
  }
};

// ===== UPDATE USER STATS =====
export const updateUserStats = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { login_count, win_count, match_count, max_score } = req.body;

    const updates = {};
    if (login_count !== undefined) updates.login_count = login_count;
    if (win_count !== undefined) updates.win_count = win_count;
    if (match_count !== undefined) updates.match_count = match_count;
    if (max_score !== undefined) updates.max_score = max_score;

    const updatedStats = await UserStatsModel.updateUserStats(user_id, updates);

    return res.json({
      success: true,
      message: "User stats updated successfully",
      data: updatedStats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error updating user stats",
    });
  }
};

// ===== INCREMENT LOGIN COUNT =====
export const incrementLoginCount = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const stats = await UserStatsModel.incrementLoginCount(user_id);

    // Auto-check achievements after updating stats
    await AchievementService.checkAndUnlockAchievements(user_id);

    return res.json({
      success: true,
      message: "Login count incremented",
      data: stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error incrementing login count",
    });
  }
};

// ===== INCREMENT WIN COUNT =====
export const incrementWinCount = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const stats = await UserStatsModel.incrementWinCount(user_id);

    // Auto-check achievements after updating stats
    await AchievementService.checkAndUnlockAchievements(user_id);

    return res.json({
      success: true,
      message: "Win count incremented",
      data: stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error incrementing win count",
    });
  }
};

// ===== INCREMENT MATCH COUNT =====
export const incrementMatchCount = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const stats = await UserStatsModel.incrementMatchCount(user_id);

    // Auto-check achievements after updating stats
    await AchievementService.checkAndUnlockAchievements(user_id);

    return res.json({
      success: true,
      message: "Match count incremented",
      data: stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error incrementing match count",
    });
  }
};

// ===== UPDATE MAX SCORE =====
export const updateMaxScore = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { score } = req.body;

    if (score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Score is required",
      });
    }

    const stats = await UserStatsModel.updateMaxScore(user_id, score);

    // Auto-check achievements after updating stats
    await AchievementService.checkAndUnlockAchievements(user_id);

    return res.json({
      success: true,
      message: "Max score updated",
      data: stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error updating max score",
    });
  }
};

// ===== GET ALL USER STATS (LEADERBOARD) =====
export const getAllUserStats = async (req, res) => {
  try {
    const stats = await UserStatsModel.getAllUserStats();

    return res.json({
      success: true,
      count: stats.length,
      data: stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user stats",
    });
  }
};
