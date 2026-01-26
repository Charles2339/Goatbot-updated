const fs = require('fs-extra');

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
    version: "2.2",
    author: "Charles MK",
    countDown: 3,
    role: 0,
    description: { en: "High-stakes science quiz with massive rewards and streaks!" },
    category: "game",
    guide: { en: "{pn}science <easy | mid | hard | hell>" }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const senderID = event.senderID;
    const difficulty = args[0]?.toLowerCase();
    const user = await usersData.get(senderID);
    
    if (!user.data) user.data = {};
    if (!user.data.sciStats) user.data.sciStats = {};

    // --- Status Command Logic ---
    if (!difficulty || !paths[difficulty]) {
      let statusMsg = "🧪 **SCIENCE QUIZ STATUS**\n\n";
      const levels = ['easy', 'mid', 'hard', 'hell'];
      
      levels.forEach(lvl => {
        const s = user.data.sciStats[lvl] || { count: 0, streak: 0 };
        statusMsg += `🔹 **${lvl.toUpperCase()}**\n`;
        statusMsg += `Questions: ${s.count}/30\n`;
        statusMsg += `Streak: ${s.streak}/30\n\n`;
      });
      
      statusMsg += "💡 *Use /science <difficulty> to play!*";
      return message.reply(statusMsg);
    }

    if (!fs.existsSync(paths[difficulty])) return message.reply(`❌ **File for ${difficulty} not found.**`);

    const settings = {
      easy: { money: 15000, exp: 120, time: 30 },
      mid:  { money: 23000, exp: 300, time: 30 },
      hard: { money: 40000, exp: 700, time: 50 },
      hell: { money: 90000, exp: 1500, time: 70 }
    };

    // Initialize stats for the chosen level
    if (!user.data.sciStats[difficulty]) {
      user.data.sciStats[difficulty] = { count: 0, streak: 0, lastReset: Date.now() };
    }

    const stats = user.data.sciStats[difficulty];
    const now = Date.now();

    // Reset daily count if 24h passed
    if (now - stats.lastReset > 24 * 60 * 60 * 1000) {
      stats.count = 0;
      stats.lastReset = now;
    }

    if (stats.count >= 30) {
      const remaining = (24 * 60 * 60 * 1000) - (now - stats.lastReset);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      return message.reply(`🚫 **Limit reached!** You can play **${difficulty.toUpperCase()}** again in **${hours} hours**.`);
    }

    const qList = JSON.parse(fs.readFileSync(paths[difficulty], 'utf-8'));
    const q = qList[Math.floor(Math.random() * qList.length)];
    const config = settings[difficulty];

    const msg = `🧪 𝗦𝗖𝗜𝗘𝗡𝗖𝗘 𝗤𝗨𝗜𝗭 [${difficulty.toUpperCase()}]\n⏳ **${config.time}s** | 📈 Streak: **${stats.streak}/30**\n\n❓ **${q.question}**`;

    // Save initial state before the reply interaction
    await usersData.set(senderID, { data: user.data });

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

    try { api.unsendMessage(Reply.messageID); } catch (e) {}
    global.GoatBot.onReply.delete(Reply.messageID);

    const user = await usersData.get(userID);
    const stats = user.data.sciStats[Reply.difficulty];
    const isCorrect = Reply.answers.some(a => userAnswer === a.toLowerCase().trim());

    // --- Handle Timeout ---
    if (timeTaken > Reply.config.time) {
      stats.streak = 0;
      await usersData.set(userID, { data: user.data });
      return message.reply(`⏰ **TIME'S UP!**\n\nTime taken: ⏱️ **${timeTaken.toFixed(2)}s**\n\nStreak: **reset.**\nStatus: **Failed**`);
    }

    if (isCorrect) {
      stats.count++;
      stats.streak++;
      let totalMoney = Reply.config.money;
      let streakBonusMsg = "";

      if (stats.streak === 30) {
        totalMoney += 30000;
        streakBonusMsg = `\n🔥 **PERFECT 30 STREAK BONUS!** +$30,000`;
        stats.streak = 0;
      }

      await usersData.set(userID, {
        money: (user.money || 0) + totalMoney,
        exp: (user.exp || 0) + Reply.config.exp,
        data: user.data
      });

      return message.reply(`✅ **CORRECT**\n\nEarned: **$${totalMoney.toLocaleString()}**\nEXP: **+${Reply.config.exp}**\nTime taken: ⏱️ **${timeTaken.toFixed(2)}s**\n\nStreak: **${stats.streak}/30**${streakBonusMsg}\nStatus: **Success**`);
    
    } else {
      // --- Handle Incorrect ---
      stats.streak = 0;
      await usersData.set(userID, { data: user.data });
      return message.reply(`❌ **INCORRECT**\n\nAnswer: "**${Reply.answers[0]}**"\nTime taken: ⏱️ **${timeTaken.toFixed(2)}s**\n\nStreak: **reset.**\nStatus: **Failed**`);
    }
  }
};
