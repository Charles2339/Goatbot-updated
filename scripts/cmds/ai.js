const axios = require("axios");

// Store conversation history for each user
const userConversations = new Map();

module.exports = {
  config: {
    name: "youai",
    aliases: ["you", "youchat", "ai", "gpt", "gemini"],
    version: "4.0",
    author: "Nexo & Charles MK",
    countDown: 5,
    role: 0,
    shortDescription: "Chat with AI",
    longDescription: "Send a message and get intelligent AI responses with conversation memory. Reply to bot messages to continue chatting.",
    category: "ai",
    guide: {
      en: "{pn} <your message> - Chat with AI\n" +
          "{pn} reset - Clear your conversation history\n" +
          "Reply to the bot's message to continue the conversation"
    }
  },

  langs: {
    en: {
      noInput: "❌ Please provide a message to chat\n\nUsage: +ai <message>",
      loading: "💭",
      error: "❌ Failed to get response. Please try again.",
      resetSuccess: "✅ Conversation history cleared!"
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

    const processingMsg = await message.reply(getLang("loading"));

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

      // Remove links/URLs from the response to avoid messy formatting
      let cleanText = aiText.replace(/https?:\/\/[^\s]+/g, '').trim();
      
      // Remove any citation markers like [1], [2], etc.
      cleanText = cleanText.replace(/\[\d+\]/g, '').trim();
      
      // Remove multiple consecutive newlines
      cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();

      // Unsend the loading message
      if (processingMsg && processingMsg.messageID) {
        await message.unsend(processingMsg.messageID).catch(() => {});
      }

      // Send just the clean AI response, no formatting
      const sentMessage = await message.reply(cleanText);

      // Set up onReply handler for continuous conversation
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        author: senderID,
        messageID: sentMessage.messageID
      });

      return;

    } catch (err) {
      console.error("AI Error:", err.message || err);
      return message.reply(getLang("error"));
    }
  },

  onReply: async function ({ message, event, Reply, getLang }) {
    try {
      const { author } = Reply;
      const senderID = event.senderID;

      // Only allow the original user to continue the conversation
      if (senderID !== author) return;

      const input = (event.body || "").trim();

      if (!input) return message.reply("❌ Please provide a message");

      // Handle reset command in reply
      if (input.toLowerCase() === "reset") {
        userConversations.delete(senderID);
        return message.reply(getLang("resetSuccess"));
      }

      const processingMsg = await message.reply(getLang("loading"));

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

      if (!res.data || !res.data.response) {
        return message.reply(getLang("error"));
      }

      const aiText = res.data.response;

      conversation.push({
        role: "assistant",
        content: aiText
      });

      if (conversation.length > 20) {
        userConversations.set(senderID, conversation.slice(-20));
      }

      // Remove links/URLs from the response
      let cleanText = aiText.replace(/https?:\/\/[^\s]+/g, '').trim();
      
      // Remove citation markers
      cleanText = cleanText.replace(/\[\d+\]/g, '').trim();
      
      // Remove multiple consecutive newlines
      cleanText = cleanText.replace(/\n{3,}/g, '\n\n').trim();

      // Unsend the loading message
      if (processingMsg && processingMsg.messageID) {
        await message.unsend(processingMsg.messageID).catch(() => {});
      }

      // Send just the clean response
      const sentMessage = await message.reply(cleanText);

      // Set up onReply handler for the new message
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        author: senderID,
        messageID: sentMessage.messageID
      });

    } catch (err) {
      console.error("AI Reply Error:", err.message || err);
      return message.reply(getLang("error"));
    }
  }
};
