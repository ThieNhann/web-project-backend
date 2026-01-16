const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken, verifyToken } = require('../utils/jwt');
const { sendMail } = require('../services/mailer');
const crypto = require('crypto');

// ĐĂNG KÝ
const signup = async (req, res) => {
  const { username, full_name , email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Missing required fields" });

  try {
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) return res.status(409).json({ message: "Username or email already taken" });

    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    await db('users').insert({
      id: userId,
      email,
      password: passwordHash,
      username,
      full_name: full_name || null,
    });

    return res.status(201).json({ user: { userId, email, username, full_name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ĐĂNG NHẬP
const signin = async (req, res) => {
  console.log("Signin endpoint hit");
  const { email, password } = req.body;
  try {
    // Check if user exists
    const user = await db('users')
      .where({ email })
      .select('id', 'username', 'display_name', 'email', 'password', 'is_active')
      .first();

    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.is_active) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    await db('users')
      .where({ id: user.id })
      .update({ last_login: new Date() });

    const userId = user.id;

    // Generate code and twoFactorToken
    // Insert code and twoFactorToken into database with expiration
    // const code = Math.floor(100000 + Math.random() * 899999).toString();
    // const twoFactorToken = signToken({ userId });

    // Check if a 2FA code already exists for this user
    // const existing2fa = await db('two_factor_auth').where({ user_id: userId }).first();
    // console.log("Existing 2FA record:", existing2fa);
    // if (existing2fa) {
    //   if (existing2fa.expires_at && new Date(existing2fa.expires_at) < new Date()) {
    //     await db('two_factor_auth').where({ user_id: userId }).delete();
    //   } else {
    //     return res.status(200).json({
    //       status: "require2FA",
    //       message: "2FA code already sent. Please check your email.",
    //     });
    //   }
    // }

    // Send email with code
    // await sendMail(user.email, code);
    // await db('two_factor_auth').insert({
    //   user_id: userId,
    //   code,
    //   two_factor_token: twoFactorToken,
    //   expires_at: new Date(Date.now() + Number(process.env.TWO_FA_EXPIRES_IN) || 15 * 60 * 1000),
    // });

    const accessToken = signToken({ userId }, "1m");
    const refreshToken = signToken({ userId, type: "refresh" }, "7d");

    return res.status(200).json({
      status: "require2FA",
      message: "2FA code sent to email",
      accessToken: accessToken,
      refreshToken: refreshToken,
      // twoFactorToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// VALIDATE 2FA
const validate2FA = async (req, res) => {
  const twoFactorToken = req.headers["authorization"]?.split(" ")[1];
  const code = req.body.code;

  console.log("2FA validation endpoint hit");
  console.log("Received twoFactorToken:", twoFactorToken);
  console.log("Received code:", code);

  try {
    // Find 2FA record and include user
    const record = await db('two_factor_auth')
      .where({ code })
      .first();
    
    if (!record) return res.status(401).json({ message: "Invalid 2fa code" });

    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      await db('two_factor_auth').where({ user_id: record.user_id }).delete();
      return res.status(401).json({ message: "2FA code expired" });
    }

    const user = await db('users').where({ id: record.user_id }).first();
    if (!user || !user.is_active) return res.status(403).json({ message: "Account is disabled" });

    const userId = user.id;
    const accessToken = signToken({ userId, username: user.username }, "1m");
    const refreshToken = signToken({ userId, type: "refresh" }, "7d");

    // Delete used 2FA record
    await db('two_factor_auth').where({ user_id: record.user_id }).delete();

    return res.status(200).json({
      message: "2FA validation successful",
      user: {
        userId: user.id,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET USER INFO
const getUserInfo = async (req, res) => {
  const userId = req.user.userId || req.params?.userId || req.query?.userId || req.body?.userId;

  try {
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const user = await db('users')
      .where({ id: userId })
      .select('id', 'username', 'display_name', 'email', 'is_active', 'bio', 'profile_image_url', 'is_verified')
      .first();

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.is_active) return res.status(403).json({ message: "Account is disabled" });

    const userInfo = {
      userId: user.id,
      username: user.username || null,
      displayName: user.display_name || null,
      email: user.email,
      bio: user.bio || null,
      profileImageUrl: user.profile_image_url
        ? process.env.SERVER_URL + user.profile_image_url
        : null,
      isVerified: user.is_verified || false,
    };
    return res.status(200).json(userInfo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// REQUEST NEW ACCESS TOKEN
const requestNewAccessToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.headers["authorization"]?.split(" ")[1];
    if (!refreshToken) return res.status(400).json({ message: "Missing refresh token" });

    let payload;
    try {
      payload = verifyToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    if (payload.type && payload.type !== "refresh") {
      return res.status(400).json({ message: "Provided token is not a refresh token" });
    }

    const userId = payload.userId || payload.user_id;
    if (!userId) return res.status(400).json({ message: "Invalid token payload" });

    // Gen new accessToken
    const accessToken = signToken({ userId, username: payload.username }, "1m");

    return res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// VALIDATE ACCESS TOKEN
const validateAccessToken = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Missing access token" });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired access token" });
    }

    if (payload.type && payload.type === "refresh") {
      return res.status(400).json({ message: "Provided token is not an access token" });
    }

    const userId = payload.userId || payload.user_id;

    return res.status(200).json({
      message: "Access token is valid",
      user: {
        userId,
        username: payload.username || null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET ME
const getMe = async (req, res) => {
  try {
    // req.user.id được authMiddleware gắn lên req
    const user = await db('users').where({ id: req.user.id }).first();
    
    if (!user) return res.status(404).json({ message: 'Non-existent user.' });

    // Loại bỏ password!!!
    const { password, ...userInfo } = user;
    res.json({ success: true, user: userInfo });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  const { full_name, bio, avatar_url } = req.body;
  try {
    const [updatedUser] = await db('users')
      .where({ id: req.user.id })
      .update({ full_name, bio, avatar_url, updated_at: new Date() })
      .returning(['id', 'username', 'full_name', 'bio', 'avatar_url']);

    res.json({ success: true, message: 'Updated successfully.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
};

module.exports = { 
  signup, 
  signin, 
  validate2FA, 
  getUserInfo, 
  requestNewAccessToken, 
  validateAccessToken,
  getMe, 
  updateProfile 
};