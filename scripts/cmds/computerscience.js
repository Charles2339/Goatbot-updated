module.exports = {
  config: {
    name: "computerscience",
    aliases: ["cs", "csquiz", "comp"],
    version: "1.1",
    author: "CharlesMK",
    countDown: 3,
    role: 0,
    description: {
      en: "Answer computer science questions and earn money + EXP!"
    },
    category: "game",
    guide: {
      en:
        "{pn} <difficulty>\n" +
        "Difficulties: easy, mid, hard, hell\n\n" +
        "Rewards:\n" +
        "🟢 Easy: $500 + 25 EXP\n" +
        "🟡 Mid: $1,250 + 62 EXP\n" +
        "🟠 Hard: $2,500 + 100 EXP\n" +
        "🔴 Hell: $10,000 + 500 EXP\n\n" +
        "⚡ Speed Bonus: Faster answers = more rewards"
    }
  },

  onStart: async function ({ args, message, event }) {
    const senderID = event.senderID;

    if (!args[0]) {
      return message.reply(
        "💻 𝗖𝗢𝗠𝗣𝗨𝗧𝗘𝗥 𝗦𝗖𝗜𝗘𝗡𝗖𝗘 𝗤𝗨𝗜𝗭\n\n" +
        "Choose a difficulty:\n" +
        "🟢 +cs easy\n" +
        "🟡 +cs mid\n" +
        "🟠 +cs hard\n" +
        "🔴 +cs hell"
      );
    }

    const difficulty = args[0].toLowerCase();

    const questions = {
      easy: [
        { q: "What does CPU stand for?", a: "Central Processing Unit", options: ["Computer Power Unit", "Central Processing Unit", "Control Program Unit", "Central Program Utility"] },
        { q: "Which device is an input device?", a: "Keyboard", options: ["Monitor", "Printer", "Keyboard", "Speaker"] }
      ],
      mid: [
        { q: "Which language is used for web structure?", a: "HTML", options: ["Python", "HTML", "C++", "Java"] },
        { q: "Which data structure uses FIFO?", a: "Queue", options: ["Stack", "Queue", "Tree", "Graph"] }
      ],
      hard: [
        { q: "What is the time complexity of binary search?", a: "O(log n)", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"] },
        { q: "Which OS is open-source?", a: "Linux", options: ["Windows", "macOS", "Linux", "iOS"] }
      ],
      hell: [
        { q: "What is a race condition?", a: "Multiple threads accessing shared data unsafely", options: ["Deadlock", "Memory leak", "Multiple threads accessing shared data unsafely", "Starvation"] },
        { q: "What does ACID stand for?", a: "Atomicity, Consistency, Isolation, Durability", options: ["Access, Control, Integrity, Data", "Atomicity, Consistency, Isolation, Durability", "Accuracy, Consistency, Indexing, Durability", "Atomicity, Control, Isolation, Data"] }
      ]
    };

    const rewards = {
      easy: { exp: 25, money: 500, time: 30 },
      mid: { exp: 62, money: 1250, time: 45 },
      hard: { exp: 100, money: 2500, time: 60 },
      hell: { exp: 500, money: 10000, time: 40 }
    };

    if (!rewards[difficulty]) {
      return message.reply("❌ Invalid difficulty!");
    }

    const q = questions[difficulty][Math.floor(Math.random() * questions[difficulty].length)];
    const reward = rewards[difficulty];

    let msg =
      `💻 𝗖𝗢𝗠𝗣𝗨𝗧𝗘𝗥 𝗦𝗖𝗜𝗘𝗡𝗖𝗘 𝗤𝗨𝗘𝗦𝗧𝗜𝗢𝗡\n\n` +
      `Difficulty: ${difficulty.toUpperCase()}\n` +
      `💰 Base Reward: $${reward.money} + ${reward.exp} EXP\n` +
      `⏳ Time limit: ${reward.time}s\n\n` +
      `❓ ${q.q}\n\n`;

    q.options.forEach((o, i) => (msg += `${i + 1}. ${o}\n`));
    msg += "\nReply with 1-4";

    await message.reply(msg, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        author: senderID,
        correctIndex: q.options.indexOf(q.a),
        correctAnswer: q.a,
        reward,
        startTime: Date.now()
      });
    });
  },

  onReply: async function ({ message, event, Reply, usersData, api }) {
    const userID = event.senderID;
    if (userID !== Reply.author) return;

    global.GoatBot.onReply.delete(Reply.messageID);

    const answer = parseInt(event.body);
    const timeTaken = (Date.now() - Reply.startTime) / 1000;

    if (!answer || answer < 1 || answer > 4) {
      return message.reply("❌ Invalid answer!");
    }

    if (timeTaken > Reply.reward.time) {
      return message.reply("⏰ Time's up!");
    }

    const user = await usersData.get(userID);

    let userName = "User";
    try {
      const info = await api.getUserInfo(userID);
      userName = info[userID]?.name || "User";
    } catch {}

    if (!user.data) user.data = {};
    if (!user.data.csStats) {
      user.data.csStats = {
        totalQuestions: 0,
        correctAnswers: 0,
        totalEarned: 0
      };
    }

    const stats = user.data.csStats;
    stats.totalQuestions++;

    const accuracy = () =>
      Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

    // SPEED BONUS (up to +50%)
    const speedRatio = Math.max(0, (Reply.reward.time - timeTaken) / Reply.reward.time);
    const speedBonusMoney = Math.round(Reply.reward.money * speedRatio * 0.5);
    const speedBonusExp = Math.round(Reply.reward.exp * speedRatio * 0.5);

    if (answer - 1 === Reply.correctIndex) {
      stats.correctAnswers++;
      stats.totalEarned += Reply.reward.money + speedBonusMoney;

      const totalMoney = (user.money || 0) + Reply.reward.money + speedBonusMoney;
      const totalExp = (user.exp || 0) + Reply.reward.exp + speedBonusExp;

      let rank = "🌟";
      if (accuracy() >= 95) rank = "🏆 CS Master";
      else if (accuracy() >= 85) rank = "⭐ Software Engineer";
      else if (accuracy() >= 75) rank = "🚀 Programmer";
      else if (accuracy() >= 60) rank = "💫 Coder";

      await usersData.set(userID, {
        ...user,
        money: totalMoney,
        exp: totalExp,
        data: user.data
      });

      return message.reply(
        `✅ 𝗖𝗢𝗥𝗥𝗘𝗖𝗧! 🎉\n\n` +
        `💰 𝗠𝗼𝗻𝗲𝘆: +$${Reply.reward.money}\n` +
        `⚡ 𝗦𝗽𝗲𝗲𝗱 𝗕𝗼𝗻𝘂𝘀: +$${speedBonusMoney}\n` +
        `✨ 𝗘𝗫𝗣: +${Reply.reward.exp} (+${speedBonusExp})\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 𝗦𝗰𝗼𝗿𝗲: ${stats.correctAnswers}/${stats.totalQuestions} (${accuracy()}%)\n` +
        `⚡ 𝗧𝗶𝗺𝗲: ${timeTaken.toFixed(1)}s\n` +
        `💵 𝗧𝗼𝘁𝗮𝗹 𝗘𝗮𝗿𝗻𝗲𝗱: $${stats.totalEarned}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 ${userName} ${rank}`
      );
    }

    await usersData.set(userID, { ...user, data: user.data });

    return message.reply(
      `❌ 𝗪𝗥𝗢𝗡𝗚! 😔\n\n` +
      `✅ Correct: ${Reply.correctAnswer}\n` +
      `📊 Score: ${stats.correctAnswers}/${stats.totalQuestions} (${accuracy()}%)`
    );
  }
};
