import db from "../config/db.js";
const ONLINE_WINDOW_MINUTES = 15;

// --------------------------------- GAME MANAGEMENT CONTROLLERS -----------------------------------------

const getAvailableGames = async (req, res) => {
  console.log("Fetching available games...");
  try {
    const games = await db("games")
      .select(
        "id as gameId",
        "name as title",
        "description",
        "is_active as isActive",
        "board_width as boardWidth",
        "board_height as boardHeight",
        "timer",
      )
      .orderBy("id");

    res.json({ games });
  } catch (error) {
    console.error("Error fetching available games:", error);
    res.status(500).json({ error: "Failed to fetch available games" });
  }
};

// const getGameDetails = async (req, res) => {
//   try {
//     const { gameId } = req.params;

//     // Find game by gameId
//     const game = await db("games").where("id", gameId).first();

//     // If not found
//     if (!game) {
//       return res.status(404).json({ error: "Game not found" });
//     }

//     res.json({
//       gameId: game.id,
//       title: game.name,
//       description: game.description,
//       status: game.is_active ? "active" : "inactive",
//       boardSize: game.board_size || null,
//     });
//   } catch (error) {
//     console.error("Error fetching game details:", error);
//     res.status(500).json({ error: "Failed to fetch game details" });
//   }
// };

const activateGameMode = async (req, res) => {
  try {
    const gameId = Number(req.params.gameId) || 0;
    const updated = await db("games").where("id", gameId).update({ is_active: true });

    if (!updated) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Game mode activated" });
  } catch (error) {
    console.error("Error activating game mode:", error);
    res.status(500).json({ error: "Failed to activate game mode" });
  }
};

const deactivateGameMode = async (req, res) => {
  try {
    const gameId = Number(req.params.gameId) || 0;
    const updated = await db("games").where("id", gameId).update({ is_active: false });

    if (!updated) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Game mode deactivated" });
  } catch (error) {
    console.error("Error deactivating game mode:", error);
    res.status(500).json({ error: "Failed to deactivate game mode" });
  }
};

const updateBoardSize = async (req, res) => {
  try {
    const gameId = Number(req.params.gameId) || 0;
    const { boardSize } = req.body;
    const board_width = parseInt(boardSize.width);
    const board_height = parseInt(boardSize.height);

    const updated = await db("games")
      .where("id", gameId)
      .update({ board_width: board_width, board_height: board_height });

    if (!updated) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ message: "Board size updated" });
  } catch (error) {
    console.error("Error updating board size:", error);
    res.status(500).json({ error: "Failed to update board size" });
  }
};

const updateTimer = async (req, res) => {
  try {
    const gameId = Number(req.params.gameId) || 0;
    const { timer } = req.body;
    const updated = await db("games").where("id", gameId).update({ timer: timer });

    if (!updated) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json({ message: "Timer updated" });
  } catch (error) {
    console.error("Error updating timer:", error);
    res.status(500).json({ error: "Failed to update timer" });
  }
};

// --------------------------------- STATISTICS CONTROLLERS -----------------------------------------

