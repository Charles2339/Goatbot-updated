const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "economyquiz",
    aliases: ["ecoquiz", "economy"],
    version: "2.0",
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
      if (!fs.existsSync(filePath)) return message.reply("⚠️ Question file missing.");

      const questions = await fs.readJSON(filePath);
      const random = questions[Math.floor(Math.random() * questions.length)];

      const letters = ["A", "B", "C", "D"];
      let optionsMsg = "";
      random.options.forEach((opt, i) => {
        optionsMsg += `${letters[i]}. ${opt}\n`;
      });

      const msg = `💰 **ECONOMY QUIZ [${difficulty.toUpperCase()}]** 💰\n\nQuestion: ${random.question}\n\n${optionsMsg}\n━━━━━━━━━━━━━━━━━━\n✨ *Reply with A, B, C, or D*`;

      return message.reply(msg, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          authorID: event.senderID,
          correctAnswer: random.answer.toUpperCase(),
          questionID: info.messageID // Store this to unsend it later
        });
      });
    } catch (e) {
      return message.reply("⚠️ Error loading quiz content.");
    }
  },

  onReply: async function ({ message, Reply, event, api }) {
    const { authorID, correctAnswer, questionID } = Reply;
    if (event.senderID !== authorID) return;

    const userAnswer = event.body.trim().toUpperCase();
    const validChoices = ["A", "B", "C", "D"];

    if (!validChoices.includes(userAnswer)) {
      return message.reply("❌ Invalid choice! Please reply with A, B, C, or D.");
    }

    // Unsend the original question message
    api.unsendMessage(questionID);

    if (userAnswer === correctAnswer) {
      return message.reply(`✅ **CORRECT!**\nGood job, you picked the right option!`);
    } else {
      return message.reply(`❌ **WRONG!**\nThe correct answer was: **${correctAnswer}**`);
    }
  }
};
