const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "geography",
    aliases: ["geo"],
    version: "1.0",
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
      return message.reply("❌ Please choose: +geography easy, mid, or hard.");
    }

    try {
      const filePath = path.join(__dirname, "geography", `${difficulty}.json`);
      if (!fs.existsSync(filePath)) return message.reply("⚠️ Question file missing in /cmds/geography/");

      const questions = await fs.readJSON(filePath);
      const random = questions[Math.floor(Math.random() * questions.length)];

      const letters = ["A", "B", "C", "D"];
      let optionsMsg = "";
      random.options.forEach((opt, i) => {
        optionsMsg += `${letters[i]}. ${opt}\n`;
      });

      const rewards = { easy: 500, mid: 1200, hard: 2300 };
      const penalties = { easy: 200, mid: 300, hard: 700 };

      const msg = `🌍 **GEOGRAPHY QUIZ [${difficulty.toUpperCase()}]** 🌍\n\nQuestion: ${random.question}\n\n${optionsMsg}\n━━━━━━━━━━━━━━━━━━\n✨ *Reply with A, B, C, or D*`;

      return message.reply(msg, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          authorID: event.senderID,
          correctAnswer: random.answer.toUpperCase(),
          questionID: info.messageID,
          reward: rewards[difficulty],
          penalty: penalties[difficulty]
        });
      });
    } catch (e) {
      return message.reply("⚠️ Error loading geography content.");
    }
  },

  onReply: async function ({ message, Reply, event, api, usersData }) {
    const { authorID, correctAnswer, questionID, reward, penalty } = Reply;
    if (event.senderID !== authorID) return;

    const userAnswer = event.body.trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(userAnswer)) return;

    api.unsendMessage(questionID);

    const userData = await usersData.get(authorID);
    const expGain = Math.floor(Math.random() * 51) + 50; 

    if (userAnswer === correctAnswer) {
      const newMoney = (userData.money || 0) + reward;
      const newExp = (userData.exp || 0) + expGain;
      await usersData.set(authorID, { money: newMoney, exp: newExp });

      return message.reply(`✅ **𝘾𝙊𝙍𝙍𝙀𝘾𝙏**\n\n𝙔𝙊𝙐 𝙀𝘼𝙍𝙉𝙀𝘿: $${reward} 💵\n𝙀𝙓𝙋 + ${expGain} ⏏️\n𝐍𝐄𝐖 𝐁𝐀𝐋𝐀𝐍𝐂𝐄: $${newMoney.toLocaleString()}`);
    } else {
      const newMoney = Math.max(0, (userData.money || 0) - penalty);
      await usersData.set(authorID, { money: newMoney });

      return message.reply(`❌ **𝙄𝙉𝘾𝙊𝙍𝙍𝙀𝘾𝙏**\n\n𝙏𝙝𝙚 𝙖𝙣𝙨𝙬𝙚𝙧 𝙬𝙖𝙨: ${correctAnswer}\n𝙔𝙊𝙐 𝙇𝙊𝙎𝙏: $${penalty} 📉\n𝐍𝐄𝐖 𝐁𝐀𝐋𝐀𝐍𝐂𝐄: $${newMoney.toLocaleString()}`);
    }
  }
};
