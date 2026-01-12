module.exports = {
  name: "slot",
  aliases: ["slots"],
  description: "Bet your money and try your luck 🎰",
  usage: "+slot <amount>",
  cooldown: 5,

  async run({ event, args, usersData, api }) {
    const { senderID, threadID } = event;

    // Get bet amount
    const bet = parseInt(args[0]);

    if (!bet || bet <= 0) {
      return api.sendMessage(
        "❌ Please enter a valid amount.\nExample: +slot 50",
        threadID
      );
    }

    // Get user's current money
    const userMoney = await usersData.get(senderID, "money") || 0;

    // Check if user has enough money
    if (bet > userMoney) {
      return api.sendMessage(
        `❌ You don't have enough money.\n💰 Your balance: $${userMoney}`,
        threadID
      );
    }

    // Slot chances
    const winChance = Math.random() < 0.6; // 60% win, 40% lose

    if (winChance) {
      const winnings = bet * 2;
      await usersData.set(senderID, userMoney + bet, "money");

      return api.sendMessage(
        `🎰 SLOT MACHINE 🎰\n\n✅ You WON!\n💵 Bet: $${bet}\n🏆 Won: $${winnings}\n💰 New Balance: $${userMoney + bet}`,
        threadID
      );
    } else {
      await usersData.set(senderID, userMoney - bet, "money");

      return api.sendMessage(
        `🎰 SLOT MACHINE 🎰\n\n❌ You LOST!\n💵 Lost: $${bet}\n💰 New Balance: $${userMoney - bet}`,
        threadID
      );
    }
  }
};
