/**
 * Middleware kiểm tra API Key
 * Dùng cho các endpoint cần bảo vệ bằng API Key
 */

import "dotenv/config";

/**
 * Middleware xác thực API Key
 * Header yêu cầu: x-api-key: your_api_key
 */
const verifyApiKey = (req, res, next) => {
  const apiKey = req.header("x-api-key");
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    return res.status(500).json({
      success: false,
      message: "Server configuration error: API_KEY not set"
    });
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API Key is required. Add X-API-Key header."
    });
  }

  console.log("[DEBUG] Received API Key:", apiKey);
  console.log("[DEBUG] Valid API Key:", validApiKey);
  if (!validApiKey.split(",").includes(apiKey)) {
    return res.status(403).json({
      success: false,
      message: "Invalid API Key"
    });
  }

  next();
};

/**
 * Middleware kiểm tra API Key từ query parameter
 * Sử dụng khi cần linh hoạt hơn
 */
const verifyApiKeyQuery = (req, res, next) => {
  const apiKey = req.query.api_key || req.body.api_key;
  const validApiKey = process.env.API_KEY;

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      message: "Invalid or missing API Key"
    });
  }

  next();
};

/**
 * Middleware kiểm tra nhiều API Key (cho các dịch vụ khác nhau)
 */
const verifyMultipleApiKeys = (validKeys) => {
  return (req, res, next) => {
    const apiKey = req.header("x-api-key");

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "API Key is required"
      });
    }

    if (!validKeys.includes(apiKey)) {
      return res.status(403).json({
        success: false,
        message: "Invalid API Key"
      });
    }

    next();
  };
};

export { verifyApiKey, verifyApiKeyQuery, verifyMultipleApiKeys };
