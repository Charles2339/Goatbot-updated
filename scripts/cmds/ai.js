const axios = require("axios");

// Store conversation history for each user
const userConversations = new Map();

module.exports = {
  config: {
    name: "youai",
    aliases: ["you", "youchat", "ai", "gpt", "gemini"],
    version: "3.0",
    author: "Nexo & Charles MK",
    countDown: 5,
    role: 0,
    shortDescription: "Chat with MK AI",
    longDescription: "Send a message and get intelligent AI responses with conversation memory",
    category: "ai",
    guide: {
      en: "{pn} <your message> - Chat with AI\n" +
          "{pn} reset - Clear your conversation history\n" +
          "Just keep typing to continue the conversation"
    }
  },

  langs: {
    en: {
      noInput: "❌ Please provide a message to chat\n\nUsage: +you <message>",
      loading: "🧠 Thinking...",
      error: "❌ Failed to get response from MK AI\nPlease try again later",
      resetSuccess: "✅ Your conversation history has been cleared!"
    }
  },

  onStart: async function ({ message, args, event, getLang }) {
    const input = args.join(" ").trim();
    const senderID = event.senderID;

    if (!input) return message.reply(getLang("noInput"));

    if (input.toLowerCase() === "reset") {
      userConversations.delete(senderID);
      return message.reply(getLang("resetSuccess"));
    }

    message.reply(getLang("loading"));

    try {
      if (!userConversations.has(senderID)) {
        userConversations.set(senderID, []);
      }

      const conversation = userConversations.get(senderID);

      conversation.push({
        role: "user",
        content: input
      });

      const recent = conversation.slice(-10);
      const context = recent.map(m =>
        `${m.role === "user" ? "User" : "AI"}: ${m.content}`
      ).join("\n");

      const contextMessage = `
Previous conversation:
${context}

Respond naturally as an AI assistant.
`;

      const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/you?chat=${encodeURIComponent(contextMessage)}`;
      const res = await axios.get(apiUrl, { timeout: 30000 });

      if (!res.data || !res.data.response)
        return message.reply(getLang("error"));

      const aiText = res.data.response;

      conversation.push({
        role: "assistant",
        content: aiText
      });

      if (conversation.length > 20)
        userConversations.set(senderID, conversation.slice(-20));

      let responseMsg =
        `🤖 MK AI RESPONSE\n━━━━━━━━━━━━━━━━━━\n\n` +
        aiText +
        `\n\n━━━━━━━━━━━━━━━━━━`;

      return message.reply(responseMsg);

    } catch (err) {
      console.error("MK AI Error:", err.message || err);
      return message.reply(getLang("error"));
    }
  }
};
