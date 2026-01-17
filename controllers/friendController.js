// const db = require("../config/db");
import db from "../config/db.js";
import "dotenv/config";

export const getFriendRequests = async (req, res) => {
  const userId = req.user.userId;
  // console.log("Get Friend Requests endpoint hit", userId);

  try {
    const data = await db("friends")
      .join("users", "friends.user_id", "users.id")
      .where({ "friends.friend_id": userId, "friends.status": "pending" })
      .select(
        "friends.user_id",
        "users.username",
        "users.avatar_url",
        "friends.status",
        "friends.created_at"
      );

    return res.status(200).json({
      friendRequests: data.map((request) => ({
        requestUserId: request.user_id,
        requestUsername: request.username,
        requestUserAvatarUrl: process.env.SERVER_URL + request.avatar_url,
        status: request.status,
        createdAt: request.created_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  const userId = req.user.userId;
  const requestUserId = req.params.requestUserId;
  // console.log("Accept Friend Request endpoint hit", userId, requestUserId);

  try {
    const updated = await db("friends")
      .where({ user_id: requestUserId, friend_id: userId, status: "pending" })
      .update({ status: "accepted" });
    if (updated === 0) {
      return res.status(404).json({ message: "Friend request not found" });
    }
    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const denyFriendRequest = async (req, res) => {
  const userId = req.user.userId;
  const requestUserId = req.params.requestUserId;
  // console.log("Deny Friend Request endpoint hit", userId, requestUserId);

  try {
    const deleted = await db("friends")
      .where({ user_id: requestUserId, friend_id: userId, status: "pending" })
      .del();
    if (deleted === 0) {
      return res.status(404).json({ message: "Friend request not found" });
    }
    return res.status(200).json({ message: "Friend request denied" });
  } catch (error) {
    console.error("Error denying friend request:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
