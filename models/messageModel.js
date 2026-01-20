/**
 * Message Model - Data Access Layer for Messages
 */

import db from "../config/db.js";

export const MessageModel = {
  // ===== CREATE =====
  async sendMessage(senderId, recipientId, content) {
    const [id] = await db("messages")
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        content,
        is_read: false,
        created_at: new Date(),
      })
      .returning("id");
    return this.getMessageById(id);
  },

  // ===== READ =====
  async getMessageById(id) {
    return await db("messages").where({ id }).first();
  },

  async getConversation(userId, otherUserId, limit = 50) {
    return await db("messages")
      .where(function () {
        this.where({ sender_id: userId, recipient_id: otherUserId })
          .orWhere({ sender_id: otherUserId, recipient_id: userId });
      })
      .orderBy("created_at", "desc")
      .limit(limit);
  },

  async getUnreadMessages(userId) {
    return await db("messages")
      .where({ recipient_id: userId, is_read: false })
      .join("users", "messages.sender_id", "users.id")
      .select(
        "messages.*",
        "users.username as sender_username",
        "users.avatar_url as sender_avatar"
      )
      .orderBy("messages.created_at", "desc");
  },

  async getConversationList(userId) {
    return await db("messages")
      .where(function () {
        this.where({ sender_id: userId })
          .orWhere({ recipient_id: userId });
      })
      .distinct("sender_id", "recipient_id")
      .select(
        db.raw(`CASE 
          WHEN sender_id = ? THEN recipient_id 
          ELSE sender_id 
        END as other_user_id`, [userId])
      )
      .orderBy("created_at", "desc");
  },

  // ===== UPDATE =====
  async markAsRead(messageId) {
    return await db("messages")
      .where({ id: messageId })
      .update({ is_read: true });
  },

  async markConversationAsRead(userId, otherUserId) {
    return await db("messages")
      .where({ recipient_id: userId, sender_id: otherUserId })
      .update({ is_read: true });
  },

  // ===== DELETE =====
  async deleteMessage(messageId) {
    return await db("messages").where({ id: messageId }).del();
  },

  async deleteConversation(userId, otherUserId) {
    return await db("messages")
      .where(function () {
        this.where({ sender_id: userId, recipient_id: otherUserId })
          .orWhere({ sender_id: otherUserId, recipient_id: userId });
      })
      .del();
  },

  // ===== STATISTICS =====
  async getUnreadCount(userId) {
    const result = await db("messages")
      .where({ recipient_id: userId, is_read: false })
      .count("id as count")
      .first();
    return result?.count || 0;
  },
};

export default MessageModel;
