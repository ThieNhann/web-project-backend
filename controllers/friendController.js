/**
 * Friend Controller - Handle HTTP requests for friend operations
 */

import FriendService from "../services/friendService.js";

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await FriendService.getPendingRequests(userId);

    return res.status(200).json({
      friendRequests: requests,
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const requestUserId = req.params.requestUserId;

    await FriendService.acceptFriendRequest(userId, requestUserId);

    return res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    const status = error.message === "Friend request not found" ? 404 : 500;
    return res.status(status).json({ message: error.message });
  }
};

export const denyFriendRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const requestUserId = req.params.requestUserId;

    await FriendService.rejectFriendRequest(userId, requestUserId);

    return res.status(200).json({ message: "Friend request denied" });
  } catch (error) {
    console.error("Error denying friend request:", error);
    const status = error.message === "Friend request not found" ? 404 : 500;
    return res.status(status).json({ message: error.message });
  }
};
