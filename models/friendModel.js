/**
 * Friend Model - Data Access Layer for Friend Relationships
 */

import db from "../config/db.js";

export const FriendModel = {
  // ===== FRIEND REQUESTS =====
  async sendFriendRequest(userId, friendId) {
    return await db("friends").insert({
      user_id: userId,
      friend_id: friendId,
      status: "pending",
      requested_at: new Date(),
    });
  },

  async acceptFriendRequest(userId, friendId) {
    await db("friends")
      .where({
        user_id: friendId,
        friend_id: userId,
        status: "pending",
      })
      .update({ status: "accepted", accepted_at: new Date() });

    // Tạo kết bạn ngược chiều
    const existing = await db("friends")
      .where({ user_id: userId, friend_id: friendId })
      .first();
    
    if (!existing) {
      await db("friends").insert({
        user_id: userId,
        friend_id: friendId,
        status: "accepted",
        accepted_at: new Date(),
      });
    }
  },

  async rejectFriendRequest(userId, friendId) {
    return await db("friends")
      .where({
        user_id: friendId,
        friend_id: userId,
        status: "pending",
      })
      .update({ status: "rejected" });
  },

  async removeFriend(userId, friendId) {
    await db("friends")
      .where({ user_id: userId, friend_id: friendId })
      .del();
    
    await db("friends")
      .where({ user_id: friendId, friend_id: userId })
      .del();
  },

  // ===== READ =====
  async getFriendsList(userId) {
    return await db("friends")
      .where({ user_id: userId, status: "accepted" })
      .join("users", "friends.friend_id", "users.id")
      .select(
        "users.id",
        "users.username",
        "users.avatar_url",
        "friends.accepted_at"
      );
  },

  async getPendingRequests(userId) {
    return await db("friends")
      .where({ friend_id: userId, status: "pending" })
      .join("users", "friends.user_id", "users.id")
      .select(
        "users.id",
        "users.username",
        "users.avatar_url",
        "friends.requested_at"
      )
      .orderBy("friends.requested_at", "desc");
  },

  async getSentRequests(userId) {
    return await db("friends")
      .where({ user_id: userId, status: "pending" })
      .join("users", "friends.friend_id", "users.id")
      .select(
        "users.id",
        "users.username",
        "users.avatar_url",
        "friends.requested_at"
      );
  },

  async isFriend(userId, friendId) {
    const result = await db("friends")
      .where({
        user_id: userId,
        friend_id: friendId,
        status: "accepted",
      })
      .first();
    return !!result;
  },

  async getFriendStatus(userId, friendId) {
    return await db("friends")
      .where({ user_id: userId, friend_id: friendId })
      .first();
  },
};

export default FriendModel;
