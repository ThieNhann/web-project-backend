/**
 * Profile Controller - Handle HTTP requests for user profile operations
 */

import AuthService from "../services/authService.js";
import { deleteFile } from "../services/supabaseStorage.js";

export async function editProfile(req, res) {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not authenticated",
      });
    }

    const { fullName, bio } = req.body;
    const profileData = {};

    if (fullName !== undefined && fullName !== null && fullName.trim() !== "") {
      profileData.fullName = fullName.trim();
    }

    if (bio !== undefined && bio !== null && bio.trim() !== "") {
      profileData.bio = bio.trim();
    }

    // Handle avatar file upload
    if (req.file) {
      profileData.avatarUrl = req.file.supabasePath;
    }

    if (Object.keys(profileData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes provided",
      });
    }

    const updated = await AuthService.updateProfile(userId, profileData);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
