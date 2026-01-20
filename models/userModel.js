/**
 * User Model - Data Access Layer for Users
 * Quản lý tất cả database queries liên quan đến users
 */

import db from "../config/db.js";

export const UserModel = {
  // ===== CREATE =====
  async create(userData) {
    const [id] = await db("users").insert(userData).returning("id");
    return this.findById(id);
  },

  // ===== READ =====
  async findById(id) {
    return await db("users").where({ id }).first();
  },

  async findByEmail(email) {
    return await db("users").where({ email }).first();
  },

  async findByUsername(username) {
    return await db("users").where({ username }).first();
  },

  async findAll(limit = 50, offset = 0) {
    return await db("users")
      .select("id", "username", "full_name", "email", "role", "avatar_url", "is_active", "last_login", "created_at")
      .limit(limit)
      .offset(offset)
      .orderBy("created_at", "desc");
  },

  async searchUsers(query, limit = 20) {
    return await db("users")
      .where("username", "ilike", `%${query}%`)
      .orWhere("email", "ilike", `%${query}%`)
      .orWhere("full_name", "ilike", `%${query}%`)
      .select("id", "username", "full_name", "email", "avatar_url", "role")
      .limit(limit);
  },

  // ===== UPDATE =====
  async updateById(id, data) {
    await db("users").where({ id }).update(data);
    return this.findById(id);
  },

  async updateLastLogin(id) {
    return await db("users")
      .where({ id })
      .update({ last_login: new Date() });
  },

  async updateProfile(id, profileData) {
    await db("users").where({ id }).update(profileData);
    return this.findById(id);
  },

  async activateUser(id) {
    return await db("users").where({ id }).update({ is_active: true });
  },

  async deactivateUser(id) {
    return await db("users").where({ id }).update({ is_active: false });
  },

  // ===== DELETE =====
  async deleteById(id) {
    return await db("users").where({ id }).del();
  },

  // ===== STATISTICS =====
  async getTotalUsers() {
    const result = await db("users").count("id as count").first();
    return result?.count || 0;
  },

  async getActiveUsers(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db("users")
      .where("last_login", ">", since)
      .count("id as count")
      .first();
  },

  async get24HourActivePlayers() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const users = await db("game_records")
      .where("created_at", ">", since)
      .distinct("user_id")
      .count("* as count")
      .first();
    return users?.count || 0;
  },

  // ===== RELATIONSHIPS =====
  async getWithGameRecords(userId, limit = 10) {
    return await db("game_records")
      .where({ user_id: userId })
      .join("games", "game_records.game_id", "games.id")
      .select("game_records.*", "games.name as game_name", "games.code as game_code")
      .orderBy("game_records.created_at", "desc")
      .limit(limit);
  },

  async getGameHistory(userId, gameId = null, limit = 10) {
    let query = db("game_records").where({ user_id: userId });
    
    if (gameId) {
      query = query.where({ game_id: gameId });
    }
    
    return await query
      .orderBy("created_at", "desc")
      .limit(limit);
  },

  async getTopPlayers(limit = 10) {
    return await db("game_records")
      .join("users", "game_records.user_id", "users.id")
      .select(
        "users.id",
        "users.username",
        "users.avatar_url",
        db.raw("SUM(game_records.score) as total_score"),
        db.raw("COUNT(game_records.id) as games_played")
      )
      .groupBy("users.id", "users.username", "users.avatar_url")
      .orderBy("total_score", "desc")
      .limit(limit);
  },
};

export default UserModel;
