const axios = require("axios");

module.exports = {
  config: {
    name: "quiz",
    aliases: ["q", "trivia"],
    version: "3.5.0",
    author: "Charles MK",
    countDown: 5,
    role: 0,
    description: "Quiz with Levels, Streaks, and Lifetime Stats.",
    category: "game",
    guide: { en: "{pn} [category] | categories: geography, biology, sports, tv show, information technology, gaming, anime, history" }
  },

  onStart: async function({ message, event, args }) {
    const categoryMap = {
      "geography": 22, "biology": 17, "sports": 21, "tv show": 14,
      "information technology": 18, "gaming": 15, "anime": 31, 
      "history": 23, "movies": 11, "music": 12
    };

    const input = args.join(" ").toLowerCase();
    const categoryId = categoryMap[input] || 9;

    // session stats: total, correct, incorrect, points, current streak
    const stats = { total: 0, correct: 0, incorrect: 0, sessionPoints: 0, streak: 0 };
    
    return this.getNextQuestion(message, event, categoryId, stats);
  },

  onReply: async function({ Reply, message, event, args, usersData, api }) {
    const { author, type, quizData, quizMessageID, categoryId, stats } = Reply;
    if (author !== event.senderID) return;

    const userInput = args[0]?.trim().toLowerCase();

    if (["stop", "end", "quit"].includes(userInput)) {
      const accuracy = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : 0;
      message.unsend(quizMessageID).catch(() => {});
      
      return message.reply(`🏁 𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗘𝗡𝗗𝗘𝗗\n━━━━━━━━━━━━━━━━━━━━━━\n📝 𝗧𝗼𝘁𝗮𝗹: ${stats.total}\n✅ 𝗖𝗼𝗿𝗿𝗲𝗰𝘁: ${stats.correct}\n🎯 𝗔𝗰𝗰𝘂𝗿𝗮𝗰𝘆: ${accuracy}%\n✨ 𝗦𝗲𝘀𝘀𝗶𝗼𝗻 𝗣𝘁𝘀: +${stats.sessionPoints}\n━━━━━━━━━━━━━━━━━━━━━━`);
    }

    if (type === "answerQuiz") {
      const answer = userInput.toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(answer)) return;

      stats.total++;
      const isCorrect = answer === quizData.correctLetter;
      const currentUser = await usersData.get(event.senderID);
      
      let pointGain = 10;
      let coinGain = Math.floor(Math.random() * 501) + 500;

      if (isCorrect) {
        stats.correct++;
        stats.streak++;
        
        // 🔥 Streak Bonus (Every 3 correct answers gives 1.5x points)
        if (stats.streak >= 3) {
          pointGain = Math.floor(pointGain * 1.5);
          coinGain = Math.floor(coinGain * 1.2);
        }

        stats.sessionPoints += pointGain;

        // Calculate Level based on lifetime points
        const newTotalPoints = (currentUser.data.quizScore || 0) + pointGain;
        const level = newTotalPoints < 500 ? "Novice" : 
                      newTotalPoints < 2000 ? "Scholar" : 
                      newTotalPoints < 5000 ? "Professor" : "Grandmaster";

        await usersData.set(event.senderID, {
          money: (currentUser.money || 0) + coinGain,
          data: { 
            ...currentUser.data, 
            quizScore: newTotalPoints,
            quizTotal: (currentUser.data.quizTotal || 0) + 1,
            quizCorrect: (currentUser.data.quizCorrect || 0) + 1,
            quizLevel: level
          }
        });

        await api.editMessage(`✅ 𝗖𝗢𝗥𝗥𝗘𝗖𝗧\n━━━━━━━━━━━━━━━━━━━━━━\n💰 +${coinGain} coins\n⭐ +${pointGain} pts ${stats.streak >= 3 ? '(Streak! 🔥)' : ''}\n🎓 𝗟𝗲𝘃𝗲𝗹: ${level}\n📈 𝗦𝗲𝘀𝘀𝗶𝗼𝗻: ${stats.correct}/${stats.total}\n━━━━━━━━━━━━━━━━━━━━━━`, quizMessageID);
      } else {
        stats.incorrect++;
        stats.streak = 0; // Reset streak on wrong answer

        await usersData.set(event.senderID, {
          data: { 
            ...currentUser.data, 
            quizTotal: (currentUser.data.quizTotal || 0) + 1 
          }
        });

        await api.editMessage(`❌ 𝗪𝗥𝗢𝗡𝗚\n━━━━━━━━━━━━━━━━━━━━━━\n𝗖𝗼𝗿𝗿𝗲𝗰𝘁: ${quizData.correctLetter}. ${quizData.correctAnswer}\n🔥 Streak Lost!\n━━━━━━━━━━━━━━━━━━━━━━`, quizMessageID);
      }

      setTimeout(() => this.getNextQuestion(message, event, categoryId, stats), 2000);
    }
  },

  getNextQuestion: async function(message, event, categoryId, stats) {
    try {
      const res = await axios.get(`https://opentdb.com/api.php?amount=1&category=${categoryId}&type=multiple`);
      const data = res.data.results[0];
      const decode = (str) => str.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, "&").replace(/&deg;/g, "°").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&rsquo;/g, "'");

      const question = decode(data.question);
      const correctAnswer = decode(data.correct_answer);
      const options = [...data.incorrect_answers.map(decode), correctAnswer].sort(() => Math.random() - 0.5);
      
      const letters = ["A", "B", "C", "D"];
      const correctLetter = letters[options.indexOf(correctAnswer)];
      const optionsText = options.map((opt, i) => `${letters[i]}. ${opt}`).join("\n\n");

      const sent = await message.reply(`❓ 𝗤𝗨𝗘𝗦𝗧𝗜𝗢𝗡\n━━━━━━━━━━━━━━━━━━━━━━\n𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${data.category}\n\n${question}\n\n${optionsText}\n\n━━━━━━━━━━━━━━━━━━━━━━\n💡 Reply A, B, C, D or 'stop'`);

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: this.config.name,
        messageID: sent.messageID,
        author: event.senderID,
        type: "answerQuiz",
        quizData: { question, options, correctAnswer, correctLetter },
        quizMessageID: sent.messageID,
        categoryId,
        stats
      });
    } catch (err) {
      return message.reply("❌ 𝗔𝗣𝗜 𝗕𝘂𝘀𝘆. Try again.");
    }
  }
};
