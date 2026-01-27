const axios = require('axios');
const API_ENDPOINT = 'https://metakexbyneokex.fly.dev/chat';

// Store conversation history manually for each user
const userConversations = new Map();
// Store persistent user profiles (name, preferences, etc.)
const userProfiles = new Map();

// ==========================================
// 🎭 CUSTOMIZE AI PERSONALITY HERE
// ==========================================
const AI_PERSONALITY = `You are a friendly and helpful AI assistant created by Charles MK with these traits:
- You're professional
- You're knowledgeable and straight foward
- You have a good sense of humor
- You remember details from the conversation`;
// ==========================================

module.exports = {
  config: {
    name: "ai",
    version: "2.3",
    role: 0,
    author: "CharlesMK",
    description: "Chat with Charles MK's AI",
    category: "AI",
    usages: "[message] or reply to the bot's message.\nUse 'ai reset' to clear conversation (keeps your profile).\nUse 'ai forget' to clear everything including your name.",
    cooldowns: 1
  },

  onStart: async function({ message, args, event, usersData }) {
    const userMessage = args.join(" ");
    const senderID = event.senderID;

    // Check if user wants to reset conversation only
    if (userMessage.toLowerCase() === "reset") {
      userConversations.delete(senderID);
      return message.reply("✅ Your conversation history has been cleared!\n(Your name and profile are still saved)");
    }

    // Check if user wants to forget everything
    if (userMessage.toLowerCase() === "forget") {
      userConversations.delete(senderID);
      userProfiles.delete(senderID);
      return message.reply("✅ Everything has been cleared! I've forgotten all about you.\n(Starting fresh next time we chat)");
    }

    if (!userMessage) {
      return message.reply("Please provide a message to start chatting with the AI.\n\nCommands:\n- 'ai reset' to clear conversation\n- 'ai forget' to clear everything");
    }

    const sessionID = `chat-${senderID}`;

    try {
      // Get or initialize conversation history
      if (!userConversations.has(senderID)) {
        userConversations.set(senderID, {
          cookies: {},
          messages: []
        });
      }

      // Get or initialize user profile
      if (!userProfiles.has(senderID)) {
        userProfiles.set(senderID, {
          name: null,
          preferences: {},
          importantFacts: []
        });
      }

      const conversation = userConversations.get(senderID);
      const profile = userProfiles.get(senderID);
      const isNewConversation = Object.keys(conversation.cookies).length === 0;

      // Try to extract name from message if not already saved
      if (!profile.name) {
        const namePatterns = [
          /(?:my name is|i'm|i am|call me|this is)\s+([A-Z][a-z]+)/i,
          /^([A-Z][a-z]+)\s+here/i,
          /(?:name'?s)\s+([A-Z][a-z]+)/i
        ];

        for (const pattern of namePatterns) {
          const match = userMessage.match(pattern);
          if (match && match[1]) {
            profile.name = match[1];
            userProfiles.set(senderID, profile);
            break;
          }
        }
      }

      // Store the message in history
      conversation.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now()
      });

      // Build profile context
      let profileContext = "";
      if (profile.name) {
        profileContext += `IMPORTANT: The user's name is ${profile.name}. Always remember this!\n`;
      }
      if (profile.importantFacts.length > 0) {
        profileContext += `User facts: ${profile.importantFacts.join(", ")}\n`;
      }

      // Build context-aware message with personality and profile
      let contextMessage = userMessage;
      if (conversation.messages.length > 1 && !isNewConversation) {
        // Include last 5 exchanges for context (10 messages total)
        const recentMessages = conversation.messages.slice(-10);
        const context = recentMessages.map(m => 
          `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        ).join('\n');
        
        contextMessage = `${AI_PERSONALITY}\n\n${profileContext}\nRecent conversation:\n${context}\n\nUser: ${userMessage}\n\nRespond as your character (remember the user's name if you know it):`;
      } else {
        // First message includes personality and profile
        contextMessage = `${AI_PERSONALITY}\n\n${profileContext}\nUser: ${userMessage}\n\nRespond as your character:`;
      }

      const fullResponse = await axios.post(API_ENDPOINT, { 
          message: contextMessage,
          new_conversation: isNewConversation, 
          cookies: conversation.cookies 
      }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000 
      });
      
      const aiMessage = fullResponse.data.message;
      const newCookies = fullResponse.data.cookies;

      // Update cookies and conversation history
      if (newCookies && Object.keys(newCookies).length > 0) {
        conversation.cookies = newCookies;
      }

      conversation.messages.push({
        role: 'assistant',
        content: aiMessage,
        timestamp: Date.now()
      });

      // Keep only last 20 exchanges (40 messages) - but profile stays forever
      if (conversation.messages.length > 40) {
        conversation.messages = conversation.messages.slice(-40);
      }

      userConversations.set(senderID, conversation);

      if (typeof aiMessage === 'string' && aiMessage.trim().length > 0) {
          await message.reply(aiMessage, (err, info) => {
              if (info) {
                  global.GoatBot.onReply.set(info.messageID, {
                      commandName: this.config.name,
                      author: senderID,
                      messageID: info.messageID,
                      sessionID: sessionID 
                  });
              }
          });
      } else {
          await message.reply("AI responded successfully, but the message was empty. Please try again.");
      }

    } catch (error) {
      let errorMsg = "An unknown error occurred while contacting the AI.";
      
      if (error.response) {
          errorMsg = `API Error: Status ${error.response.status}. The server may be unavailable.`;
      } else if (error.code === 'ECONNABORTED') {
          errorMsg = "Request timed out. The AI took too long to respond.";
      }

      await message.reply(`❌ AI Command Failed\n\nError: ${errorMsg}`);
    }
  },

  onReply: async function ({ message, event, Reply }) {
    const userID = event.senderID;
    const query = event.body?.trim();
    
    if (userID !== Reply.author || !query) return;

    // Check if user wants to reset
    if (query.toLowerCase() === "reset") {
      userConversations.delete(userID);
      global.GoatBot.onReply.delete(Reply.messageID);
      return message.reply("✅ Your conversation history has been cleared!\n(Your name and profile are still saved)");
    }

    // Check if user wants to forget everything
    if (query.toLowerCase() === "forget") {
      userConversations.delete(userID);
      userProfiles.delete(userID);
      global.GoatBot.onReply.delete(Reply.messageID);
      return message.reply("✅ Everything has been cleared! I've forgotten all about you.\n(Starting fresh next time we chat)");
    }

    global.GoatBot.onReply.delete(Reply.messageID);

    const sessionID = Reply.sessionID || `chat-${userID}`;

    try {
      // Get conversation data
      if (!userConversations.has(userID)) {
        userConversations.set(userID, {
          cookies: {},
          messages: []
        });
      }

      // Get or initialize user profile
      if (!userProfiles.has(userID)) {
        userProfiles.set(userID, {
          name: null,
          preferences: {},
          importantFacts: []
        });
      }

      const conversation = userConversations.get(userID);
      const profile = userProfiles.get(userID);

      // Try to extract name if not saved
      if (!profile.name) {
        const namePatterns = [
          /(?:my name is|i'm|i am|call me|this is)\s+([A-Z][a-z]+)/i,
          /^([A-Z][a-z]+)\s+here/i,
          /(?:name'?s)\s+([A-Z][a-z]+)/i
        ];

        for (const pattern of namePatterns) {
          const match = query.match(pattern);
          if (match && match[1]) {
            profile.name = match[1];
            userProfiles.set(userID, profile);
            break;
          }
        }
      }

      // Store user message
      conversation.messages.push({
        role: 'user',
        content: query,
        timestamp: Date.now()
      });

      // Build profile context
      let profileContext = "";
      if (profile.name) {
        profileContext += `IMPORTANT: The user's name is ${profile.name}. Always remember this!\n`;
      }
      if (profile.importantFacts.length > 0) {
        profileContext += `User facts: ${profile.importantFacts.join(", ")}\n`;
      }

      // Build context from recent messages with personality and profile
      const recentMessages = conversation.messages.slice(-10);
      const context = recentMessages.map(m => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');
      
      const contextMessage = `${AI_PERSONALITY}\n\n${profileContext}\nRecent conversation:\n${context}\n\nUser: ${query}\n\nRespond as your character (remember the user's name if you know it):`;

      const fullResponse = await axios.post(API_ENDPOINT, { 
          message: contextMessage,
          new_conversation: false, 
          cookies: conversation.cookies 
      }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000 
      });
      
      const aiMessage = fullResponse.data.message;
      const newCookies = fullResponse.data.cookies;

      // Update cookies and history
      if (newCookies && Object.keys(newCookies).length > 0) {
        conversation.cookies = newCookies;
      }

      conversation.messages.push({
        role: 'assistant',
        content: aiMessage,
        timestamp: Date.now()
      });

      // Keep only last 40 messages in conversation history
      if (conversation.messages.length > 40) {
        conversation.messages = conversation.messages.slice(-40);
      }

      userConversations.set(userID, conversation);

      if (typeof aiMessage === 'string' && aiMessage.trim().length > 0) {
          await message.reply(aiMessage, (err, info) => {
              if (info) {
                  global.GoatBot.onReply.set(info.messageID, {
                      commandName: this.config.name,
                      author: userID,
                      messageID: info.messageID,
                      sessionID: sessionID 
                  });
              }
          });
      } else {
          await message.reply("AI responded successfully, but the message was empty. Please try again.");
      }

    } catch (error) {
      let errorMsg = "An unknown error occurred while contacting the AI.";
      
      if (error.response) {
          errorMsg = `API Error: Status ${error.response.status}. The server may be unavailable.`;
      } else if (error.code === 'ECONNABORTED') {
          errorMsg = "Request timed out. The AI took too long to respond.";
      }

      await message.reply(`❌ AI Command Failed\n\nError: ${errorMsg}`);
    }
  }
};
