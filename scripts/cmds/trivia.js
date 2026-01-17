const axios = require('axios');

// Store active trivia sessions
const triviaActive = new Map();

module.exports = {
  config: {
    name: "trivia",
    aliases: ["quiz", "question"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 5,
    role: 0,
    description: {
      en: "Answer trivia questions and win money!"
    },
    category: "game",
    guide: {
      en: "{pn} - Start a random trivia question\n{pn} easy - Easy questions ($500)\n{pn} medium - Medium questions ($1000)\n{pn} hard - Hard questions ($2000)"
    }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;

    // Check if user already has an active trivia
    if (triviaActive.has(senderID)) {
      return message.reply("❓ You already have an active trivia question!\nAnswer it first before requesting a new one.");
    }

    let difficulty = "medium";
    let reward = 1000;

    if (args[0]) {
      const diff = args[0].toLowerCase();
      if (diff === "easy") {
        difficulty = "easy";
        reward = 500;
      } else if (diff === "medium") {
        difficulty = "medium";
        reward = 1000;
      } else if (diff === "hard") {
        difficulty = "hard";
        reward = 2000;
      }
    }

    try {
      // Fetch trivia question from Open Trivia DB (free API)
      const response = await axios.get(
        `https://opentdb.com/api.php?amount=1&difficulty=${difficulty}&type=multiple`,
        { timeout: 10000 }
      );

      if (response.data.response_code !== 0) {
        return message.reply("❌ Failed to fetch trivia question. Please try again.");
      }

      const questionData = response.data.results[0];
      
      // Decode HTML entities
      const decodeHTML = (html) => {
        return html
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&ldquo;/g, '"')
          .replace(/&rdquo;/g, '"');
      };

      const question = decodeHTML(questionData.question);
      const correctAnswer = decodeHTML(questionData.correct_answer);
      const incorrectAnswers = questionData.incorrect_answers.map(ans => decodeHTML(ans));

      // Shuffle answers
      const allAnswers = [correctAnswer, ...incorrectAnswers];
      for (let i = allAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
      }

      const correctIndex = allAnswers.indexOf(correctAnswer);

      // Difficulty emoji
      let diffEmoji = "🟡";
      if (difficulty === "easy") diffEmoji = "🟢";
      else if (difficulty === "hard") diffEmoji = "🔴";

      let triviaMsg = `❓ 𝗧𝗥𝗜𝗩𝗜𝗔 𝗤𝗨𝗘𝗦𝗧𝗜𝗢𝗡\n`;
      triviaMsg += "━━━━━━━━━━━━━━━━━━━━\n\n";
      triviaMsg += `${diffEmoji} Difficulty: ${difficulty.toUpperCase()}\n`;
      triviaMsg += `💰 Reward: $${reward}\n`;
      triviaMsg += `📚 Category: ${questionData.category}\n\n`;
      triviaMsg += `${question}\n\n`;

      allAnswers.forEach((answer, index) => {
        triviaMsg += `${index + 1}. ${answer}\n`;
      });

      triviaMsg += "\nReply with the number (1-4):";

      await message.reply(triviaMsg, (err, info) => {
        if (info) {
          // Store active trivia
          triviaActive.set(senderID, {
            correctIndex: correctIndex,
            correctAnswer: correctAnswer,
            reward: reward,
            difficulty: difficulty,
            timestamp: Date.now()
          });

          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: senderID,
            messageID: info.messageID
          });

          // Auto-expire after 60 seconds
          setTimeout(() => {
            if (triviaActive.has(senderID)) {
              const data = triviaActive.get(senderID);
              if (data.timestamp === triviaActive.get(senderID)?.timestamp) {
                triviaActive.delete(senderID);
              }
            }
          }, 60000);
        }
      });

    } catch (error) {
      console.error("Trivia error:", error);
      return message.reply("❌ Failed to fetch trivia question. Please try again later.");
    }
  },

  onReply: async function ({ message, event, Reply, usersData }) {
    const userID = event.senderID;
    const answer = parseInt(event.body?.trim());

    if (userID !== Reply.author) return;

    global.GoatBot.onReply.delete(Reply.messageID);

    const triviaData = triviaActive.get(userID);

    if (!triviaData) {
      return message.reply("❌ This trivia question has expired or been answered.");
    }

    triviaActive.delete(userID);

    if (!answer || answer < 1 || answer > 4) {
      return message.reply("❌ Invalid answer! Please pick 1-4.");
    }

    const userData = await usersData.get(userID);
    const balance = userData.money || 0;

    if (answer - 1 === triviaData.correctIndex) {
      // Correct!
      const newBalance = balance + triviaData.reward;

      await usersData.set(userID, {
        money: newBalance,
        exp: userData.exp,
        data: userData.data
      });

      return message.reply(
        `✅ 𝗖𝗢𝗥𝗥𝗘𝗖𝗧! 🎉\n\n` +
        `You got it right!\n` +
        `💰 Earned: $${triviaData.reward}\n\n` +
        `💵 New Balance: $${newBalance.toLocaleString()}\n\n` +
        `Play again: +trivia ${triviaData.difficulty}`
      );
    } else {
      // Wrong
      return message.reply(
        `❌ 𝗪𝗥𝗢𝗡𝗚! 😔\n\n` +
        `The correct answer was:\n${triviaData.correctAnswer}\n\n` +
        `Better luck next time!\n` +
        `Try again: +trivia ${triviaData.difficulty}`
      );
    }
  }
};
