module.exports = {
  config: {
    name: "computerscience",
    aliases: ["cs", "csquiz", "comp"],
    version: "1.3",
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
        "⚡ Speed bonus: Answer faster for extra rewards"
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
        { q: "Which device is an input device?", a: "Keyboard", options: ["Monitor", "Printer", "Keyboard", "Speaker"] },
        { q: "What is the main component of a computer?", a: "Motherboard", options: ["Motherboard", "Hard Drive", "RAM", "Graphics Card"] },
        { q: "Which of these is a permanent storage device?", a: "Hard Drive", options: ["RAM", "Hard Drive", "CPU", "Monitor"] }
      ],
      mid: [
        { q: "Which language is used for web structure?", a: "HTML", options: ["Python", "HTML", "C++", "Java"] },
        { q: "Which data structure uses FIFO?", a: "Queue", options: ["Stack", "Queue", "Tree", "Graph"] },
        { q: "What does HTTP stand for?", a: "Hypertext Transfer Protocol", options: ["High Text Transfer Protocol", "Hypertext Transfer Protocol", "Hyper Transfer Text Program", "Hypertext Total Process"] },
        { q: "What is a 'bug' in computer science?", a: "An error in a program", options: ["A hardware piece", "An error in a program", "A type of virus", "A fast processor"] }
      ],
      hard: [
        { q: "What is the time complexity of binary search?", a: "O(log n)", options: ["O(n)", "O(n²)", "O(log n)", "O(1)"] },
        { q: "Which OS is open-source?", a: "Linux", options: ["Windows", "macOS", "Linux", "iOS"] },
        { q: "What is the purpose of a DNS?", a: "Translates domain names to IP addresses", options: ["Stores website files", "Translates domain names to IP addresses", "Protects against viruses", "Speeds up CPU"] },
        { q: "Which sorting algorithm has a worst-case O(n log n)?", a: "Merge Sort", options: ["Bubble Sort", "Merge Sort", "Insertion Sort", "Selection Sort"] }
      ],
      hell: [
        { q: "What is a race condition?", a: "Multiple threads accessing shared data unsafely", options: ["Deadlock", "Memory leak", "Multiple threads accessing shared data unsafely", "Starvation"] },
        { q: "What does ACID stand for?", a: "Atomicity, Consistency, Isolation, Durability", options: ["Access, Control, Integrity, Data", "Atomicity, Consistency, Isolation, Durability", "Accuracy, Consistency, Indexing, Durability", "Atomicity, Control, Isolation, Data"] },
        { q: "What is the P vs NP problem about?", a: "Complexity classes", options: ["Network protocols", "Complexity classes", "Programming languages", "Processor speed"] },
        { q: "What is a 'Deadlock' in OS?", a: "Processes waiting indefinitely for each other", options: ["A crashed computer", "A deleted file", "Processes waiting indefinitely for each other", "A full hard drive"] }
      ]
    };

    const rewards = {
      easy: { money: 500, exp: 25, time: 30 },
      mid: { money: 1250, exp: 62, time: 45 },
      hard: { money: 2500, exp: 100, time: 60 },
      hell: { money: 10000, exp: 500, time: 60 } // Increased time for reading
    };

    if (!rewards[difficulty]) {
      return message.reply("❌ Invalid difficulty! Choose: easy, mid, hard, or hell.");
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
    msg += "\nReply with the number (1-4):";

    await message.reply(msg, (err, info) => {
      if (!info) return;
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        author: senderID,
        messageID: info.messageID,
        correctIndex: q.options.indexOf(q.a),
        correctAnswer: q.a,
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

    if (isNaN(answer) || answer < 1 || answer > 4) {
      return message.reply("❌ Please reply with a number between 1 and 4.");
    }

    global.GoatBot.onReply.delete(Reply.messageID);

    if (timeTaken > Reply.reward.time) {
      return message.reply(`⏰ Time's up! You took ${timeTaken.toFixed(1)}s.`);
    }

    const user = await usersData.get(userID);
    if (!user.data) user.data = {};
    if (!user.data.csStats) {
      user.data.csStats = { totalQuestions: 0, correctAnswers: 0, totalEarned: 0 };
    }

    const stats = user.data.csStats;
    stats.totalQuestions++;

    const isCorrect = (answer - 1 === Reply.correctIndex);
    if (isCorrect) stats.correctAnswers++;

    // Safe Accuracy Calculation
    const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

    if (isCorrect) {
      const speedRatio = Math.max(0, (Reply.reward.time - timeTaken) / Reply.reward.time);
      const bonusMoney = Math.round(Reply.reward.money * speedRatio * 0.5);
      const bonusExp = Math.round(Reply.reward.exp * speedRatio * 0.5);

      stats.totalEarned += (Reply.reward.money + bonusMoney);
      
      const totalMoney = (user.money || 0) + Reply.reward.money + bonusMoney;
      const totalExp = (user.exp || 0) + Reply.reward.exp + bonusExp;

      let rank = "🌟 Learner";
      if (accuracy >= 95 && stats.totalQuestions > 5) rank = "🏆 CS Master";
      else if (accuracy >= 85) rank = "⭐ Software Engineer";
      else if (accuracy >= 75) rank = "🚀 Programmer";
      else if (accuracy >= 60) rank = "💫 Coder";

      await usersData.set(userID, { ...user, money: totalMoney, exp: totalExp });

      return message.reply(
        `✅ 𝗖𝗢𝗥𝗥𝗘𝗖𝗧! 🎉\n\n` +
        `💰 𝗠𝗼𝗻𝗲𝘆: +$${Reply.reward.money} (+$${bonusMoney} bonus)\n` +
        `✨ 𝗘𝗫𝗣: +${Reply.reward.exp} (+${bonusExp})\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 𝗦𝗰𝗼𝗿𝗲: ${stats.correctAnswers}/${stats.totalQuestions} (${accuracy}%)\n` +
        `👤 Rank: ${rank}`
      );
    } else {
      await usersData.set(userID, { ...user });
      return message.reply(
        `❌ 𝗪𝗥𝗢𝗡𝗚!\n\n` +
        `✅ Correct: ${Reply.correctAnswer}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 𝗦𝗰𝗼𝗿𝗲: ${stats.correctAnswers}/${stats.totalQuestions} (${accuracy}%)`
      );
    }
  }
};
