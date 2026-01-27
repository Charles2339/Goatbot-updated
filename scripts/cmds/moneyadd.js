module.exports = {
  config: {
    name: "editmoney",
    aliases: ["moneyadd", "moneyremove", "addmoney", "removemoney"],
    version: "1.2",
    author: "Charles MK",
    countDown: 2,
    role: 2, // Admin only - strictly restricted to prevent economy abuse
    description: { en: "Add or remove money from a user's balance." },
    category: "admin",
    guide: { en: "{pn}add <uid | @tag | reply> <amount>\n{pn}remove <uid | @tag | reply> <amount>" }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const action = args[0]?.toLowerCase();
    if (!["add", "remove"].includes(action)) {
      return message.reply("❌ **INVALID SYNTAX**\n\nUse: **+money add [target] [amount]**\nOr: **+money remove [target] [amount]**");
    }

    let targetID;
    let amountStr;

    // 1. Check if replying to a message
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
      amountStr = args[1];
    }
    // 2. Check if tagging someone
    else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      amountStr = args[args.length - 1]; // Amount is usually the last argument
    }
    // 3. Check if using UID
    else if (args[1] && !isNaN(args[1])) {
      targetID = args[1];
      amountStr = args[2];
    }

    const amount = parseInt(amountStr?.replace(/,/g, ""));

    if (!targetID || isNaN(amount) || amount <= 0) {
      return message.reply("❌ **ERROR**\n\nPlease provide a valid user and a positive number amount.");
    }

    try {
      const userData = await usersData.get(targetID);
      if (!userData) return message.reply("❌ **User not found in database.**");

      let currentMoney = userData.money || 0;
      let newBalance;
      let statusIcon;

      if (action === "add") {
        newBalance = currentMoney + amount;
        statusIcon = "💰";
      } else {
        newBalance = Math.max(0, currentMoney - amount);
        statusIcon = "💸";
      }

      await usersData.set(targetID, { money: newBalance });

      const targetName = userData.name || targetID;
      
      return message.reply(
        `${statusIcon} **ECONOMY UPDATE**\n\n` +
        `User: **${targetName}**\n` +
        `Action: **${action.toUpperCase()}**\n` +
        `Amount: **$${amount.toLocaleString()}**\n\n` +
        `New Balance: **$${newBalance.toLocaleString()}**`
      );
    } catch (err) {
      return message.reply(`❌ **Database Error:** ${err.message}`);
    }
  }
};
