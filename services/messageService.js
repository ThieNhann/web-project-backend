/**
 * Message Service - Business Logic for Messages
 */

import MessageModel from "../models/messageModel.js";
import UserModel from "../models/userModel.js";

export const MessageService = {
  async sendMessage(senderId, recipientId, content) {
    if (senderId === recipientId) {
      throw new Error("Cannot send message to yourself");
    }

    const recipient = await UserModel.findById(recipientId);
    if (!recipient) {
      throw new Error("Recipient not found");
    }

    if (!content || content.trim().length === 0) {
      throw new Error("Message content cannot be empty");
    }

    const message = await MessageModel.sendMessage(senderId, recipientId, content);
    return message;
  },

  async getConversation(userId, otherUserId, limit = 50) {
    const otherUser = await UserModel.findById(otherUserId);
    if (!otherUser) {
      throw new Error("User not found");
    }

    return await MessageModel.getConversation(userId, otherUserId, limit);
  },

  async getUnreadMessages(userId) {
    return await MessageModel.getUnreadMessages(userId);
  },

  async getUnreadCount(userId) {
    return await MessageModel.getUnreadCount(userId);
  },

  async markAsRead(messageId) {
    const message = await MessageModel.getMessageById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    await MessageModel.markAsRead(messageId);
    return true;
  },

  async markConversationAsRead(userId, otherUserId) {
    await MessageModel.markConversationAsRead(userId, otherUserId);
    return true;
  },

  async deleteMessage(messageId) {
    const message = await MessageModel.getMessageById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    await MessageModel.deleteMessage(messageId);
    return true;
  },

  async deleteConversation(userId, otherUserId) {
    await MessageModel.deleteConversation(userId, otherUserId);
    return true;
  },
};

export default MessageService;
