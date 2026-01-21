module.exports = {
  config: {
    name: "maths",
    aliases: ["math", "quiz maths"],
    version: "3.0",
    author: "CharlesMK",
    countDown: 3,
    role: 0,
    description: {
      en: "Answer math questions and earn money + EXP!"
    },
    category: "game",
    guide: {
      en: "{pn} <difficulty>\nDifficulties: easy, mid, hard, hell\n\nExample: {pn} easy\n\nRewards:\n� Easy: $500 + 25 EXP\n� Mid: $1,250 + 62 EXP\n� Hard: $2,500 + 100 EXP\n🔴 Hell: $10,000 + 500 EXP"
    }
  },

  onStart: async function ({ args, message, event, usersData, api }) {
    const { senderID } = event;

    if (args.length === 0) {
      return message.reply(
        "📚 𝗠𝗔𝗧𝗛 𝗤𝗨𝗜𝗭\n\n" +
        "Choose a difficulty:\n" +
        "� +maths easy ($500 + 25 EXP)\n" +
        "� +maths mid ($1,250 + 62 EXP)\n" +
        "� +maths hard ($2,500 + 100 EXP)\n" +
        "🔴 +maths hell ($10,000 + 500 EXP)"
      );
    }

    const difficulty = args[0].toLowerCase();

    const random = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const generateQuestion = (difficulty) => {
      let question, answer;

      switch (difficulty) {
        case "easy": {
          const ops = ["+", "-", "×", "÷"];
          const op = ops[random(0, 3)];

          if (op === "+") {
            const a = random(1, 25);
            const b = random(1, 25);
            question = `${a} + ${b} = ?`;
            answer = a + b;
          } else if (op === "-") {
            const a = random(10, 30);
            const b = random(1, a - 1);
            question = `${a} - ${b} = ?`;
            answer = a - b;
          } else if (op === "×") {
            const a = random(2, 12);
            const b = random(2, 12);
            question = `${a} × ${b} = ?`;
            answer = a * b;
          } else {
            const b = random(2, 10);
            const ans = random(2, 10);
            question = `${b * ans} ÷ ${b} = ?`;
            answer = ans;
          }
          break;
        }

        case "mid": {
          const ops = ["+", "-", "×", "÷"];
          const op = ops[random(0, 3)];

          if (op === "+") {
            const a = random(20, 150);
            const b = random(20, 150);
            question = `${a} + ${b} = ?`;
            answer = a + b;
          } else if (op === "-") {
            const a = random(100, 250);
            const b = random(20, a - 20);
            question = `${a} - ${b} = ?`;
            answer = a - b;
          } else if (op === "×") {
            const a = random(10, 30);
            const b = random(5, 20);
            question = `${a} × ${b} = ?`;
            answer = a * b;
          } else {
            const b = random(10, 20);
            const ans = random(10, 20);
            question = `${b * ans} ÷ ${b} = ?`;
            answer = ans;
          }
          break;
        }

        case "hard": {
          const ops = ["+", "-", "×", "÷"];
          const op = ops[random(0, 3)];

          if (op === "+") {
            const a = random(200, 800);
            const b = random(200, 800);
            question = `${a} + ${b} = ?`;
            answer = a + b;
          } else if (op === "-") {
            const a = random(500, 2000);
            const b = random(100, a - 100);
            question = `${a} - ${b} = ?`;
            answer = a - b;
          } else if (op === "×") {
            const a = random(30, 99);
            const b = random(30, 99);
            question = `${a} × ${b} = ?`;
            answer = a * b;
          } else {
            const b = random(20, 50);
            const ans = random(20, 80);
            question = `${b * ans} ÷ ${b} = ?`;
            answer = ans;
          }
          break;
        }

        case "hell": {
          const type = random(1, 5);

          if (type === 1) {
            const squares = [4,9,16,25,36,49,64,81,100,121,144,169,196,225,256,289,324,361,400,441,484,529,576,625];
            const n = squares[random(0, squares.length - 1)];
            question = `√${n} = ?`;
            answer = Math.sqrt(n);
          } else if (type === 2) {
            const b = random(12, 25);
            question = `${b}² = ?`;
            answer = b * b;
          } else if (type === 3) {
            const bases = [2, 3, 4, 5];
            const base = bases[random(0, bases.length - 1)];
            const exp = random(3, 7);
            question = `${base}^${exp} = ?`;
            answer = Math.pow(base, exp);
          } else if (type === 4) {
            const a = random(15, 30);
            const b = random(10, a - 5);
            question = `${a}² - ${b}² = ?`;
            answer = (a * a) - (b * b);
          } else {
            const a = random(10, 30);
            const b = random(5, 20);
            const c = random(2, 10);
            question = `(${a} × ${b}) + ${c} = ?`;
            answer = (a * b) + c;
          }
          break;
        }

        default:
          return null;
      }

      return { q: question, a: answer };
    };

    const rewards = {
      easy: { exp: 25, money: 500 },
      mid: { exp: 62, money: 1250 },
      hard: { exp: 100, money: 2500 },
      hell: { exp: 500, money: 10000 }
    };

    const timeLimits = {
      easy: 0,
      mid: 70 * 1000,
      hard: 80 * 1000,
      hell: 50 * 1000
    };

    const emojis = { easy: "�", mid: "�", hard: "�", hell: "🔴" };

    if (!rewards[difficulty]) {
      return message.reply("❌ Invalid difficulty!");
    }

    const question = generateQuestion(difficulty);
    if (!question) return;

    const timeText =
      timeLimits[difficulty] === 0
        ? "⏳ No time limit"
        : `⏳ Time limit: ${timeLimits[difficulty] / 1000}s`;

    await message.reply(
      `${emojis[difficulty]} 𝗠𝗔𝗧𝗛 𝗤𝗨𝗘𝗦𝗧𝗜𝗢𝗡 ${emojis[difficulty]}\n\n` +
      `Difficulty: ${difficulty.toUpperCase()}\n` +
      `💰 Reward: $${rewards[difficulty].money.toLocaleString()} + ${rewards[difficulty].exp} EXP\n` +
      `${timeText}\n\n` +
      `❓ ${question.q}`
    );

    global.GoatBot = global.GoatBot || {};
    global.GoatBot.mathQuestions = global.GoatBot.mathQuestions || {};
    global.GoatBot.mathQuestions[senderID] = {
      answer: question.a,
      reward: rewards[difficulty],
      difficulty,
      timestamp: Date.now(),
      timeLimit: timeLimits[difficulty]
    };
  },

  onChat: async function ({ message, event, usersData, api }) {
    const { senderID, body } = event;
    const data = global.GoatBot?.mathQuestions?.[senderID];
    if (!data) return;

    // Check time limit
    const timeTaken = (Date.now() - data.timestamp) / 1000;

    if (data.timeLimit > 0 && Date.now() - data.timestamp > data.timeLimit) {
      delete global.GoatBot.mathQuestions[senderID];
      return message.reply("⏰ Time's up! Try again.");
    }

    const userAnswer = parseInt(body.trim());
    if (isNaN(userAnswer)) return;

    const user = await usersData.get(senderID);

    // Get user info for name
    let userName = "User";
    try {
      const userInfo = await api.getUserInfo(senderID);
      userName = userInfo[senderID]?.name || "User";
    } catch (e) {
      userName = "User";
    }

    // Initialize stats if not exists
    if (!user.data) user.data = {};
    if (!user.data.mathStats) {
      user.data.mathStats = {
        totalQuestions: 0,
        correctAnswers: 0,
        totalEarned: 0
      };
    }

    const stats = user.data.mathStats;
    stats.totalQuestions += 1;

    if (userAnswer === data.answer) {
      // CORRECT ANSWER
      stats.correctAnswers += 1;
      stats.totalEarned += data.reward.money;

      const totalExp = (user.exp || 0) + data.reward.exp;
      const totalMoney = (user.money || 0) + data.reward.money;

      // Calculate accuracy
      const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

      // Rank based on accuracy
      let rank = "🌟";
      if (accuracy >= 95) rank = "🏆 Legend";
      else if (accuracy >= 85) rank = "⭐ Expert";
      else if (accuracy >= 75) rank = "🚀 Pro";
      else if (accuracy >= 60) rank = "💫 Rising Star";
      else rank = "🌟 Beginner";

      await usersData.set(senderID, {
        ...user,
        exp: totalExp,
        money: totalMoney,
        data: user.data
      });

      message.reply(
        `✅ 𝗖𝗢𝗥𝗥𝗘𝗖𝗧! 🎉\n\n` +
        `💰 𝗠𝗼𝗻𝗲𝘆: +$${data.reward.money.toLocaleString()}\n` +
        `✨ 𝗘𝗫𝗣: +${data.reward.exp}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 𝗦𝗰𝗼𝗿𝗲: ${stats.correctAnswers}/${stats.totalQuestions} (${accuracy}%)\n` +
        `⚡ 𝗧𝗶𝗺𝗲: ${timeTaken.toFixed(1)}s\n` +
        `💵 𝗧𝗼𝘁𝗮𝗹 𝗘𝗮𝗿𝗻𝗲𝗱: $${stats.totalEarned.toLocaleString()}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 ${userName} ${rank}`
      );
    } else {
      // WRONG ANSWER
      const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

      await usersData.set(senderID, {
        ...user,
        data: user.data
      });

      message.reply(
        `❌ 𝗪𝗥𝗢𝗡𝗚! \n\n` +
        `💭 𝗬𝗼𝘂𝗿 𝗔𝗻𝘀𝘄𝗲𝗿: ${userAnswer}\n` +
        `✅ 𝗖𝗼𝗿𝗿𝗲𝗰𝘁: ${data.answer}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 𝗦𝗰𝗼𝗿𝗲: ${stats.correctAnswers}/${stats.totalQuestions} (${accuracy}%)\n` +
        `⚡ 𝗧𝗶𝗺𝗲: ${timeTaken.toFixed(1)}s\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Keep trying! 💪`
      );
    }

    delete global.GoatBot.mathQuestions[senderID];
  }
};
