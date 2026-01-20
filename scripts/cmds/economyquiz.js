const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "economyquiz",
    aliases: ["ecoquiz", "economy"],
    version: "2.5",
    author: "Charles MK",
    countDown: 5,
    role: 0,
    category: "game",
    guide: { en: "{pn} easy | mid | hard" }
  },

  onStart: async function ({ args, message, event, commandName, api }) {
    const difficulty = args[0]?.toLowerCase();
    const validLevels = ["easy", "mid", "hard"];

    if (!validLevels.includes(difficulty)) {
      return message.reply("❌ Please choose: +economy easy, mid, or hard.");
    }

    try {
      const filePath = path.join(__dirname, "economyquiz", `${difficulty}.json`);
      if (!fs.existsSync(filePath)) return message.reply("⚠️ Question file missing in /cmds/economyquiz/");

      const questions = await fs.readJSON(filePath);
      const random = questions[Math.floor(Math.random() * questions.length)];

      const letters = ["A", "B", "C", "D"];
      let optionsMsg = "";
      random.options.forEach((opt, i) => {
        optionsMsg += `${letters[i]}. ${opt}\n`;
      });

      const rewards = { easy: 500, mid: 1200, hard: 2300 };
      const penalties = { easy: 200, mid: 300, hard: 700 };

      const msg = `💰 **ECONOMY QUIZ [${difficulty.toUpperCase()}]** 💰\n\nQuestion: ${random.question}\n\n${optionsMsg}\n━━━━━━━━━━━━━━━━━━\n🎁 Reward: $${rewards[difficulty]}\n💀 Penalty: -$${penalties[difficulty]}\n\n✨ *Reply with A, B, C, or D*`;

      return message.reply(msg, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          authorID: event.senderID,
          correctAnswer: random.answer.toUpperCase(),
          questionID: info.messageID,
          difficulty,
          reward: rewards[difficulty],
          penalty: penalties[difficulty]
        });
      });
    } catch (e) {
      return message.reply("⚠️ Error loading quiz content.");
    }
  },

  onReply: async function ({ message, Reply, event, api, usersData }) {
    const { authorID, correctAnswer, questionID, reward, penalty } = Reply;
    if (event.senderID !== authorID) return;

    const userAnswer = event.body.trim().toUpperCase();
    const validChoices = ["A", "B", "C", "D"];

    if (!validChoices.includes(userAnswer)) return;

    // Unsend the question
    api.unsendMessage(questionID);

    const userData = await usersData.get(authorID);
    const currentMoney = userData.money || 0;

    if (userAnswer === correctAnswer) {
      await usersData.set(authorID, { money: currentMoney + reward });
      return message.reply(`✅ **CORRECT!**\n\nYou earned **$${reward}**! Your new balance is saved to MongoDB.`);
    } else {
      const newBalance = Math.max(0, currentMoney - penalty);
      await usersData.set(authorID, { money: newBalance });
      return message.reply(`❌ **WRONG!**\n\nThe correct answer was **${correctAnswer}**.\nYou lost **$${penalty}**. Balance updated.`);
    }
  }
};
