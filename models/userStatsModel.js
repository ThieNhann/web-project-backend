/**
 * User Stats Model - Database operations for user_stats table
 */

import db from "../config/db.js";

class UserStatsModel {
  /**
   * Get user stats by user_id
   */
  static async getUserStats(userId) {
    return await db("user_stats").where("user_id", userId).first();
  }

  /**
   * Create initial user stats
   */
  static async createUserStats(userId) {
    const [stats] = await db("user_stats")
      .insert({
        user_id: userId,
        login_count: 0,
        win_count: 0,
        match_count: 0,
        max_score: 0,
      })
      .returning("*");

    return stats;
  }

  /**
   * Get or create user stats
   */
  static async getOrCreateUserStats(userId) {
    let stats = await this.getUserStats(userId);

    if (!stats) {
      stats = await this.createUserStats(userId);
    }

    return stats;
  }

  /**
   * Update user stats
   */
  static async updateUserStats(userId, updates) {
    const [updatedStats] = await db("user_stats")
      .where("user_id", userId)
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning("*");

    return updatedStats;
  }

  /**
   * Set specific user stat field
   */
  static async setUserStat(userId, field, value) {
    const stats = await this.getOrCreateUserStats(userId);

    const [updatedStats] = await db("user_stats")
      .where("user_id", userId)
      .update({
        [field]: value,
        updated_at: new Date(),
      })
      .returning("*");

    return updatedStats;
  }

  /**
   * Increment user stats field
   */
  static async incrementUserStat(userId, field, amount = 1) {
    const stats = await this.getOrCreateUserStats(userId);

    await db("user_stats").where("user_id", userId).increment(field, amount);

    return await this.getUserStats(userId);
  }

  /**
   * Increment login count
   */
  static async incrementLoginCount(userId) {
    return await this.incrementUserStat(userId, "login_count", 1);
  }

  /**
   * Increment win count
   */
  static async incrementWinCount(userId) {
    return await this.incrementUserStat(userId, "win_count", 1);
  }

  /**
   * Increment match count
   */
  static async incrementMatchCount(userId) {
    return await this.incrementUserStat(userId, "match_count", 1);
  }

  /**
   * Update max score if new score is higher
   */
  static async updateMaxScore(userId, score) {
    const stats = await this.getOrCreateUserStats(userId);

    if (score > stats.max_score) {
      return await this.setUserStat(userId, "max_score", score);
    }

    return stats;
  }

  /**
   * Get all user stats (for leaderboards)
   */
  static async getAllUserStats() {
    return await db("user_stats")
      .join("users", "user_stats.user_id", "users.id")
      .select(
        "user_stats.*",
        "users.username",
        "users.full_name",
        "users.avatar_url"
      )
      .orderBy("user_stats.max_score", "desc");
  }

  /**
   * Delete user stats
   */
  static async deleteUserStats(userId) {
    return await db("user_stats").where("user_id", userId).del();
  }
}

export default UserStatsModel;
