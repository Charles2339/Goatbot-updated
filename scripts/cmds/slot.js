module.exports = {
  config: {
    name: "slot",
    aliases: ["slots"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 5,
    role: 0,
    description: {
      en: "Bet your money and try your luck (60% win chance)"
    },
    category: "game",
    guide: {
      en: "{pn} <amount>\nExample: {pn} 50"
    }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;

    const bet = parseInt(args[0]);
    if (!bet || bet <= 0) {
      return message.reply("❌ Please enter a valid amount.\nExample: +slot 50");
    }

    const userData = await usersData.get(senderID);
    const balance = userData.money || 0;

    if (bet > balance) {
      return message.reply(
        `❌ You don't have enough money.\n💰 Your balance: $${balance}`
      );
    }

    // 60% win chance
    const win = Math.random() < 0.6;

    if (win) {
      await usersData.set(senderID, {
        money: balance + bet,
        exp: userData.exp,
        data: userData.data
      });

      return message.reply(
        `🎰 SLOT MACHINE 🎰\n\n✅ YOU WON!\n💵 Bet: $${bet}\n🏆 Won: $${bet}\n💰 New Balance: $${balance + bet}`
      );
    } else {
      await usersData.set(senderID, {
        money: balance - bet,
        exp: userData.exp,
        data: userData.data
      });

      return message.reply(
        `🎰 SLOT MACHINE 🎰\n\n❌ YOU LOST!\n💵 Lost: $${bet}\n💰 New Balance: $${balance - bet}`
      );
    }
  }
};
