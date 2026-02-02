module.exports = {
  config: {
    name: "commandGuard",
    version: "1.0.0",
    author: "Gemini",
    category: "events"
  },

  onStart: async function ({ event, message, threadsData, role }) {
    if (event.type !== "message" && event.type !== "message_reply") return;

    const prefix = global.GoatBot.config.prefix;
    if (!event.body || !event.body.startsWith(prefix)) return;

    // Get the command name from the message
    const commandName = event.body.slice(prefix.length).split(" ")[0].toLowerCase();
    
    // Skip checking the "restrict" or "unrestrict" commands themselves so you don't lock yourself out
    if (["restrict", "unrestrict", "restricted"].includes(commandName)) return;

    const threadData = await threadsData.get(event.threadID);
    const res = threadData.data.restrictions;

    if (res) {
      // 1. Check User-specific restriction
      if (res.users && res.users[event.senderID] && res.users[event.senderID].includes(commandName)) {
        message.reply(`🚫 **𝗬𝗼𝘂 𝗮𝗿𝗲 𝗿𝗲𝘀𝘁𝗿𝗶𝗰𝘁𝗲𝗱 𝗳𝗿𝗼𝗺 𝘂𝘀𝗶𝗻𝗴 '${commandName}'.**`);
        // We stop the command by "throwing" or just return. 
        // In GoatBot's current handler, you may need to use event.stopImmediatePropagation() if supported, 
        // otherwise, this serves as a warning.
        return;
      }

      // 2. Check Global/Admin-only restriction
      if (res.global && res.global.includes(commandName) && role < 2) {
        message.reply(`👑 **'${commandName}' 𝗶𝘀 𝗰𝘂𝗿𝗿𝗲𝗻𝘁𝗹𝘆 𝗿𝗲𝘀𝘁𝗿𝗶𝗰𝘁𝗲𝗱 𝘁𝗼 𝗕𝗼𝘁 𝗔𝗱𝗺𝗶𝗻𝘀.**`);
        return;
      }
    }
  }
};

