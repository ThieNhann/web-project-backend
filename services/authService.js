/**
 * Auth Service - Business Logic for Authentication
 */

import UserModel from "../models/userModel.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import crypto from "crypto";

export const AuthService = {
  async signup(email, password, username, fullName) {
    // Validate input
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    // Hash password
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    // Create user
    const newUser = await UserModel.create({
      id: userId,
      email,
      password: passwordHash,
      username,
      full_name: fullName || null,
    });

    return {
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      fullName: newUser.full_name,
    };
  },

  async signin(email, password) {
    // Validate input
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if account is active
    if (!user.is_active) {
      throw new Error("Account is disabled");
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    // Update last login
    await UserModel.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = signToken({ userId: user.id }, "15m");
    const refreshToken = signToken({ userId: user.id, type: "refresh" }, "7d");

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        userId: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
      },
    };
  },

  async getUserInfo(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      isActive: user.is_active,
    };
  },

  async updateProfile(userId, profileData) {
    const { fullName, bio, avatarUrl } = profileData;

    const updated = await UserModel.updateProfile(userId, {
      full_name: fullName,
      bio,
      avatar_url: avatarUrl,
    });

    return {
      userId: updated.id,
      username: updated.username,
      fullName: updated.full_name,
      bio: updated.bio,
      avatarUrl: updated.avatar_url,
    };
  },
};

export default AuthService;
