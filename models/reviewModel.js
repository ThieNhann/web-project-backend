/**
 * Review Model - Data Access Layer for Reviews
 */

import db from "../config/db.js";

export const ReviewModel = {
  // ===== CREATE =====
  async createReview(userId, gameId, rating, comment) {
    const [result] = await db("reviews")
      .insert({
        user_id: userId,
        game_id: gameId,
        rating,
        comment,
        created_at: new Date(),
      })
      .returning("id");
    const reviewId = typeof result === 'object' ? result.id : result;
    return this.getReviewById(reviewId);
  },

  // ===== READ =====
  async getReviewById(id) {
    return await db("reviews").where({ id }).first();
  },

  async getGameReviews(gameId, limit = 20, offset = 0) {
    return await db("reviews")
      .where({ game_id: gameId })
      .join("users", "reviews.user_id", "users.id")
      .select(
        "reviews.*",
        "users.username",
        "users.avatar_url"
      )
      .orderBy("reviews.created_at", "desc")
      .limit(limit)
      .offset(offset);
  },

  async getUserReviews(userId, limit = 20) {
    return await db("reviews")
      .where({ user_id: userId })
      .join("games", "reviews.game_id", "games.id")
      .select(
        "reviews.*",
        "games.name as game_name",
        "games.code as game_code"
      )
      .orderBy("reviews.created_at", "desc")
      .limit(limit);
  },

  async getUserGameReview(userId, gameId) {
    return await db("reviews")
      .where({ user_id: userId, game_id: gameId })
      .first();
  },

  async getGameRating(gameId) {
    const result = await db("reviews")
      .where({ game_id: gameId })
      .select(
        db.raw("AVG(rating) as avg_rating"),
        db.raw("COUNT(*) as review_count")
      )
      .first();
    return {
      avgRating: result?.avg_rating || 0,
      reviewCount: result?.review_count || 0,
    };
  },

  // ===== UPDATE =====
  async updateReview(id, rating, comment) {
    await db("reviews").where({ id }).update({
      rating,
      comment,
      updated_at: new Date(),
    });
    return this.getReviewById(id);
  },

  // ===== DELETE =====
  async deleteReview(id) {
    return await db("reviews").where({ id }).del();
  },
};

export default ReviewModel;
