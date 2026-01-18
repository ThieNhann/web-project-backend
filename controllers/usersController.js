import db from "../config/db.js";

const getUsersAchievements = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Get paginated achievements
    const achievements = await db("user_achievements")
      .join("achievements", "user_achievements.achievement_id", "=", "achievements.id")
      .where("user_achievements.user_id", userId)
      .select(
        "achievements.name as title",
        "achievements.icon_url as iconUrl",
        "achievements.description",
        "user_achievements.unlocked_at as dateAchieved",
      )
      .orderBy("user_achievements.unlocked_at", "desc")
      .limit(limit)
      .offset(offset);

    // Get total count of user achievements
    const totalCount = await db("user_achievements")
      .join("achievements", "user_achievements.achievement_id", "=", "achievements.id")
      .where("user_achievements.user_id", userId)
      .count("* as count")
      .first();

    const totalAchievements = totalCount?.count || 0;

    // Check if there are more achievements
    const hasMore = offset + limit < totalAchievements;

    res.json({
      achievements,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
};

const getUsersRankings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const filter = req.query.type || "global"; // only-me, friends, global
    const game = req.query.game; // snake, caro-5, caro-4, tic-tac-toe, memory, match-3

    let query = db("game_records")
      .join("users", "game_records.user_id", "=", "users.id")
      .join("games", "game_records.game_id", "=", "games.id")
      .select(
        "users.id",
        "users.username",
        "users.avatar_url",
        db.raw("SUM(game_records.score) as total_score"),
      )
      .groupBy("users.id", "users.username", "users.avatar_url")
      .orderBy("total_score", "desc");

    // Apply game filter
    if (game) {
      query = query.where("games.code", game);
    }

    // Apply user type filter
    if (filter === "only-me") {
      query = query.where("game_records.user_id", userId);
    } else if (filter === "friends") {
      query = query.whereIn(
        "game_records.user_id",
        db("friends").select("friend_id").where("user_id", userId).where("status", "accepted"),
      );
    }
    // filter === 'global' - no additional where clause

    const rankings = await query.limit(100);

    res.json({ rankings });
  } catch (error) {
    console.error("Error fetching user rankings:", error);
    res.status(500).json({ error: "Failed to fetch rankings" });
  }
};

const getFriendStatus = async (req, res) => {
  console.log("[DEBUG] getFriendStatus called");
  const { userId } = req.params;
  const requesterId = req.user ? req.user.userId : null;
  console.log("[DEBUG] Requester ID:", requesterId, "Target User ID:", userId);

  try {
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const targetUser = await db("users").where({ id: userId }).first();
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!targetUser.is_active) {
      return res.status(403).json({ message: "Target user's account is disabled" });
    }

    if (!requesterId) {
      return res.status(200).json({ friendStatus: "not_friends" });
    }

    if (requesterId === userId) {
      return res.status(400).json({ message: "Cannot get friend status with yourself" });
    }

    const friendship = await db("friends")
      .where(function () {
        this.where({ user_id: requesterId, friend_id: userId });
      })
      .orWhere(function () {
        this.where({ user_id: userId, friend_id: requesterId });
      })
      .first();

    let friendStatus = "not_friends";
    if (friendship) {
      if (friendship.status === "accepted") {
        friendStatus = "friends";
      } else if (friendship.status === "pending") {
        friendStatus = friendship.user_id === requesterId ? "request_sent" : "request_received";
      }
    }

    return res.status(200).json({ friendStatus });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getUserProfile = async (req, res) => {
  // console.log("[DEBUG] getUserProfile called");
  // console.log("[DEBUG] Request params:", req.params);
  const { userId } = req.params;
  // console.log("[DEBUG] Fetching profile for user_id:", userId);

  try {
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const user = await db("users").where({ id: userId }).first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    const userInfo = {
      userId: user.id,
      username: user.username || null,
      fullName: user.full_name || null,
      email: user.email,
      bio: user.bio || null,
      avatarUrl: user.avatar_url ? process.env.SERVER_URL + user.avatar_url : null,
    };

    return res.status(200).json(userInfo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addFriend = async (req, res) => {
  //console.log("[DEBUG] addFriend called");
  const { userId } = req.params;
  const requesterId = req.user.userId;
  //console.log("[DEBUG] Requester ID:", requesterId, "Target User ID:", userId);

  try {
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }
    if (requesterId === userId) {
      return res.status(400).json({ message: "Cannot add yourself as a friend" });
    }

    const targetUser = await db("users").where({ id: userId }).first();
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!targetUser.is_active) {
      return res.status(403).json({ message: "Target user's account is disabled" });
    }

    const existingRequest = await db("friends")
      .where({ user_id: requesterId, friend_id: userId })
      .orWhere({ user_id: userId, friend_id: requesterId })
      .first();
    if (existingRequest) {
      return res.status(409).json({ message: "Friend request already sent" });
    }

    await db("friends").insert({
      user_id: requesterId,
      friend_id: userId,
      status: "pending",
      created_at: new Date(),
    });

    return res.status(201).json({ message: "Friend request sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const removeFriend = async (req, res) => {
  //console.log("[DEBUG] removeFriend called");
  const { userId } = req.params;
  const requesterId = req.user.userId;
  //console.log("[DEBUG] Requester ID:", requesterId, "Target User ID:", userId);

  try {
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }
    if (requesterId === userId) {
      return res.status(400).json({ message: "Cannot remove yourself as a friend" });
    }

    const friendship = await db("friends")
      .where(function () {
        this.where({ user_id: requesterId, friend_id: userId });
      })
      .orWhere(function () {
        this.where({ user_id: userId, friend_id: requesterId });
      })
      .first();

    if (!friendship) {
      return res.status(404).json({ message: "Friendship not found" });
    }

    await db("friends").where({ id: friendship.id }).del();

    return res.status(200).json({ message: "Friend removed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createOrGetDirectMessage = async (req, res) => {
  //console.log("[DEBUG] createOrGetDirectMessage called");
  const { userId } = req.params;
  const requesterId = req.user.userId;
  //console.log("[DEBUG] Requester ID:", requesterId, "Target User ID:", userId);

  try {
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }
    if (requesterId === userId) {
      return res.status(400).json({ message: "Cannot create direct message with yourself" });
    }

    const targetUser = await db("users").where({ id: userId }).first();
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!targetUser.is_active) {
      return res.status(403).json({ message: "Target user's account is disabled" });
    }

    let existingConversation = await db("conversations")
      .join("conversation_members", "conversations.id", "conversation_members.conversation_id")
      .whereIn("conversation_members.user_id", [requesterId, userId])
      .groupBy("conversations.id")
      .havingRaw("COUNT(DISTINCT conversation_members.user_id) = 2")
      .select("conversations.id")
      .first();

    console.log("[DEBUG] Existing conversation:", existingConversation);

    if (existingConversation) {
      return res.status(200).json({
        hasConversation: true,
        conversationId: existingConversation.id,
      });
    }

    return res.status(200).json({ hasConversation: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  getUsersAchievements,
  getUsersRankings,
  getFriendStatus,
  getUserProfile,
  addFriend,
  removeFriend,
  createOrGetDirectMessage,
};
