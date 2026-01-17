import { Router } from "express";
import cors from "cors";
import path from "path";
import { editProfile } from "../controllers/profileController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { uploadProfileAvatar } from "../middleware/profileUpload.js";

const router = Router();
router.post("/edit", verifyToken, uploadProfileAvatar, editProfile);

// Serve profile images
router.get("/files/:filename", cors(), (req, res) => {
  const filename = req.params.filename;
  const filePath = path.resolve("uploads", filename);

  return res.sendFile(filePath);
});

export default router;
