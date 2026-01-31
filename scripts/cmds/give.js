module.exports = {
  config: {
    name: "give",
    aliases: ["pay", "transfer"],
    version: "1.0",
    author: "Charles MK",
    countDown: 5,
    role: 0,
    category: "economy",
    guide: {
      en: "{pn} [amount] (reply or tag/uid)"
    }
  },

  onStart: async function ({ api, event, args, usersData, message }) {
    const { senderID, messageReply, mentions } = event;

    // 1. Determine Target User and Amount
    let targetID;
    let amountStr;

    if (messageReply) {
      // Priority 1: Reply to a message
      targetID = messageReply.senderID;
      amountStr = args[0];
    } else if (Object.keys(mentions).length > 0) {
      // Priority 2: Tagging someone (e.g., +give @user 20000 or +give 20000 @user)
      targetID = Object.keys(mentions)[0];
      // Find the amount - it's the argument that's a valid number
      amountStr = args.find(arg => !isNaN(parseInt(arg)) && parseInt(arg) > 0);
    } else if (args.length >= 2) {
      // Priority 3: Using UID (e.g., +give 10000000 300)
      targetID = args[0];
      amountStr = args[1];
    }

    const amount = parseInt(amountStr);

    // 2. Validation Checks
    if (!targetID || isNaN(amount) || amount <= 0) {
      return message.reply("⚠️ 𝖯𝗅𝖾𝖺𝗌𝖾 𝖾𝗇𝗍𝖾𝗋 𝖺 𝗏𝖺𝗅𝗂𝖽 𝖺𝗆𝗈𝗎𝗇𝗍 𝖺𝗇𝖽 𝗌𝗉𝖾𝖼𝗂𝖿𝗒 𝖺 𝗎𝗌𝖾𝗋 (𝗋𝖾𝗉𝗅𝗒, 𝗍𝖺𝗀, 𝗈𝗋 𝖴𝖨𝖣).");
    }

    if (targetID == senderID) {
      return message.reply("🤡 𝖸𝗈𝗎 𝖼𝖺𝗇'𝗍 𝗀𝗂𝗏𝖾 𝗆𝗈𝗇𝖾𝗒 𝗍𝗈 𝗒𝗈𝗎𝗋𝗌𝖾𝗅𝖿, 𝗇𝗂𝖼𝖾 𝗍𝗋𝗒.");
    }

    const senderData = await usersData.get(senderID);
    const receiverData = await usersData.get(targetID);

    if (!receiverData) {
      return message.reply("❌ 𝖴𝗌𝖾𝗋 𝗇𝗈𝗍 𝖿𝗈𝗎𝗇𝖽 𝗂𝗇 𝗍𝗁𝖾 𝖽𝖺𝗍𝖺𝖻𝖺𝗌𝖾.");
    }

    if (senderData.money < amount) {
      return message.reply(`💸 𝖸𝗈𝗎 𝖺𝗋𝖾 𝗍𝗈𝗈 𝗉𝗈𝗈𝗋! 𝖸𝗈𝗎 𝗇𝖾𝖾𝖽 $${(amount - senderData.money).toLocaleString()} 𝗆𝗈𝗋𝖾.`);
    }

    // 3. Logic & Reward Calculation
    const reward = Math.floor(amount * 0.06); // 6% Reward

    // Update Receiver
    await usersData.set(targetID, {
      money: (receiverData.money || 0) + amount
    });

    // Update Sender (Subtract amount, then add reward)
    const finalSenderMoney = (senderData.money - amount) + reward;
    await usersData.set(senderID, {
      money: finalSenderMoney
    });

    // 4. Send Styled Success Message
    const senderName = senderData.name;
    const receiverName = receiverData.name;

    return api.sendMessage(
      `💸 𝗧𝗥𝗔𝗡𝗦𝗙𝗘𝗥 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `👤 𝖥𝗋𝗈𝗆: ${senderName}\n` +
      `👤 𝖳𝗈: ${receiverName}\n` +
      `💰 𝖠𝗆𝗈𝗎𝗇𝗍: $${amount.toLocaleString()}\n\n` +
      `🎁 𝖦𝖾𝗇𝖾𝗋𝗈𝗌𝗂𝗍𝗒 𝖱𝖾𝗐𝖺𝗋𝖽: $${reward.toLocaleString()} (6%)\n` +
      `💳 𝖸𝗈𝗎𝗋 𝖭𝖾𝗐 𝖡𝖺𝗅𝖺𝗇𝖼𝖾: $${finalSenderMoney.toLocaleString()}\n` +
      `━━━━━━━━━━━━━━━━━━`,
      event.threadID,
      event.messageID
    );
  }
};
