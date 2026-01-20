/**
 * Achievement Controller - Handle HTTP requests for achievements
 */

import AchievementService from "../services/achievementService.js";

// ===== GET USER ACHIEVEMENTS =====
export const getUserAchievements = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const achievements = await AchievementService.getUserAchievements(user_id);

    return res.json({
      success: true,
      count: achievements.length,
      data: achievements,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user achievements",
    });
  }
};

// ===== CHECK AND UNLOCK ACHIEVEMENTS =====
export const checkAndUnlockAchievements = async (req, res) => {
  try {
    const user_id = req.user.userId;

    const result = await AchievementService.checkAndUnlockAchievements(user_id);

    return res.json({
      success: true,
      message: "Achievement check completed",
      unlockedCount: result.unlockedAchievements.length,
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error checking achievements",
    });
  }
};

// ===== GET ALL ACHIEVEMENTS =====
export const getAllAchievements = async (req, res) => {
  try {
    const achievements = await AchievementService.getAllAchievements();

    return res.json({
      success: true,
      count: achievements.length,
      data: achievements,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching achievements",
    });
  }
};
