module.exports = {
  config: {
    name: "ban",
    aliases: ["unban"],
    version: "2.0",
    author: "Charles MK",
    countDown: 5,
    role: 2,
    description: "Ban/Unban users from using the bot",
    category: "admin",
    guide: {
      en: "{pn} @user - Ban/unban tagged user\n" +
          "{pn} (reply) - Ban/unban replied user\n" +
          "{pn} [uid] - Ban/unban by UID\n" +
          "{pn} list - View all banned users"
    }
  },

  onStart: async function ({ api, event, args, usersData, message, globalData }) {
    const { threadID, messageID, messageReply, mentions, senderID } = event;

    // List banned users
    if (args[0] === "list") {
      const bannedList = await globalData.get("bannedUsers", "data", []);
      
      if (bannedList.length === 0) {
        return message.reply("✅ 𝖭𝗈 𝗎𝗌𝖾𝗋𝗌 𝖺𝗋𝖾 𝖼𝗎𝗋𝗋𝖾𝗇𝗍𝗅𝗒 𝖻𝖺𝗇𝗇𝖾𝖽");
      }

      let response = "🚫 𝗕𝗔𝗡𝗡𝗘𝗗 𝗨𝗦𝗘𝗥𝗦\n━━━━━━━━━━━━━━━━━━\n\n";
      
      for (const uid of bannedList) {
        const userName = await usersData.getName(uid);
        response += `👤 ${userName}\n   𝖴𝖨𝖣: ${uid}\n\n`;
      }

      response += `━━━━━━━━━━━━━━━━━━\n📊 𝖳𝗈𝗍𝖺𝗅: ${bannedList.length} 𝗎𝗌𝖾𝗋(𝗌)`;
      
      return message.reply(response);
    }

    // Determine target user
    let targetID = null;

    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args[0] && /^\d+$/.test(args[0])) {
      targetID = args[0];
    }

    if (!targetID) {
      return message.reply(
        "❌ 𝖯𝗅𝖾𝖺𝗌𝖾 𝗌𝗉𝖾𝖼𝗂𝖿𝗒 𝖺 𝗎𝗌𝖾𝗋\n\n" +
        "𝖴𝗌𝖺𝗀𝖾:\n" +
        "• +ban @user\n" +
        "• +ban (reply)\n" +
        "• +ban [uid]\n" +
        "• +ban list"
      );
    }

    // Prevent banning yourself or other admins
    const config = global.GoatBot.config;
    const adminBot = config.adminBot || [];

    if (targetID === senderID) {
      return message.reply("❌ 𝖸𝗈𝗎 𝖼𝖺𝗇'𝗍 𝖻𝖺𝗇 𝗒𝗈𝗎𝗋𝗌𝖾𝗅𝖿!");
    }

    if (adminBot.includes(targetID)) {
      return message.reply("❌ 𝖸𝗈𝗎 𝖼𝖺𝗇'𝗍 𝖻𝖺𝗇 𝖺𝗇𝗈𝗍𝗁𝖾𝗋 𝖻𝗈𝗍 𝖺𝖽𝗆𝗂𝗇!");
    }

    try {
      // Get current banned list
      let bannedData = await globalData.get("bannedUsers");
      
      // Initialize if doesn't exist
      if (!bannedData) {
        await globalData.create("bannedUsers", { data: [] });
        bannedData = { data: [] };
      }

      const bannedList = bannedData.data || [];
      const targetName = await usersData.getName(targetID);
      const isBanned = bannedList.includes(targetID);

      if (isBanned) {
        // Unban user
        const newList = bannedList.filter(id => id !== targetID);
        await globalData.set("bannedUsers", newList, "data");

        return message.reply(
          `✅ 𝗨𝗡𝗕𝗔𝗡𝗡𝗘𝗗\n` +
          `━━━━━━━━━━━━━━━━━━\n\n` +
          `👤 ${targetName}\n` +
          `🆔 ${targetID}\n\n` +
          `💚 𝖴𝗌𝖾𝗋 𝖼𝖺𝗇 𝗇𝗈𝗐 𝗎𝗌𝖾 𝗍𝗁𝖾 𝖻𝗈𝗍 𝖺𝗀𝖺𝗂𝗇`
        );
      } else {
        // Ban user
        const newList = [...bannedList, targetID];
        await globalData.set("bannedUsers", newList, "data");

        return message.reply(
          `🚫 𝗕𝗔𝗡𝗡𝗘𝗗\n` +
          `━━━━━━━━━━━━━━━━━━\n\n` +
          `👤 ${targetName}\n` +
          `🆔 ${targetID}\n\n` +
          `🔒 𝖴𝗌𝖾𝗋 𝗂𝗌 𝗇𝗈𝗐 𝖻𝖺𝗇𝗇𝖾𝖽 𝖿𝗋𝗈𝗆 𝗎𝗌𝗂𝗇𝗀 𝗍𝗁𝖾 𝖻𝗈𝗍`
        );
      }

    } catch (error) {
      console.error("Ban command error:", error);
      return message.reply(
        "❌ 𝖠𝗇 𝖾𝗋𝗋𝗈𝗋 𝗈𝖼𝖼𝗎𝗋𝗋𝖾𝖽\n\n" +
        `𝖤𝗋𝗋𝗈𝗋: ${error.message}`
      );
    }
  }
};
