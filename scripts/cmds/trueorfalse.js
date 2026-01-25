const axios = require('axios');

module.exports = {
  config: {
    name: "tof",
    aliases: ["trueorfalse", "quiz"],
    version: "1.2",
    author: "Charles MK",
    countDown: 5,
    role: 0,
    description: { en: "High-stakes T/F quiz with Streak Bonuses!" },
    category: "game",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, event, api }) {
    try {
      const res = await axios.get("https://opentdb.com/api.php?amount=1&type=boolean");
      const data = res.data.results[0];
      
      const question = data.question
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&");
      const correctAnswer = data.correct_answer;

      const msg = `🧩 𝗧𝗥𝗨𝗘 𝗢𝗥 𝗙𝗔𝗟𝗦𝗘\n\n💭 𝗤𝘂𝖾𝗌𝗍𝗂𝗼𝗻: *${question}*\n\n❤️: **True**\n👍: **False**\n\n⏰ *30 seconds to react!*`;

      const info = await message.reply(msg);

      global.GoatBot.onReaction.set(info.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        messageID: info.messageID,
        correctAnswer: correctAnswer,
        status: "active"
      });

      setTimeout(() => {
        if (global.GoatBot.onReaction.has(info.messageID)) {
          global.GoatBot.onReaction.delete(info.messageID);
          api.sendMessage("⏰ *Time's up! The window to answer has closed.*", event.threadID);
        }
      }, 30000);

    } catch (e) {
      return message.reply("❌ *Couldn't fetch a question. Please try again!*");
    }
  },

  onReaction: async function ({ api, event, Reaction, usersData }) {
    if (!Reaction || Reaction.status !== "active") return;
    if (event.userID !== Reaction.author) return;

    const reaction = event.reaction;
    let userChoice = "";

    if (reaction === "❤️") userChoice = "True";
    else if (reaction === "👍") userChoice = "False";
    else return;

    global.GoatBot.onReaction.delete(Reaction.messageID);

    const isCorrect = userChoice === Reaction.correctAnswer;
    const user = await usersData.get(event.userID);
    
    if (!user.data) user.data = {};
    if (!user.data.tofStats) user.data.tofStats = { correct: 0, wrong: 0, streak: 0 };
    
    const stats = user.data.tofStats;

    if (isCorrect) {
      stats.correct++;
      stats.streak++;
      
      let rewardMoney = Math.floor(Math.random() * 5001) + 10000;
      let rewardExp = 150;
      let streakMsg = "";

      // --- STREAK LOGIC ---
      if (stats.streak === 5) {
        rewardMoney += 25000;
        rewardExp += 120;
        stats.streak = 0; // Reset streak after payout
        streakMsg = "\n🔥 ***MEGA STREAK BONUS: +$25,000 & +120 EXP!***";
      }

      const updatedUser = await usersData.set(event.userID, {
        money: (user.money || 0) + rewardMoney,
        exp: (user.exp || 0) + rewardExp,
        data: user.data
      });

      return api.sendMessage(
        `✅ 𝘾𝙊𝙍𝙍𝙀𝘾𝙏!${streakMsg}\n\n𝙀𝘼𝙍𝙉𝙀𝘿: **$${rewardMoney.toLocaleString()}**\n𝙀𝙓𝙋: **+${rewardExp}**\n\n📊 𝙎𝙏𝘼𝙏𝙎:\n✅ Correct: *${stats.correct}*\n❌ Incorrect: *${stats.wrong}*\n🔥 Current Streak: *${stats.streak}*\n\n𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐁𝐀𝐋𝐀𝐍𝐂𝐄: **$${updatedUser.money.toLocaleString()}**`,
        event.threadID,
        event.messageID
      );
    } else {
      stats.wrong++;
      stats.streak = 0; // Streak breaks on wrong answer
      await usersData.set(event.userID, { data: user.data });

      return api.sendMessage(
        `𝙄𝙉𝘾𝙊𝙍𝙍𝙀𝘾𝙏\n\n𝙅𝙐𝙎𝙏𝙄𝙁𝙄𝘾𝘼𝙏𝙄𝙊𝙉: *The correct answer was ${Reaction.correctAnswer}*\n𝙀𝘼𝙍𝙉𝙀𝘿: **$0**\n𝙀𝙓𝙋: **+0**\n\n📊 𝙎𝙏𝘼𝙏𝙎:\n✅ Correct: *${stats.correct}*\n❌ Incorrect: *${stats.wrong}*\n🔥 Streak: *Reset to 0*\n\n𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐁𝐀𝐋𝐀𝐍𝐂𝐄: **$${(user.money || 0).toLocaleString()}**`,
        event.threadID,
        event.messageID
      );
    }
  }
};
