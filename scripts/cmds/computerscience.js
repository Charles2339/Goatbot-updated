const fs = require('fs-extra');
const path = __dirname + '/cs_questions.json';

module.exports = {
  config: {
    name: "computerscience",
    aliases: ["cs", "csquiz", "quiz computer"],
    version: "1.6",
    author: "CharlesMK",
    countDown: 3,
    role: 0,
    description: { en: "Answer computer science questions and earn money + EXP!" },
    category: "game",
    guide: {
      en: "{pn} <difficulty>\nUnsend enabled: The question disappears once you answer!"
    }
  },

  onStart: async function ({ args, message, event }) {
    const senderID = event.senderID;
    if (!fs.existsSync(path)) return message.reply("❌ Error: 'cs_questions.json' not found.");

    const allQuestions = JSON.parse(fs.readFileSync(path, 'utf-8'));
    const difficulty = args[0]?.toLowerCase();

    if (!difficulty || !allQuestions[difficulty]) {
      return message.reply("💻 Choose: easy, mid, hard, or hell");
    }

    const rewards = {
      easy: { money: 500, exp: 25, time: 30 },
      mid: { money: 1250, exp: 62, time: 45 },
      hard: { money: 2500, exp: 100, time: 60 },
      hell: { money: 10000, exp: 500, time: 60 }
    };

    const qList = allQuestions[difficulty];
    const q = qList[Math.floor(Math.random() * qList.length)];
    const reward = rewards[difficulty];

    const correctAnswer = q.a;
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

    let msg = `💻 𝗖𝗢𝗠𝗣𝗨𝗧𝗘𝗥 𝗦𝗖𝗜𝗘𝗡𝗖𝗘 [${difficulty.toUpperCase()}]\n⏳ ${reward.time}s\n\n❓ ${q.q}\n\n`;
    shuffledOptions.forEach((o, i) => (msg += `${i + 1}. ${o}\n`));

    await message.reply(msg, (err, info) => {
      if (!info) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        author: senderID,
        messageID: info.messageID,
        correctIndex: shuffledOptions.indexOf(correctAnswer),
        correctAnswer: correctAnswer,
        reward,
        startTime: Date.now()
      });
    });
  },

  onReply: async function ({ message, event, Reply, usersData, api }) {
    if (!Reply || Reply.commandName !== this.config.name) return;
    const userID = event.senderID;
    if (userID !== Reply.author) return;

    const answer = parseInt(event.body?.trim());
    const timeTaken = (Date.now() - Reply.startTime) / 1000;

    try {
      api.unsendMessage(Reply.messageID);
    } catch (e) {
      console.log("Error unsending message:", e);
    }

    if (isNaN(answer) || answer < 1 || answer > 4) return message.reply("❌ Invalid choice.");
    global.GoatBot.onReply.delete(Reply.messageID);

    if (timeTaken > Reply.reward.time) return message.reply("⏰ Time's up!");

    const user = await usersData.get(userID);
    if (!user.data) user.data = {};
    if (!user.data.csStats) user.data.csStats = { totalQuestions: 0, correctAnswers: 0, totalEarned: 0 };

    const stats = user.data.csStats;
    stats.totalQuestions++;
    const isCorrect = (answer - 1 === Reply.correctIndex);

    let finalMoney, finalExp;

    if (isCorrect) {
      stats.correctAnswers++;
      const speedRatio = Math.max(0, (Reply.reward.time - timeTaken) / Reply.reward.time);
      const bonusMoney = Math.round(Reply.reward.money * speedRatio * 0.5);
      const bonusExp = Math.round(Reply.reward.exp * speedRatio * 0.5);

      finalMoney = Reply.reward.money + bonusMoney;
      finalExp = Reply.reward.exp + bonusExp;
      stats.totalEarned += finalMoney;

      const updatedUser = await usersData.set(userID, {
        money: (user.money || 0) + finalMoney,
        exp: (user.exp || 0) + finalExp
      });

      return message.reply(`✅ 𝘾𝙊𝙍𝙍𝙀𝘾𝙏!\n𝙀𝘼𝙍𝙉𝙀𝘿: $${finalMoney.toLocaleString()}\n𝙀𝙓𝙋: +${finalExp}\n𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐁𝐀𝐋𝐀𝐍𝐂𝐄: $${updatedUser.money.toLocaleString()}`);
    } else {
      // Logic for losing EXP on wrong answer (penalty is 20% of the reward EXP)
      finalExp = Math.round(Reply.reward.exp * 0.20);
      
      const updatedUser = await usersData.set(userID, {
        exp: Math.max(0, (user.exp || 0) - finalExp) // Prevent negative EXP
      });

      return message.reply(`𝙄𝙉𝘾𝙊𝙍𝙍𝙀𝘾𝙏\n𝙅𝙐𝙎𝙏𝙄𝙁𝙄𝘾𝘼𝙏𝙄𝙊𝙉: Correct was "${Reply.correctAnswer}"\n𝙀𝘼𝙍𝙉𝙀𝘿: $0\n𝙀𝙓𝙋: -${finalExp}\n𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐁𝐀𝐋𝐀𝐍𝐂𝐄: $${(user.money || 0).toLocaleString()}`);
    }
  }
};
