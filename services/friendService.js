/**
 * Friend Service - Business Logic for Friend Relationships
 */

import FriendModel from "../models/friendModel.js";
import UserModel from "../models/userModel.js";

export const FriendService = {
  async sendFriendRequest(userId, friendId) {
    if (userId === friendId) {
      throw new Error("Cannot send friend request to yourself");
    }

    const friend = await UserModel.findById(friendId);
    if (!friend) {
      throw new Error("User not found");
    }

    const existingRequest = await FriendModel.getFriendStatus(userId, friendId);
    if (existingRequest) {
      throw new Error("Friend request already exists");
    }

    await FriendModel.sendFriendRequest(userId, friendId);
    return { message: "Friend request sent" };
  },

  async acceptFriendRequest(userId, friendId) {
    const sender = await UserModel.findById(friendId);
    if (!sender) {
      throw new Error("User not found");
    }

    const request = await FriendModel.getFriendStatus(friendId, userId);
    if (!request || request.status !== "pending") {
      throw new Error("No pending friend request from this user");
    }

    await FriendModel.acceptFriendRequest(userId, friendId);
    return { message: "Friend request accepted" };
  },

  async rejectFriendRequest(userId, friendId) {
    const request = await FriendModel.getFriendStatus(friendId, userId);
    if (!request || request.status !== "pending") {
      throw new Error("No pending friend request from this user");
    }

    await FriendModel.rejectFriendRequest(userId, friendId);
    return { message: "Friend request rejected" };
  },

  async removeFriend(userId, friendId) {
    const isFriend = await FriendModel.isFriend(userId, friendId);
    if (!isFriend) {
      throw new Error("Not friends with this user");
    }

    await FriendModel.removeFriend(userId, friendId);
    return { message: "Friend removed" };
  },

  async getFriendsList(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return await FriendModel.getFriendsList(userId);
  },

  async getPendingRequests(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return await FriendModel.getPendingRequests(userId);
  },

  async getSentRequests(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return await FriendModel.getSentRequests(userId);
  },

  async checkFriendStatus(userId, friendId) {
    const status = await FriendModel.getFriendStatus(userId, friendId);
    return status || { status: "not_friends" };
  },
};

export default FriendService;
