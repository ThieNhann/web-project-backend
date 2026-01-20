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

  async searchUsers(query, page = 1, limit = 10) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const offset = (page - 1) * limit;
    return await UserModel.searchUsers(query, limit, offset);
  },

  async getUserProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.is_active) {
      throw new Error("Account is disabled");
    }

    return {
      userId: user.id,
      username: user.username || null,
      fullName: user.full_name || null,
      email: user.email,
      bio: user.bio || null,
      avatarUrl: user.avatar_url ? process.env.SERVER_URL + user.avatar_url : null,
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

    const gameId = game ? await GameModel.getGameIdByCode(game) : null;
    if (!gameId && game) {
      throw new Error("Game not found");
    }

    // console.log(`Fetching rankings for user ${userId} with filter ${filter} and game ${game}`);

    // Logic for rankings based on filter
    const topPlayers = await UserModel.getTopPlayers(userId, filter, gameId, limit);
    console.log("Top players fetched for rankings:", topPlayers);
    return topPlayers;
  },

  async getUserOwnRanking(userId, filter = "global", game = null) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const gameId = game ? await GameModel.getGameIdByCode(game) : null;
    if (!gameId && game) {
      throw new Error("Game not found");
    }

    const ranking = await UserModel.getUserRanking(userId, filter, gameId);
    return ranking;
  },
};

export default UserService;
