module.exports = {
  config: {
    name: "slot",
    aliases: ["slots"],
    version: "1.8",
    author: "CharlesMK",
    countDown: 5,
    role: 0,
    description: {
      en: "Spin the slot machine and win money!"
    },
    category: "game",
    guide: {
      en: "{pn} <amount>\nExample: {pn} 50"
    }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;

    const spinAmount = parseInt(args[0]);
    if (!spinAmount || spinAmount <= 0) {
      return message.reply("❌ Please enter a valid amount.\nExample: +slot 50");
    }

    const userData = await usersData.get(senderID);
    const balance = userData.money || 0;

    if (spinAmount > balance) {
      return message.reply(
        `❌ You don't have enough money to spin $${spinAmount}.\n💰 Your balance: $${balance}`
      );
    }

    const slots = ["🍒", "🍋", "🍉", "💎", "7️⃣"];
    const spin = () => slots[Math.floor(Math.random() * slots.length)];
    
    const reel1 = spin();
    const reel2 = spin();
    const reel3 = spin();
    const reelDisplay = `🎰 [ ${reel1} | ${reel2} | ${reel3} ]`;

    const chance = Math.random();
    let reward = 0;
    let resultText = "";

    if (chance < 0.1) {
      // JACKPOT 10% - 6x multiplier
      reward = spinAmount * 6;
      resultText = `${reelDisplay}\n\n🎉 𝙅𝘼𝘾𝙆𝙋𝙊𝙏!! $${reward}!\n(｀💳ω💳´)`;
    } else if (chance < 0.6) {
      // NORMAL WIN 50% - 2x multiplier
      reward = spinAmount * 2;
      resultText = `${reelDisplay}\n\n🎉 𝙔𝙊𝙐 𝙒𝙊𝙉 $${reward}!\n👌( ･ㅂ･)و💰`;
    } else {
      // LOSS 40%
      reward = -spinAmount;
      resultText = `${reelDisplay}\n\n🎉 𝙔𝙊𝙐 𝙇𝙊𝙎𝙏 $${spinAmount}!\n(´༎ຶ ͜ʖ ༎ຶ \`)💸`;
    }

    const newBalance = balance + reward;

    await usersData.set(senderID, {
      money: newBalance,
      exp: userData.exp,
      data: userData.data
    });

    return message.reply(`${resultText}\n\n💰 𝐓𝐎𝐓𝐀𝐋 𝐁𝐀𝐋𝐀𝐍𝐂𝐄: $${newBalance}`);
  }
};
