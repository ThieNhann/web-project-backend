import db from "../config/db.js";
import { deleteFile } from "../services/supabaseStorage.js";
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
      // Use Supabase URL directly instead of local path
      const avatarUrl = req.file.supabaseUrl;
      data.avatar_url = avatarUrl;
      
      // Store the Supabase path for future deletion if needed
      data.avatar_url = req.file.supabasePath;
      // console.log("[DEBUG] New avatar uploaded from Supabase:", avatarUrl);
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
        userId: updated[0].id,
        username: updated[0].username,
        fullName: updated[0].full_name,
        bio: updated[0].bio,
        avatarUrl: updated[0].avatar_url || null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
