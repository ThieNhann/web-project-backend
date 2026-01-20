/**
 * Game Model - Data Access Layer for Games
 */

import db from "../config/db.js";

export const GameModel = {
  // ===== READ =====

  async getGameIdByCode(code) {
    const game = await db("games").where({ code }).first();
    return game ? game.id : null;
  },

  async findAll() {
    return await db("games")
      .select(
        "id",
        "name",
        "code",
        "description",
        "board_width",
        "board_height",
        "timer",
        "is_active",
      )
      .orderBy("id", "asc");
  },

  async findActiveGames() {
    return await db("games")
      .where("is_active", true)
      .select("id", "name", "code", "description", "board_width", "board_height", "timer")
      .orderBy("id", "asc");
  },

  async findById(id) {
    return await db("games").where({ id }).first();
  },

  async findByCode(code) {
    return await db("games").where({ code }).first();
  },

  // ===== UPDATE =====
  async updateById(id, data) {
    await db("games").where({ id }).update(data);
    return this.findById(id);
  },

  async activateGame(id) {
    return await db("games").where({ id }).update({ is_active: true });
  },

  async deactivateGame(id) {
    return await db("games").where({ id }).update({ is_active: false });
  },

  async updateBoardSize(id, { board_width, board_height }) {
    const updateData = {};
    if (board_width !== undefined) updateData.board_width = board_width;
    if (board_height !== undefined) updateData.board_height = board_height;
    return await db("games").where({ id }).update(updateData);
  },

  async updateTimer(id, timer) {
    return await db("games").where({ id }).update({ timer });
  },

  // ===== STATISTICS =====
  async get24HourGameCount() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await db("game_records")
      .where("created_at", ">", since)
      .count("id as count")
      .first();
    return result?.count || 0;
  },

  async getGameTypePercentage() {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    return await db("game_records")
      .join("games", "game_records.game_id", "games.id")
      .where("game_records.created_at", ">", since)
      .select(
        "games.name",
        "games.code",
        db.raw("COUNT(game_records.id) as count"),
        db.raw(
          "ROUND(COUNT(game_records.id) * 100.0 / (SELECT COUNT(*) FROM game_records WHERE created_at > ?), 2) as percentage",
          [since],
        ),
      )
      .groupBy("games.id", "games.name", "games.code")
      .orderBy("count", "desc");
  },

  // ===== GAME SAVES =====
  async saveGame(userId, gameId, saveData) {
    const [savedGame] = await db("game_saves")
      .insert({
        user_id: userId,
        game_id: gameId,
        data: saveData,
        saved_at: new Date(),
      })
      .returning("*");
    return savedGame;
  },

  async getGameSave(saveId) {
    return await db("game_saves").where("id", saveId).first();
  },

  async getUserGameSaves(userId, gameId = null) {
    let query = db("game_saves")
      .where("user_id", userId)
      .join("games", "game_saves.game_id", "games.id")
      .select(
        "game_saves.id",
        "game_saves.user_id",
        "game_saves.game_id",
        "game_saves.data",
        "game_saves.saved_at",
        "games.name as game_name",
        "games.code as game_code",
      );

    if (gameId) {
      query = query.where("game_saves.game_id", gameId);
    }

    return await query.orderBy("game_saves.saved_at", "desc");
  },

  async deleteGameSave(saveId) {
    return await db("game_saves").where("id", saveId).del();
  },

  // ===== GAME RECORDS =====
  async createGameRecord(userId, gameId, score, playTime) {
    const [result] = await db("game_records")
      .insert({
        user_id: userId,
        game_id: gameId,
        score,
        play_time: playTime,
        created_at: new Date(),
      })
      .returning("id");
    return typeof result === "object" ? result.id : result;
  },

  async getGameRecords(gameId, limit = 50) {
    return await db("game_records")
      .where({ game_id: gameId })
      .join("users", "game_records.user_id", "users.id")
      .select("game_records.*", "users.username", "users.avatar_url")
      .orderBy("game_records.created_at", "desc")
      .limit(limit);
  },

  async getUserGameRecords(userId, gameId, limit = 50) {
    return await db("game_records")
      .where({ user_id: userId, game_id: gameId })
      .orderBy("created_at", "desc")
      .limit(limit);
  },

  async getTopScores(gameId, limit = 10) {
    return await db("game_records")
      .where({ game_id: gameId })
      .join("users", "game_records.user_id", "users.id")
      .select("game_records.*", "users.username", "users.avatar_url")
      .orderBy("game_records.score", "desc")
      .limit(limit);
  },

  async getYearlyPlayerStats() {
    const result = await db("game_records")
      .select(
        db.raw("EXTRACT(YEAR FROM created_at) as year"),
        db.raw("EXTRACT(MONTH FROM created_at) as month"),
        db.raw("COUNT(DISTINCT user_id) as player_count"),
      )
      .groupBy(db.raw("EXTRACT(YEAR FROM created_at)"), db.raw("EXTRACT(MONTH FROM created_at)"))
      .orderBy(db.raw("year"), db.raw("month"));
    return result;
  },
};

export default GameModel;
