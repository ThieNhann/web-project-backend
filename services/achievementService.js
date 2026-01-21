/**
 * Achievement Service - Handle achievement business logic
 */

import db from "../config/db.js";
import UserStatsModel from "../models/userStatsModel.js";

class AchievementService {
  /**
   * Get all achievements for a specific user
   */
  static async getUserAchievements(userId) {
    const achievements = await db("user_achievements")
      .join("achievements", "user_achievements.achievement_id", "achievements.id")
      .where("user_achievements.user_id", userId)
      .select(
        "achievements.id",
        "achievements.name",
        "achievements.description",
        "achievements.icon_url",
        "achievements.condition_type",
        "achievements.condition_value",
        "user_achievements.unlocked_at",
      )
      .orderBy("user_achievements.unlocked_at", "desc");

    return achievements;
  }

  /**
   * Get all available achievements
   */
  static async getAllAchievements() {
    const achievements = await db("achievements").select("*").orderBy("id", "asc");

    return achievements;
  }

  /**
   * Get user stats
   */
  static async getUserStats(userId) {
    return await UserStatsModel.getOrCreateUserStats(userId);
  }

  /**
   * Check if achievement condition is met
   */
  static checkCondition(stats, conditionType, conditionValue) {
    if (!conditionType || !conditionValue) return false;

    try {
      const value = conditionValue;

      switch (conditionType) {
        case "login_count":
          return stats.login_count >= value.threshold;

        case "win_count":
          return stats.win_count >= value.threshold;

        case "match_count":
          return stats.match_count >= value.threshold;

        case "max_score":
          return stats.max_score >= value.threshold;

        default:
          return false;
      }
    } catch (error) {
      console.error("Error checking condition:", error);
      return false;
    }
  }

  /**
   * Check and unlock achievements for a user
   */
  static async checkAndUnlockAchievements(userId) {
    const stats = await this.getUserStats(userId);
    const allAchievements = await this.getAllAchievements();
    const userAchievements = await this.getUserAchievements(userId);

    const unlockedAchievementIds = new Set(userAchievements.map((a) => a.id));

    const newlyUnlocked = [];

    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (unlockedAchievementIds.has(achievement.id)) {
        continue;
      }

      // Check if condition is met
      const conditionMet = this.checkCondition(
        stats,
        achievement.condition_type,
        achievement.condition_value,
      );

      if (conditionMet) {
        // Unlock achievement
        await db("user_achievements").insert({
          user_id: userId,
          achievement_id: achievement.id,
          unlocked_at: new Date(),
        });

        newlyUnlocked.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          icon_url: achievement.icon_url,
        });
      }
    }

    return {
      unlockedAchievements: newlyUnlocked,
      totalAchievements: allAchievements.length,
      userAchievements: userAchievements.length + newlyUnlocked.length,
    };
  }

  /**
   * Update user stats (to be called when relevant events occur)
   */
  static async updateUserStats(userId, updates) {
    // If score is provided, handle max_score update
    if (updates.score !== undefined) {
      const stats = await this.getUserStats(userId);
      if (updates.score > stats.max_score) {
        updates.max_score = updates.score;
      }
      delete updates.score;
    }

    return await UserStatsModel.updateUserStats(userId, updates);
  }

  /**
   * Increment user stats
   */
  static async incrementUserStats(userId, field) {
    return await UserStatsModel.incrementUserStat(userId, field, 1);
  }
}

export default AchievementService;
