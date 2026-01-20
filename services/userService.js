/**
 * User Service - Business Logic for Users
 */

import UserModel from "../models/userModel.js";
import GameModel from "../models/gameModel.js";

export const UserService = {
  async getAllUsers(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const users = await UserModel.findAll(limit, offset);
    const total = await UserModel.getTotalUsers();

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async searchUsers(query, limit = 20) {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query is required");
    }
    return await UserModel.searchUsers(query, limit);
  },

  async getUserProfile(userId) {
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
      lastLogin: user.last_login,
    };
  },

  async getUserGameHistory(userId, gameId = null, limit = 10) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return await UserModel.getGameHistory(userId, gameId, limit);
  },

  async getUserTopScores(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return await UserModel.getWithGameRecords(userId);
  },

  // ===== USER MANAGEMENT (ADMIN) =====
  async activateUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await UserModel.activateUser(userId);
    return await UserModel.findById(userId);
  },

  async deactivateUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await UserModel.deactivateUser(userId);
    return await UserModel.findById(userId);
  },

  // ===== STATISTICS =====
  async get24HourActivePlayers() {
    return await UserModel.get24HourActivePlayers();
  },

  async getActiveUsers(hours = 24) {
    const count = await UserModel.getActiveUsers(hours);
    return count;
  },

  async getTopPlayers(limit = 10) {
    return await UserModel.getTopPlayers(limit);
  },

  async getUserRankings(userId, filter = "global", game = null, limit = 100) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Logic for rankings based on filter
    const topPlayers = await UserModel.getTopPlayers(limit);
    return topPlayers;
  },
};

export default UserService;
