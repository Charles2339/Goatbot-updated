const fs = require('fs-extra');
const path = __dirname + '/cs_questions.json';

module.exports = {
  config: {
    name: "computerscience",
    aliases: ["cs", "csquiz", "comp"],
    version: "1.4",
    author: "CharlesMK",
    countDown: 3,
    role: 0,
    description: { en: "Answer computer science questions and earn money + EXP!" },
    category: "game",
    guide: {
      en: "{pn} <difficulty>\nDifficulties: easy, mid, hard, hell\nRewards scale by difficulty + speed!"
    }
  },

  onStart: async function ({ args, message, event }) {
    const senderID = event.senderID;

    // 1. Ensure the question file exists
    if (!fs.existsSync(path)) {
      return message.reply("❌ Error: 'cs_questions.json' not found in the command folder.");
    }

    const allQuestions = JSON.parse(fs.readFileSync(path, 'utf-8'));
    const difficulty = args[0]?.toLowerCase();

    if (!difficulty || !allQuestions[difficulty]) {
      return message.reply(
        "💻 𝗖𝗢𝗠𝗣𝗨𝗧𝗘𝗥 𝗦𝗖𝗜𝗘𝗡𝗖𝗘 𝗤𝗨𝗜𝗭\n\n" +
        "Choose a difficulty:\n" +
        "🟢 easy | 🟡 mid | 🟠 hard | 🔴 hell"
      );
    }

    const rewards = {
      easy: { money: 500, exp: 25, time: 30 },
      mid: { money: 1250, exp: 62, time: 45 },
      hard: { money: 2500, exp: 100, time: 60 },
      hell: { money: 10000, exp: 500, time: 60 }
    };

    // 2. Shuffle & Pick a question
    const qList = allQuestions[difficulty];
    const q = qList[Math.floor(Math.random() * qList.length)];
    const reward = rewards[difficulty];

    // 3. Shuffle the options so the answer isn't always at the same number
    // We store the correct answer string to find its new index
    const correctAnswer = q.a;
    const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);

    let msg =
      `💻 𝗖𝗢𝗠𝗣𝗨𝗧𝗘𝗥 𝗦𝗖𝗜𝗘𝗡𝗖𝗘 𝗤𝗨𝗘𝗦𝗧𝗜𝗢𝗡\n` +
      `Difficulty: ${difficulty.toUpperCase()}\n` +
      `⏳ Time: ${reward.time}s\n\n` +
      `❓ ${q.q}\n\n`;

    shuffledOptions.forEach((o, i) => (msg += `${i + 1}. ${o}\n`));
    msg += "\nReply with the number (1-4):";

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

  onReply: async function ({ message, event, Reply, usersData }) {
    if (!Reply || Reply.commandName !== this.config.name) return;
    const userID = event.senderID;
    if (userID !== Reply.author) return;

    const answer = parseInt(event.body?.trim());
    const timeTaken = (Date.now() - Reply.startTime) / 1000;

    if (isNaN(answer) || answer < 1 || answer > 4) return message.reply("❌ Reply 1-4.");
    global.GoatBot.onReply.delete(Reply.messageID);

    if (timeTaken > Reply.reward.time) return message.reply("⏰ Time's up!");

    const user = await usersData.get(userID);
    if (!user.data) user.data = {};
    if (!user.data.csStats) user.data.csStats = { totalQuestions: 0, correctAnswers: 0, totalEarned: 0 };

    const stats = user.data.csStats;
    stats.totalQuestions++;

    const isCorrect = (answer - 1 === Reply.correctIndex);
    
    if (isCorrect) {
      stats.correctAnswers++;
      const speedRatio = Math.max(0, (Reply.reward.time - timeTaken) / Reply.reward.time);
      const bonusMoney = Math.round(Reply.reward.money * speedRatio * 0.5);
      const bonusExp = Math.round(Reply.reward.exp * speedRatio * 0.5);

      stats.totalEarned += (Reply.reward.money + bonusMoney);
      const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

      await usersData.set(userID, { 
        ...user, 
        money: (user.money || 0) + Reply.reward.money + bonusMoney, 
        exp: (user.exp || 0) + Reply.reward.exp + bonusExp 
      });

      return message.reply(`✅ 𝗖𝗢𝗥𝗥𝗘𝗖𝗧!\n💰 +$${Reply.reward.money + bonusMoney}\n✨ +${Reply.reward.exp + bonusExp} EXP\n📊 Accuracy: ${accuracy}%`);
    } else {
      const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);
      await usersData.set(userID, { ...user });
      return message.reply(`❌ 𝗪𝗥𝗢𝗡𝗚!\n✅ Correct: ${Reply.correctAnswer}\n📊 Accuracy: ${accuracy}%`);
    }
  }
};
