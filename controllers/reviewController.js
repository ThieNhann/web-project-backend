/**
 * Review Controller - Handle HTTP requests for reviews
 */

import ReviewService from "../services/reviewService.js";

// Post review
export const postReview = async (req, res) => {
  try {
    const { game_id, rating, comment } = req.body;
    const userId = req.user.userId;

    const review = await ReviewService.createReview(userId, game_id, rating, comment);

    return res.status(201).json({
      success: true,
      message: "Review posted successfully",
      review_id: review.id,
    });
  } catch (error) {
    console.error("Error posting review:", error);
    const status = error.message.includes("already reviewed") ? 409 : 400;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all reviews for a game
export const getGameReviews = async (req, res) => {
  try {
    const { gameId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const reviews = await ReviewService.getGameReviews(gameId, limit, offset);

    return res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    const status = error.message === "Game not found" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await ReviewService.deleteReview(id, userId);

    return res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    const status = error.message.includes("not found") ? 404 : 
                   error.message.includes("not authorized") ? 403 : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's reviews
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 20;

    const reviews = await ReviewService.getUserReviews(userId, limit);

    return res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};