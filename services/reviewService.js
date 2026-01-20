/**
 * Review Service - Business Logic for Reviews
 */

import ReviewModel from "../models/reviewModel.js";
import UserModel from "../models/userModel.js";
import GameModel from "../models/gameModel.js";

export const ReviewService = {
  async createReview(userId, gameId, rating, comment) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    if (!rating || rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user already reviewed this game
    const existingReview = await ReviewModel.getUserGameReview(userId, gameId);
    if (existingReview) {
      throw new Error("You have already reviewed this game");
    }

    return await ReviewModel.createReview(userId, gameId, rating, comment || "");
  },

  async updateReview(reviewId, userId, rating, comment) {
    const review = await ReviewModel.getReviewById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (review.user_id !== userId) {
      throw new Error("Not authorized to update this review");
    }

    if (!rating || rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    return await ReviewModel.updateReview(reviewId, rating, comment || "");
  },

  async deleteReview(reviewId, userId) {
    const review = await ReviewModel.getReviewById(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    if (review.user_id !== userId) {
      throw new Error("Not authorized to delete this review");
    }

    await ReviewModel.deleteReview(reviewId);
    return true;
  },

  async getGameReviews(gameId, limit = 20, offset = 0) {
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    return await ReviewModel.getGameReviews(gameId, limit, offset);
  },

  async getUserReviews(userId, limit = 20) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return await ReviewModel.getUserReviews(userId, limit);
  },

  async getGameRating(gameId) {
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    return await ReviewModel.getGameRating(gameId);
  },
};

export default ReviewService;
