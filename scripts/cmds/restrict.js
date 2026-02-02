module.exports = {
  config: {
    name: "restrict",
    aliases: ["unrestrict", "restricted"],
    version: "2.0",
    author: "Charles MK",
    countDown: 5,
    role: 2,
    description: "Restrict users or commands from being used",
    category: "admin",
    guide: {
      en: "{pn} @user {command} - Block user from command\n" +
          "{pn} {command} - Make command admin-only\n" +
          "unrestrict @user {command} - Unblock user from command\n" +
          "unrestrict {command} - Remove admin-only restriction\n" +
          "restricted commands - Show all restrictions"
    }
  },

  onStart: async function ({ api, event, message, args, usersData, threadsData, commandName }) {
    const { threadID, messageReply, mentions } = event;
    const isUnrestrict = commandName === "unrestrict";
    const isListCommands = commandName === "restricted" || (args[0] === "commands");

    // 1. List all restrictions
    if (isListCommands) {
      const threadData = await threadsData.get(threadID);
      const restrictions = threadData.data?.restrictions || { users: {}, global: [] };

      let response = "🚫 𝗖𝗨𝗥𝗥𝗘𝗡𝗧 𝗥𝗘𝗦𝗧𝗥𝗜𝗖𝗧𝗜𝗢𝗡𝗦\n━━━━━━━━━━━━━━━━━━\n\n";

      // Admin-only commands
      if (restrictions.global?.length > 0) {
        response += "👑 𝗔𝗱𝗺𝗶𝗻-𝗢𝗻𝗹𝘆 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀:\n";
        restrictions.global.forEach(cmd => response += `   • ${cmd}\n`);
        response += "\n";
      }

      // User-specific restrictions
      const userIDs = Object.keys(restrictions.users || {});
      if (userIDs.length > 0) {
        response += "👤 𝗨𝘀𝗲𝗿 𝗥𝗲𝘀𝘁𝗿𝗶𝗰𝘁𝗶𝗼𝗻𝘀:\n\n";
        
        for (const userID of userIDs) {
          const userName = await usersData.getName(userID);
          const commands = restrictions.users[userID];
          
          if (commands.length > 0) {
            response += `👤 ${userName}:\n`;
            commands.forEach(cmd => response += `   • ${cmd}\n`);
            response += "\n";
          }
        }
      }

      if (restrictions.global?.length === 0 && userIDs.length === 0) {
        response += "✅ 𝖭𝗈 𝖺𝖼𝗍𝗂𝗏𝖾 𝗋𝖾𝗌𝗍𝗋𝗂𝖼𝗍𝗂𝗈𝗇𝗌";
      }

      return message.reply(response);
    }

    // 2. Determine target user and command
    let targetID = null;
    let targetCommand = null;

    if (messageReply) {
      targetID = messageReply.senderID;
      targetCommand = args[0];
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
      targetCommand = args.find(arg => !Object.values(mentions).some(name => arg.includes(name)));
    } else if (args.length >= 2 && /^\d+$/.test(args[0])) {
      targetID = args[0];
      targetCommand = args[1];
    } else if (args.length >= 1) {
      targetCommand = args[0];
    }

    if (!targetCommand) {
      return message.reply("❌ 𝖯𝗅𝖾𝖺𝗌𝖾 𝗌𝗉𝖾𝖼𝗂𝖿𝗒 𝖺 𝖼𝗈𝗆𝗆𝖺𝗇𝖽 𝗇𝖺𝗆𝖾");
    }

    // Remove + prefix if included
    targetCommand = targetCommand.replace(/^\+/, '').toLowerCase();

    // 3. Load and initialize restrictions
    const threadData = await threadsData.get(threadID);
    if (!threadData.data) threadData.data = {};
    if (!threadData.data.restrictions) {
      threadData.data.restrictions = { users: {}, global: [] };
    }
    
    const restrictions = threadData.data.restrictions;

    // 4. Handle unrestrict
    if (isUnrestrict) {
      if (targetID) {
        // Unrestrict user from command
        if (!restrictions.users[targetID] || !restrictions.users[targetID].includes(targetCommand)) {
          return message.reply(`⚠️ 𝖴𝗌𝖾𝗋 𝗂𝗌 𝗇𝗈𝗍 𝗋𝖾𝗌𝗍𝗋𝗂𝖼𝗍𝖾𝖽 𝖿𝗋𝗈𝗆 ${targetCommand}`);
        }

        restrictions.users[targetID] = restrictions.users[targetID].filter(cmd => cmd !== targetCommand);
        
        if (restrictions.users[targetID].length === 0) {
          delete restrictions.users[targetID];
        }

        const userName = await usersData.getName(targetID);
        await threadsData.set(threadID, threadData);
        
        return message.reply(`✅ 𝖴𝗇𝗋𝖾𝗌𝗍𝗋𝗂𝖼𝗍𝖾𝖽 ${userName} 𝖿𝗋𝗈𝗆 ${targetCommand}`);
      } else {
        // Remove admin-only restriction
        if (!restrictions.global.includes(targetCommand)) {
          return message.reply(`⚠️ ${targetCommand} 𝗂𝗌 𝗇𝗈𝗍 𝗋𝖾𝗌𝗍𝗋𝗂𝖼𝗍𝖾𝖽 𝗍𝗈 𝖺𝖽𝗆𝗂𝗇𝗌`);
        }

        restrictions.global = restrictions.global.filter(cmd => cmd !== targetCommand);
        await threadsData.set(threadID, threadData);
        
        return message.reply(`🔓 ${targetCommand} 𝗂𝗌 𝗇𝗈𝗐 𝖺𝗏𝖺𝗂𝗅𝖺𝖻𝗅𝖾 𝗍𝗈 𝖾𝗏𝖾𝗋𝗒𝗈𝗇𝖾`);
      }
    }

    // 5. Handle restrict
    if (targetID) {
      // Restrict user from command
      if (!restrictions.users[targetID]) {
        restrictions.users[targetID] = [];
      }

      if (restrictions.users[targetID].includes(targetCommand)) {
        return message.reply(`⚠️ 𝖴𝗌𝖾𝗋 𝗂𝗌 𝖺𝗅𝗋𝖾𝖺𝖽𝗒 𝗋𝖾𝗌𝗍𝗋𝗂𝖼𝗍𝖾𝖽 𝖿𝗋𝗈𝗆 ${targetCommand}`);
      }

      restrictions.users[targetID].push(targetCommand);
      await threadsData.set(threadID, threadData);

      const userName = await usersData.getName(targetID);
      return message.reply(`🚫 𝖱𝖾𝗌𝗍𝗋𝗂𝖼𝗍𝖾𝖽 ${userName} 𝖿𝗋𝗈𝗆 ${targetCommand}`);
    } else {
      // Restrict command to admins only
      if (restrictions.global.includes(targetCommand)) {
        return message.reply(`⚠️ ${targetCommand} 𝗂𝗌 𝖺𝗅𝗋𝖾𝖺𝖽𝗒 𝗋𝖾𝗌𝗍𝗋𝗂𝖼𝗍𝖾𝖽 𝗍𝗈 𝖺𝖽𝗆𝗂𝗇𝗌`);
      }

      restrictions.global.push(targetCommand);
      await threadsData.set(threadID, threadData);
      
      return message.reply(`👑 ${targetCommand} 𝗂𝗌 𝗇𝗈𝗐 𝖺𝖽𝗆𝗂𝗇-𝗈𝗇𝗅𝗒`);
    }
  }
};
