module.exports = {
  config: {
    name: "editmoney",
    aliases: ["moneyadd", "moneyremove", "addmoney", "removemoney"],
    version: "1.3",
    author: "Charles MK",
    countDown: 2,
    role: 2,
    description: { en: "Add or remove money from a user's balance." },
    category: "admin",
    guide: { en: "{pn} add [amount] | {pn} remove [amount]" }
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
      amountStr = args[args.length - 1]; 
    }
    // 3. Check if UID is provided (UIDs are usually long numbers)
    else if (args[1] && args[1].length > 10 && !isNaN(args[1])) {
      targetID = args[1];
      amountStr = args[2];
    }
    // 4. Default to SENDER if only amount is provided
    else {
      targetID = event.senderID;
      amountStr = args[1];
    }

    const amount = parseInt(amountStr?.replace(/,/g, ""));

    if (isNaN(amount) || amount <= 0) {
      return message.reply("❌ **ERROR**\n\nPlease provide a positive number amount.\n\nExample: **+money add 50000**");
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
      const targetName = userData.name || "User";
      
      return message.reply(
        `${statusIcon} **ECONOMY UPDATE**\n\n` +
        `Target: **${targetName}**\n` +
        `Action: **${action.toUpperCase()}**\n` +
        `Amount: **$${amount.toLocaleString()}**\n\n` +
        `New Balance: **$${newBalance.toLocaleString()}**`
      );
    } catch (err) {
      return message.reply(`❌ **Database Error:** ${err.message}`);
    }
  }
};