// Lấy số người chơi hoạt động 24h qua
const get24HourPlayers = async (req, res) => {
  try {
    const points = [24, 12, 6, 1, 0];
    const data = [];

    for (const hoursAgo of points) {
      const result = await db("game_records")
        .where(
          "created_at",
          ">=",
          db.raw(
            `NOW() - INTERVAL '${hoursAgo} HOURS' - INTERVAL '${ONLINE_WINDOW_MINUTES} MINUTES'`,
          ),
        )
        .andWhere("created_at", "<=", db.raw(`NOW()`))
        .countDistinct("user_id as count")
        .first();

      data.push(parseInt(result.count) || 0);
    }

    console.log("Player snapshots:", data);
    res.json({ data });
  } catch (error) {
    console.error("Error fetching player snapshots:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Lấy số game đã tạo 24h qua
const get24HourGames = async (req, res) => {
  try {
    const points = [24, 12, 6, 1, 0];
    const data = [];

    for (const hoursAgo of points) {
      const result = await db("game_records")
        .where(
          "created_at",
          ">=",
          db.raw(
            `NOW() - INTERVAL '${hoursAgo} HOURS' - INTERVAL '${ONLINE_WINDOW_MINUTES} MINUTES'`,
          ),
        )
        .andWhere("created_at", "<=", db.raw(`NOW()`))
        .count("id as count")
        .first();

      data.push(parseInt(result.count) || 0);
    }

    console.log("Game snapshots:", data);
    res.json({ data });
  } catch (error) {
    console.error("Error fetching 24h games:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Thống kê serverload
const get24HourServerLoad = async (req, res) => {
  try {
    const points = [24, 12, 6, 1, 0];
    const data = [];
    // Số record trong 1 giờ chia cho 100 (ngưỡng)

    for (const hoursAgo of points) {
      const result = await db("game_records")
        .where(
          "created_at",
          ">=",
          db.raw(
            `NOW() - INTERVAL '${hoursAgo} HOURS' - INTERVAL '${ONLINE_WINDOW_MINUTES} MINUTES'`,
          ),
        )
        .andWhere("created_at", "<=", db.raw(`NOW()`))
        .count("id as count")
        .first();
      data.push(Math.min(100, (parseInt(result.count) / 100) * 100) || 0);
    }

    console.log("Server load snapshots:", data);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Phần trăm các loại game chơi trong vòng 30d
const getMonthlyGameTypePercentage = async (req, res) => {
  try {
    const rows = await db("games")
      .leftJoin("game_records", function () {
        this.on("game_records.game_id", "games.id")
          .andOn("game_records.created_at", ">=", db.raw("date_trunc('month', NOW())"))
          .andOn(
            "game_records.created_at",
            "<",
            db.raw("date_trunc('month', NOW()) + INTERVAL '1 month'"),
          );
      })
      .select("games.id")
      .count("game_records.id as count")
      .groupBy("games.id")
      .orderBy("games.id");

    const data = rows.map((r) => Number(r.count) || 0);
    const total_data = data.reduce((a, b) => a + b, 0);
    for (let i = 0; i < data.length; i++) {
      data[i] = total_data ? Math.round((data[i] / total_data) * 100) : 0;
    }

    console.log("Monthly game counts:", data);
    res.json({ data });
  } catch (error) {
    console.error("Error fetching monthly game counts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getYearlyPlayers = async (req, res) => {
  try {
    const rows = await db("game_records")
      .select(
        db.raw("EXTRACT(MONTH FROM created_at)::int AS month"),
        db.raw("COUNT(DISTINCT user_id)::int AS players"),
      )
      .whereRaw("EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())")
      .groupByRaw("EXTRACT(MONTH FROM created_at)")
      .orderByRaw("EXTRACT(MONTH FROM created_at)");

    console.log("Yearly player stats rows:", rows);

    // Map DB results
    const map = new Map();
    for (const row of rows) {
      map.set(row.month, row.players);
    }

    const data = [];
    for (let m = 1; m <= 12; m++) {
      data.push(map.get(m) || 0);
    }

    console.log("Yearly player stats data:", data);
    res.json({ data });
  } catch (error) {
    console.error("Error fetching yearly stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --------------------------------- USERS MANAGEMENT CONTROLLERS -----------------------------------------

// Lấy danh sách user có phân trang (?page=1 default)
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Mỗi trang 10 user
    const offset = (page - 1) * limit;

    const users = await db("users")
      .select("id as userId", "username", "email", "role", "is_active as isActive")
      .whereNot("role", "admin")
      .limit(limit)
      .offset(offset)
      .orderBy("created_at", "desc");

    const totalCount = await db("users").whereNot("role", "admin").count("id as count").first();

    res.json({
      users,
      totalPages: Math.ceil(parseInt(totalCount.count) / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Tìm kiếm user theo username hoặc full_name
const searchUsers = async (req, res) => {
  console.log("Search users with query:", req.query);
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const users = await db("users")
      .whereNot("role", "admin")
      .andWhere("username", "ilike", `%${query}%`)
      .select("id as userId", "username", "email", "role", "is_active as isActive");

    res.json({ users });
  } catch (error) {
    console.error("Search failed:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

// Kích hoạt tài khoản
const activateUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const updated = await db("users").where({ id: userId }).update({ is_active: true });

    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User account activated" });
  } catch (error) {
    res.status(500).json({ error: "Activation failed" });
  }
};

// Khóa tài khoản
const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const updated = await db("users").where({ id: userId }).update({ is_active: false });

    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User account deactivated" });
  } catch (error) {
    res.status(500).json({ error: "Deactivation failed" });
  }
};

export default {
  getAvailableGames,
  // getGameDetails,
  activateGameMode,
  deactivateGameMode,
  updateBoardSize,
  updateTimer,

  get24HourPlayers,
  get24HourGames,
  get24HourServerLoad,
  getMonthlyGameTypePercentage,
  getYearlyPlayers,

  getUsers,
  searchUsers,
  activateUser,
  deactivateUser,
};
