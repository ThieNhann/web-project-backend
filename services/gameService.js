/**
 * Game Service - Business Logic for Games
 */

import GameModel from "../models/gameModel.js";

export const GameService = {
  async getAvailableGames() {
    return await GameModel.findActiveGames();
  },

  async getAllGames() {
    return await GameModel.findAll();
  },

  async getGameDetails(gameId) {
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    return game;
  },

  // ===== GAME MANAGEMENT (ADMIN) =====
  async activateGame(gameId) {
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    await GameModel.activateGame(gameId);
    return await GameModel.findById(gameId);
  },

  async deactivateGame(gameId) {
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    await GameModel.deactivateGame(gameId);
    return await GameModel.findById(gameId);
  },

  async updateBoardSize(gameId, { board_width, board_height }) {
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    if (board_width !== undefined || board_height !== undefined) {
      await GameModel.updateBoardSize(gameId, { board_width, board_height });
    }
    return await GameModel.findById(gameId);
  },

  async updateTimer(gameId, timer) {
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }
    await GameModel.updateTimer(gameId, timer);
    return await GameModel.findById(gameId);
  },

  // ===== GAME SAVES =====
  async saveGame(userId, gameId, saveData) {
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    const savedGame = await GameModel.saveGame(userId, gameId, saveData);
    return savedGame;
  },

  async loadGames(userId, gameId = null) {
    return await GameModel.getUserGameSaves(userId, gameId);
  },

  async deleteGameSave(saveId) {
    const save = await GameModel.getGameSave(saveId);
    if (!save) {
      throw new Error("Game save not found");
    }
    await GameModel.deleteGameSave(saveId);
    return true;
  },

  // ===== GAME RECORDS =====
  async recordGamePlay(userId, gameId, score, playTime) {
    const game = await GameModel.findById(gameId);
    if (!game) {
      throw new Error("Game not found");
    }

    const recordId = await GameModel.createGameRecord(userId, gameId, score, playTime);
    return recordId;
  },

  async getGameRecords(gameId) {
    return await GameModel.getGameRecords(gameId);
  },

  async getUserGameRecords(userId, gameId) {
    return await GameModel.getUserGameRecords(userId, gameId);
  },

  async getTopScores(gameId) {
    return await GameModel.getTopScores(gameId);
  },

  // ===== STATISTICS (ADMIN) =====
  async get24HourGameCount() {
    return await GameModel.get24HourGameCount();
  },

  async getGameTypePercentage() {
    return await GameModel.getGameTypePercentage();
  },

  async getYearlyPlayerStats() {
    return await GameModel.getYearlyPlayerStats();
  },
};

export default GameService;
