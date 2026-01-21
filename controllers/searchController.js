/**
 * Search Controller - Handle HTTP requests for search operations
 */

import UserService from "../services/userService.js";

export async function searchUser(req, res) {
  try {
    const searchQuery = req.query.query?.trim() || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const results = await UserService.searchUsers(searchQuery, page, limit);

    return res.json({
      searchResults: results.map((user) => ({
        userId: user.id,
        username: user.username,
        fullName: user.full_name,
        bio: user.bio,
        avatarUrl: user.avatar_url ? process.env.SERVER_URL + user.avatar_url : null,
      })),
    });
  } catch (error) {
    console.error("Error in searchUser:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
