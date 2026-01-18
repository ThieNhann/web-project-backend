import db from "../config/db.js";
import "dotenv/config";

export async function editProfile(req, res) {
  // console.log("[DEBUG] editProfile called");
  try {
    const userId = req.user.userId;
    // console.log("[DEBUG] Authenticated userId:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user not authenticated" });
    }

    const { fullName, bio } = req.body;
    const data = {};

    if (fullName !== undefined && fullName !== null && fullName.trim() !== "") {
      data.full_name = fullName.trim();
    }
    if (bio !== undefined && bio !== null && bio.trim() !== "") {
      data.bio = bio.trim();
    }

    // Handle avatar file upload
    if (req.file) {
      const avatarUrl = `/api/profile/files/${req.file.filename}`;
      // console.log("[DEBUG] New avatar uploaded:", avatarUrl);
      data.avatar_url = avatarUrl;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No changes provided" });
    }

    // console.log("[DEBUG] Updating user profile with data:", data);

    const updated = await db("users")
      .where({ id: userId })
      .update(data)
      .returning(["id", "username", "full_name", "bio", "avatar_url"]);

    return res.status(200).json({
      profile: {
        userId: updated.id,
        username: updated.username,
        fullName: updated.full_name,
        bio: updated.bio,
        avatarUrl: updated.avatar_url ? process.env.SERVER_URL + updated.avatar_url : null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
