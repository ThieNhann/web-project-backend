import db from "../config/db.js";
import "dotenv/config";

export async function searchUser(req, res) {
  // console.log("[DEBUG] searchUser called");
  try {
    const searchQuery = req.query.query?.trim() || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    const results = await db("users")
      .select("id", "username", "full_name", "bio", "avatar_url")
      .where("username", "like", `%${searchQuery}%`)
      .where("is_active", true)
      .limit(limit)
      .offset(offset);

    // console.log("[DEBUG] Search results:", results);

    res.json({
      searchResults: results.map((user) => ({
        userId: user.id,
        username: user.username,
        fullName: user.full_name,
        bio: user.bio,
        avatarUrl: process.env.SERVER_URL + user.avatar_url,
      })),
    });
  } catch (error) {
    console.error("Error in searchUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
