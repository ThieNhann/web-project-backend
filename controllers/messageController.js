import db from "../config/db.js";
import "dotenv/config";

export async function getMessageList(req, res) {
  try {
    console.log("[DEBUG] getMessageList called");
    const requesterId = req.user ? req.user.userId : null;

    const conversations = await db("conversations as c")
      .join("conversation_members as cm", "c.id", "cm.conversation_id")
      .join("conversation_members as cm2", "c.id", "cm2.conversation_id")
      .join("users as u", "cm2.user_id", "u.id")
      .where("cm.user_id", requesterId)
      .andWhere("cm2.user_id", "<>", requesterId)
      .select("c.id as conversationId", "u.username", "u.avatar_url")
      .orderBy("c.created_at", "desc");

    console.log("[DEBUG] Retrieved conversations:", conversations);

    const conversationWithLastMessages = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await db("messages")
          .where({ conversation_id: conv.conversationId })
          .orderBy("created_at", "desc")
          .first();
        return {
          ...conv,
          lastMessageContent: lastMessage ? lastMessage.content : null,
          lastMessageUserId: lastMessage ? lastMessage.sender_id : null,
        };
      }),
    );

    console.log("[DEBUG] Conversations with last messages:", conversationWithLastMessages);

    return res.status(200).json({
      chatList: conversationWithLastMessages.map((conv) => ({
        conversationId: conv.conversationId,
        username: conv.username,
        avatarUrl: process.env.SERVER_URL + conv.avatar_url,
        lastMessage: {
          content: conv.lastMessageContent,
          role: conv.lastMessageUserId === requesterId ? "sender" : "receiver",
        },
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessageMeta(req, res) {
  try {
    console.log("[DEBUG] getMessageMeta called");
    const { conversationId } = req.params;
    const requesterId = req.user ? req.user.userId : null;

    const isMember = await db("conversation_members")
      .where({ conversation_id: conversationId, user_id: requesterId })
      .first();
    if (!isMember) {
      return res.status(403).json({ message: "Access denied to this conversation" });
    }

    const conversation = await db("conversations as c")
      .join("conversation_members as cm", "c.id", "cm.conversation_id")
      .join("users as u", "cm.user_id", "u.id")
      .where("c.id", conversationId)
      .andWhere("cm.user_id", "<>", requesterId)
      .select("u.username", "u.avatar_url")
      .first();

    console.log("[DEBUG] Retrieved conversation meta:", conversation);

    return res.status(200).json({
      conversationId: conversationId,
      username: conversation.username,
      avatarUrl: conversation.avatar_url ? process.env.SERVER_URL + conversation.avatar_url : null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessageContent(req, res) {
  try {
    //console.log("[DEBUG] getMessageContent called");
    const { conversationId } = req.params;
    const requesterId = req.user ? req.user.userId : null;

    const isMember = await db("conversation_members")
      .where({ conversation_id: conversationId, user_id: requesterId })
      .first();
    if (!isMember) {
      return res.status(403).json({ message: "Access denied to this conversation" });
    }

    const messages = await db("messages")
      .select("sender_id", "content")
      .where({ conversation_id: conversationId })
      .orderBy("created_at", "asc");

    const messageWithRoles = messages.map((msg) => ({
      role: msg.sender_id === requesterId ? "sender" : "receiver",
      content: msg.content,
    }));

    console.log("[DEBUG] Retrieved messages:", messageWithRoles);

    return res.status(200).json({ messages: messageWithRoles });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendMessage(req, res) {
  try {
    console.log("[DEBUG] sendMessage called");
    const { conversationId } = req.params;
    const { content } = req.body;
    const requesterId = req.user ? req.user.userId : null;

    const isMember = await db("conversation_members")
      .where({ conversation_id: conversationId, user_id: requesterId })
      .first();
    if (!isMember) {
      return res.status(403).json({ message: "Access denied to this conversation" });
    }

    await db("messages").insert({
      conversation_id: conversationId,
      sender_id: requesterId,
      content: content,
      created_at: new Date(),
    });

    return res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendNewDirectMessage(req, res) {
  try {
    console.log("[DEBUG] sendNewDirectMessage called");
    const { targetUserId } = req.params;
    const { content } = req.body;
    const requesterId = req.user ? req.user.userId : null;

    // Check if a direct conversation already exists
    let conversation = await db("conversations as c")
      .join("conversation_members as cm1", "c.id", "cm1.conversation_id")
      .join("conversation_members as cm2", "c.id", "cm2.conversation_id")
      .where("cm1.user_id", requesterId)
      .andWhere("cm2.user_id", targetUserId)
      .select("c.id")
      .first();

    console.log("[DEBUG] Existing conversation:", conversation);

    // If not, create a new direct conversation
    if (!conversation) {
      const [newConversationId] = await db("conversations")
        .insert({ created_at: new Date() })
        .returning("id");

      console.log("[DEBUG] New conversation ID:", newConversationId);

      await db("conversation_members").insert([
        { conversation_id: Number(newConversationId.id), user_id: requesterId },
        { conversation_id: Number(newConversationId.id), user_id: targetUserId },
      ]);

      conversation = { id: Number(newConversationId.id) };
    }

    // Now send the message in the (new or existing) conversation
    await db("messages").insert({
      conversation_id: conversation.id,
      sender_id: requesterId,
      content: content,
      created_at: new Date(),
    });

    // console.log("[DEBUG] Message sent in conversation:", conversation.id);

    return res
      .status(201)
      .json({ message: "Message sent successfully", conversationId: conversation.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
