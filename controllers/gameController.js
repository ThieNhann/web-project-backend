/**
 * Game Controller - Handle HTTP requests for games
 * Chỉ xử lý request/response, logic được delegate cho Service
 */

import GameService from "../services/gameService.js";

// ===== GET GAMES =====
export const getGames = async (req, res) => {
  try {
    const games = await GameService.getAvailableGames();

    return res.json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching games",
    });
  }
};

// ===== GAME SAVES =====
export const saveGame = async (req, res) => {
  try {
    const { game_id, data } = req.body;
    const user_id = req.user.userId;

    // Validate input
    if (!game_id || !data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: game_id and data",
      });
    }

    const savedGame = await GameService.saveGame(user_id, game_id, data);

    return res.status(201).json({
      success: true,
      message: "Game saved successfully",
      data: savedGame,
    });
  } catch (error) {
    console.error(error);
    const status = error.message === "Game not found" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const loadGame = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { game_id } = req.query;

    const saves = await GameService.loadGames(user_id, game_id ? parseInt(game_id) : null);

    return res.json({
      success: true,
      count: saves.length,
      data: saves.length > 0 ? saves[0] : null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error loading saved games",
    });
  }
};

// ===== GAME BOARD SIZE =====
export const getGameBoardSize = async (req, res) => {
  try {
    const { id: gameId } = req.params;
    const game = await GameService.getGameDetails(gameId);

    return res.json({
      success: true,
      data: {
        board_width: game.board_width,
        board_height: game.board_height,
      },
    });
  } catch (error) {
    console.error(error);
    const status = error.message === "Game not found" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateGameBoardSize = async (req, res) => {
  try {
    const { id: gameId } = req.params;
    const { board_width, board_height } = req.body;

    // For admin only - update both width and height
    if (board_width || board_height) {
      const boardSize = board_width || board_height;
      await GameService.updateBoardSize(gameId, boardSize);
    }

    return res.json({
      success: true,
      message: "Game board size updated successfully",
    });
  } catch (error) {
    console.error(error);
    const status = error.message === "Game not found" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== GAME TIMER =====
export const getGameTimer = async (req, res) => {
  try {
    const { id: gameId } = req.params;
    const game = await GameService.getGameDetails(gameId);

    return res.json({
      success: true,
      data: {
        timer: game.timer,
      },
    });
  } catch (error) {
    console.error(error);
    const status = error.message === "Game not found" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateGameTimer = async (req, res) => {
  try {
    const { id: gameId } = req.params;
    const { timer } = req.body;

    await GameService.updateTimer(gameId, timer);

    return res.json({
      success: true,
      message: "Game timer updated successfully",
    });
  } catch (error) {
    console.error(error);
    const status = error.message === "Game not found" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== GAME RECORDS =====
export const postGameRecord = async (req, res) => {
  try {
    const { game_id, score, play_time } = req.body;
    const user_id = req.user.userId;

    // Validate input
    if (!game_id || score === undefined || play_time === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: game_id, score, play_time",
      });
    }

    const recordId = await GameService.recordGamePlay(user_id, game_id, score, play_time);

    return res.status(201).json({
      success: true,
      message: "Game record added successfully",
      data: { recordId },
    });
  } catch (error) {
    console.error(error);
    const status = error.message === "Game not found" ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const getGameRecords = async (req, res) => {
  try {
    const { game_id } = req.query;
    const user_id = req.user.userId;

    const records = await GameService.getUserGameRecords(user_id, game_id);

    return res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving game records",
    });
  }
};