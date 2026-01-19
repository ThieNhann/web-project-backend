// const db = require("../config/db");
import db from "../config/db.js";

export const getGames = async (req, res) => {
  try {
    // lấy game đang active
    // sort theo id
    const games = await db("games")
      .where("is_active", true)
      .select("id", "name", "code", "description")
      .orderBy("id", "asc");

    res.json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách game",
    });
  }
};

export const saveGame = async (req, res) => {
  try {
    const { game_id, data } = req.body;
    const user_id = req.user.userId;

    // Check required fields
    if (!game_id || !data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: game_id and data",
      });
    }

    // Check game exists
    const game = await db("games").where("id", game_id).first();
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    // Save game
    const [savedGame] = await db("game_saves")
      .insert({
        user_id,
        game_id,
        data: JSON.stringify(data),
      })
      .returning("*");

    res.status(201).json({
      success: true,
      message: "Game saved successfully",
      data: {
        ...savedGame,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while saving game",
    });
  }
};

export const loadGame = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { game_id } = req.query;

    // Build query
    let query = db("game_saves")
      .select(
        "game_saves.id",
        "game_saves.user_id",
        "game_saves.game_id",
        "game_saves.data",
        "game_saves.saved_at",
        "games.name as game_name",
        "games.code as game_code"
      )
      .join("games", "game_saves.game_id", "games.id")
      .where("game_saves.user_id", user_id)
      .orderBy("game_saves.saved_at", "desc");

    if (game_id) {
      query = query.where("game_saves.game_id", game_id);
    }

    const saves = await query;

    // Parse JSON data
    const parsedSaves = saves.map((save) => ({
      ...save,
    }));
    
    res.json({
      success: true,
      count: parsedSaves.length,
      data: parsedSaves[0], // Return lasted saved game only
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while loading saved games",
    });
  }
};

export const getGameBoardSize = async (req, res) => {
  const { id: gameId } = req.params;
  try {
    const game = await db("games")
      .where("id", gameId)
      .select("board_width", "board_height")
      .first();
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }
    res.json({
      success: true,
      data: {
        board_width: game.board_width,
        board_height: game.board_height,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while getting game board size",
    });
  }
};

export const updateGameBoardSize = async (req, res) => {
  const { id: gameId } = req.params;
  const { board_width, board_height } = req.body;
  try {
    const updatedRows = await db("games")
      .where("id", gameId)
      .update({
        board_width: board_width,
        board_height: board_height,
        updated_at: db.fn.now(),
      });
    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Game not found or no changes made",
      });
    }
    res.json({
      success: true,
      message: "Game board size updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while updating game board size",
    });
  }
};

export const getGameTimer = async (req, res) => {
  const { id: gameId } = req.params;
  try {
    const game = await db("games")
      .where("id", gameId)
      .select("timer")
      .first();
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }
    res.json({
      success: true,
      data: {
        timer: game.timer,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while getting game timer",
    });
  }
};

export const updateGameTimer = async (req, res) => {
  const { id: gameId } = req.params;
  const { timer } = req.body;
  try {
    const updatedRows = await db("games")
      .where("id", gameId)
      .update({
        timer: timer,
        updated_at: db.fn.now(),
      });
    if (updatedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Game not found or no changes made",
      });
    }
    res.json({
      success: true,
      message: "Game timer updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while updating game timer",
    });
  }
};