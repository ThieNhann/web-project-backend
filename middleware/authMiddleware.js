// const jwt = require("jsonwebtoken");
// require("dotenv").config();

import jwt from "jsonwebtoken";
import "dotenv/config";

/**
    Xác thực người dùng
    Chặn request ko hợp lệ và bơm thông tin cho controller
    _Yêu cầu:
    Header: Authorization: Bearer <token>
    env: JWT_SECRET
 */
const verifyToken = (req, res, next) => {
  // lấy token từ header "Authorization: Bearer <token>"
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];
  // console.log("[DEBUG] verifyToken called, token:", token);

  if (!token) {
    return res.status(401).json({ success: false, message: "Token not found." });
  }

  try {
    // decode + verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // mount thông tin user vào req
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token not valid or expired." });
  }
};

export function apiKeyAuth(req, res, next) {
  const VALID_KEYS = process.env.API_KEY.split(",");
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res.status(401).json({ message: "API key missing" });
  }

  if (!VALID_KEYS.includes(apiKey)) {
    return res.status(403).json({ message: "Invalid API key" });
  }

  next();
}

export { verifyToken };
