module.exports = {
  config: {
    name: "restrict",
    aliases: ["unrestrict", "restricted"],
    version: "1.0.0",
    author: "Gemini",
    countDown: 5,
    role: 2, // Bot Admin/Owner only
    description: "Restrict users or commands from being used.",
    category: "admin",
    guide: {
      en: "{pn} [tag/reply/UID] [command] - Block user from command\n" +
          "{pn} [command] - Make command Admin-only\n" +
          "+unrestrict [tag/reply/UID] [command] - Lift user block\n" +
          "+unrestrict [command] - Lift Admin-only block\n" +
          "+restricted commands - Show all blocks"
    }
  },

  onStart: async function ({ api, event, message, args, usersData, threadsData }) {
    const { threadID, messageID, senderID, type, messageReply, mentions } = event;
    const commandName = this.config.name;
    const body = event.body.toLowerCase();

    // 1. Handle "+restricted commands" (List all)
    if (args[0] === "commands") {
      const data = await threadsData.get(threadID);
      const res = data.data.restrictions || { users: {}, global: [] };
      
      let msg = "🚫 **𝗖𝗨𝗥𝗥𝗘𝗡𝗧 𝗥𝗘𝗦𝗧𝗥𝗜𝗖𝗧𝗜𝗢𝗡𝗦**\n━━━━━━━━━━━━━━━━━━━━━━\n";
      
      if (res.global.length > 0) {
        msg += `👑 **𝗔𝗱𝗺𝗶𝗻-𝗢𝗻𝗹𝘆**: ${res.global.join(", ")}\n`;
      }
      
      const userIds = Object.keys(res.users);
      if (userIds.length > 0) {
        msg += `👤 **𝗨𝘀𝗲𝗿 𝗕𝗹𝗼𝗰𝗸𝘀**:\n`;
        for (const id of userIds) {
          const name = await usersData.getName(id);
          msg += `- ${name}: ${res.users[id].join(", ")}\n`;
        }
      }

      if (res.global.length === 0 && userIds.length === 0) msg += "No active restrictions.";
      return message.reply(msg);
    }

    // 2. Logic to determine Target and Command
    let targetID, targetCommand;

    if (type === "message_reply") {
      targetID = messageReply.senderID;
      targetCommand = args[0];
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      targetCommand = args.slice(1).join(" "); // Command name after tag
    } else if (args.length === 2 && /^\d+$/.test(args[0])) {
      targetID = args[0];
      targetCommand = args[1];
    } else {
      // Global restriction (Admin only)
      targetCommand = args[0];
      targetID = null;
    }

    if (!targetCommand) return message.reply("❌ **𝗘𝗿𝗿𝗼𝗿**: Please specify a command name.");

    // Load data
    const threadData = await threadsData.get(threadID);
    if (!threadData.data.restrictions) threadData.data.restrictions = { users: {}, global: [] };
    const res = threadData.data.restrictions;

    // 3. Handle UNRESTRICT
    if (body.startsWith(global.GoatBot.config.prefix + "unrestrict")) {
      if (targetID) {
        if (res.users[targetID]) {
          res.users[targetID] = res.users[targetID].filter(cmd => cmd !== targetCommand);
          if (res.users[targetID].length === 0) delete res.users[targetID];
        }
        message.reply(`✅ **𝗨𝗻𝗿𝗲𝘀𝘁𝗿𝗶𝗰𝘁𝗲𝗱**: User can now use '${targetCommand}'.`);
      } else {
        res.global = res.global.filter(cmd => cmd !== targetCommand);
        message.reply(`✅ **𝗨𝗻𝗿𝗲𝘀𝘁𝗿𝗶𝗰𝘁𝗲𝗱**: '${targetCommand}' is now available to everyone.`);
      }
    } 
    // 4. Handle RESTRICT
    else {
      if (targetID) {
        if (!res.users[targetID]) res.users[targetID] = [];
        if (!res.users[targetID].includes(targetCommand)) res.users[targetID].push(targetCommand);
        message.reply(`🚫 **𝗥𝗲𝘀𝘁𝗿𝗶𝗰𝘁𝗲𝗱**: User is blocked from using '${targetCommand}'.`);
      } else {
        if (!res.global.includes(targetCommand)) res.global.push(targetCommand);
        message.reply(`👑 **𝗔𝗱𝗺𝗶𝗻-𝗢𝗻𝗹𝘆**: '${targetCommand}' is now restricted to Bot Admins.`);
      }
    }

    await threadsData.set(threadID, threadData);
  }
};
