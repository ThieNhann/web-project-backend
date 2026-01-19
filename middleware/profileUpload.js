import multer from "multer";
import path from "path";
import { uploadFile } from "../services/supabaseStorage.js";

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

// Configure multer for profile avatar with memory storage
const uploadProfileImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Middleware for profile avatar upload: accept single 'avatar' field
export function uploadProfileAvatar(req, res, next) {
  uploadProfileImage.single("avatar")(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    // If file is present, upload to Supabase
    if (req.file) {
      try {
        const { publicUrl, path: filePath } = await uploadFile(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );
        // Store file info in request for use in controller
        req.file.supabaseUrl = publicUrl;
        req.file.supabasePath = filePath;
      } catch (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return res.status(500).json({ message: "Failed to upload file to storage" });
      }
    }

    next();
  });
}

export default uploadProfileImage;
