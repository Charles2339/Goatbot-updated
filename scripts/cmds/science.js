const fs = require('fs-extra');

// Paths to your JSON files
const paths = {
  easy: __dirname + '/sciencequiz/easy.json',
  mid: __dirname + '/sciencequiz/mid.json',
  hard: __dirname + '/sciencequiz/hard.json',
  hell: __dirname + '/sciencequiz/hell.json'
};

module.exports = {
  config: {
    name: "science",
    aliases: ["sciquiz", "sciencequiz"],
    version: "2.0",
    author: "Charles MK",
    countDown: 3,
    role: 0,
    description: { en: "High-stakes science quiz with massive rewards and streaks!" },
    category: "game",
    guide: { en: "{pn} <easy | mid | hard | hell>" }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const senderID = event.senderID;
    const difficulty = args[0]?.toLowerCase();

    if (!difficulty || !paths[difficulty]) {
      return message.reply("🧪 Choose difficulty: easy, mid, hard, or hell");
    }

    if (!fs.existsSync(paths[difficulty])) return message.reply(`❌ File for ${difficulty} not found.`);

    // --- Reward & Logic Settings ---
    const settings = {
      easy: { money: 15000, exp: 120, time: 30 },
      mid:  { money: 23000, exp: 300, time: 30 },
      hard: { money: 40000, exp: 700, time: 50 },
      hell: { money: 90000, exp: 1500, time: 70 }
    };

    const user = await usersData.get(senderID);
    if (!user.data) user.data = {};
    if (!user.data.sciStats) user.data.sciStats = {};
    
    // Initialize difficulty-specific stats
    if (!user.data.sciStats[difficulty]) {
      user.data.sciStats[difficulty] = { count: 0, streak: 0, lastReset: Date.now() };
    }

    const stats = user.data.sciStats[difficulty];
    const now = Date.now();

    // --- 24-Hour Limit Check ---
    if (now - stats.lastReset > 24 * 60 * 60 * 1000) {
      stats.count = 0;
      stats.lastReset = now;
    }

    if (stats.count >= 30) {
      const remaining = (24 * 60 * 60 * 1000) - (now - stats.lastReset);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      return message.reply(`🚫 Limit reached! You can play ${difficulty.toUpperCase()} again in ${hours}h ${mins}m.`);
    }

    // --- Fetch Question ---
    const qList = JSON.parse(fs.readFileSync(paths[difficulty], 'utf-8'));
    const q = qList[Math.floor(Math.random() * qList.length)];
    const config = settings[difficulty];

    const msg = `🧪 𝗦𝗖𝗜𝗘𝗡𝗖𝗘 𝗤𝗨𝗜𝗭 [${difficulty.toUpperCase()}]\n⏳ ${config.time}s | 📈 Streak: ${stats.streak}/30\n\n❓ ${q.question}`;

    await message.reply(msg, (err, info) => {
      if (!info) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        author: senderID,
        messageID: info.messageID,
        answers: q.answer,
        difficulty,
        config,
        startTime: Date.now()
      });
    });
  },

  onReply: async function ({ message, event, Reply, usersData, api }) {
    if (!Reply || Reply.commandName !== this.config.name) return;
    const userID = event.senderID;
    if (userID !== Reply.author) return;

    const userAnswer = event.body?.trim().toLowerCase();
    const timeTaken = (Date.now() - Reply.startTime) / 1000;

    // Clean up
    try { api.unsendMessage(Reply.messageID); } catch (e) {}
    global.GoatBot.onReply.delete(Reply.messageID);

    const user = await usersData.get(userID);
    const stats = user.data.sciStats[Reply.difficulty];

    // --- Timer Check ---
    if (timeTaken > Reply.config.time) {
      stats.streak = 0; // Reset streak on timeout
      await usersData.set(userID, { data: user.data });
      return message.reply(`⏰ Time's up! You took ${timeTaken.toFixed(2)}s. Your streak for ${Reply.difficulty} was reset.`);
    }

    // --- Correctness Check ---
    const isCorrect = Reply.answers.some(a => userAnswer === a.toLowerCase().trim());

    if (isCorrect) {
      stats.count++;
      stats.streak++;
      
      let totalMoney = Reply.config.money;
      let streakBonusMsg = "";

      // Perfect 30 Bonus
      if (stats.streak === 30) {
        totalMoney += 30000;
        streakBonusMsg = `\n🔥 **PERFECT 30 STREAK!** You earned a $30,000 bonus!`;
        stats.streak = 0; // Reset after bonus
      }

      await usersData.set(userID, {
        money: (user.money || 0) + totalMoney,
        exp: (user.exp || 0) + Reply.config.exp,
        data: user.data
      });

      return message.reply(`✅ **CORRECT!**\n💰 Reward: $${totalMoney.toLocaleString()}\n✨ EXP: +${Reply.config.exp}\n⏱️ Time: ${timeTaken.toFixed(2)}s\n📈 Streak: ${stats.streak}/30${streakBonusMsg}`);
    
    } else {
      // --- Incorrect (No Penalty) ---
      stats.streak = 0;
      await usersData.set(userID, { data: user.data });
      return message.reply(`❌ **INCORRECT**\nCorrect was: "${Reply.answers[0]}"\n⏱️ Time: ${timeTaken.toFixed(2)}s\nStreak reset. No penalty applied.`);
    }
  }
};
