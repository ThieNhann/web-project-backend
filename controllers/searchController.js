/**
 * Search Controller - Handle HTTP requests for search operations
 */

import UserService from "../services/userService.js";

export async function searchUser(req, res) {
  try {
    const searchQuery = req.query.query?.trim() || "";

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const results = await UserService.searchUsers(searchQuery);

    return res.json({
      success: true,
      searchResults: results.map((user) => ({
        userId: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
      })),
    });
  } catch (error) {
    console.error("Error in searchUser:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
