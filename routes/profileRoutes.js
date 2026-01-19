import { Router } from "express";
import { editProfile } from "../controllers/profileController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadProfileAvatar } from "../middleware/profileUpload.js";

const router = Router();
router.post("/edit", verifyToken, uploadProfileAvatar, editProfile);

// Note: File serving is now handled by Supabase Storage directly
// No need for local file serving route

export default router;
