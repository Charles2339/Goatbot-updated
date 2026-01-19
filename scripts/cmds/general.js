module.exports = {
  config: {
    name: "general",
    aliases: ["gk", "generalknowledge", "trivia"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 3,
    role: 0,
    description: {
      en: "Answer general knowledge questions and earn money + EXP!"
    },
    category: "game",
    guide: {
      en: "{pn} <difficulty>\nDifficulties: easy, mid, hard, hell\n\nExample: {pn} easy\n\nRewards:\n🟢 Easy: $500 + 25 EXP\n🟡 Mid: $1,250 + 62 EXP\n🟠 Hard: $2,500 + 100 EXP\n🔴 Hell: $10,000 + 500 EXP"
    }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;

    if (args.length === 0) {
      return message.reply(
        "🌍 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 𝗞𝗡𝗢𝗪𝗟𝗘𝗗𝗚𝗘 𝗤𝗨𝗜𝗭\n\n" +
        "Choose a difficulty:\n" +
        "🟢 +general easy ($500 + 25 EXP)\n" +
        "🟡 +general mid ($1,250 + 62 EXP)\n" +
        "🟠 +general hard ($2,500 + 100 EXP)\n" +
        "🔴 +general hell ($10,000 + 500 EXP)"
      );
    }

    const difficulty = args[0].toLowerCase();

    const questions = {
      easy: [
        { q: "What is the capital of France?", a: "Paris", options: ["London", "Paris", "Berlin", "Madrid"] },
        { q: "How many continents are there?", a: "7", options: ["5", "6", "7", "8"] },
        { q: "What is the largest ocean on Earth?", a: "Pacific Ocean", options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"] },
        { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci", options: ["Michelangelo", "Leonardo da Vinci", "Raphael", "Picasso"] },
        { q: "What is the smallest country in the world?", a: "Vatican City", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"] },
        { q: "How many colors are in a rainbow?", a: "7", options: ["5", "6", "7", "8"] },
        { q: "What is the tallest mountain in the world?", a: "Mount Everest", options: ["K2", "Mount Everest", "Kilimanjaro", "Denali"] },
        { q: "Which planet is known as the Red Planet?", a: "Mars", options: ["Venus", "Mars", "Jupiter", "Saturn"] },
        { q: "What is the largest mammal in the world?", a: "Blue Whale", options: ["Elephant", "Blue Whale", "Giraffe", "Whale Shark"] },
        { q: "How many days are in a leap year?", a: "366", options: ["364", "365", "366", "367"] },
        { q: "What is the currency of Japan?", a: "Yen", options: ["Yuan", "Yen", "Won", "Ringgit"] },
        { q: "Which country is home to the kangaroo?", a: "Australia", options: ["New Zealand", "Australia", "South Africa", "Brazil"] },
        { q: "What is the freezing point of water in Celsius?", a: "0", options: ["-1", "0", "1", "32"] },
        { q: "How many sides does a hexagon have?", a: "6", options: ["5", "6", "7", "8"] },
        { q: "What is the largest planet in our solar system?", a: "Jupiter", options: ["Saturn", "Jupiter", "Neptune", "Uranus"] }
      ],

      mid: [
        { q: "What is the capital of Australia?", a: "Canberra", options: ["Sydney", "Melbourne", "Canberra", "Perth"] },
        { q: "Who wrote 'Romeo and Juliet'?", a: "William Shakespeare", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"] },
        { q: "What is the speed of light in km/s?", a: "300,000", options: ["150,000", "300,000", "500,000", "1,000,000"] },
        { q: "Which country has the most pyramids?", a: "Sudan", options: ["Egypt", "Mexico", "Sudan", "Peru"] },
        { q: "What is the longest river in the world?", a: "Nile River", options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"] },
        { q: "In which year did World War II end?", a: "1945", options: ["1943", "1944", "1945", "1946"] },
        { q: "What is the chemical symbol for gold?", a: "Au", options: ["Go", "Gd", "Au", "Ag"] },
        { q: "How many bones are in the human body?", a: "206", options: ["196", "206", "216", "226"] },
        { q: "What is the smallest bone in the human body?", a: "Stapes", options: ["Femur", "Stapes", "Tibia", "Radius"] },
        { q: "Which ocean is the Bermuda Triangle located in?", a: "Atlantic Ocean", options: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"] },
        { q: "What is the hardest natural substance on Earth?", a: "Diamond", options: ["Gold", "Iron", "Diamond", "Platinum"] },
        { q: "Who developed the theory of relativity?", a: "Albert Einstein", options: ["Isaac Newton", "Albert Einstein", "Stephen Hawking", "Nikola Tesla"] },
        { q: "What is the largest desert in the world?", a: "Antarctic Desert", options: ["Sahara Desert", "Arabian Desert", "Antarctic Desert", "Gobi Desert"] },
        { q: "How many teeth does an adult human have?", a: "32", options: ["28", "30", "32", "34"] },
        { q: "What year did the Titanic sink?", a: "1912", options: ["1910", "1911", "1912", "1913"] }
      ],

      hard: [
        { q: "What is the smallest unit of digital information?", a: "Bit", options: ["Byte", "Bit", "Kilobyte", "Nibble"] },
        { q: "Who was the first woman to win a Nobel Prize?", a: "Marie Curie", options: ["Rosalind Franklin", "Marie Curie", "Ada Lovelace", "Dorothy Hodgkin"] },
        { q: "What is the rarest blood type?", a: "AB negative", options: ["O negative", "AB negative", "B negative", "A negative"] },
        { q: "How many time zones does Russia have?", a: "11", options: ["9", "10", "11", "12"] },
        { q: "What is the oldest known written language?", a: "Sumerian", options: ["Latin", "Sanskrit", "Sumerian", "Egyptian"] },
        { q: "What element has the atomic number 1?", a: "Hydrogen", options: ["Helium", "Hydrogen", "Lithium", "Carbon"] },
        { q: "Who discovered penicillin?", a: "Alexander Fleming", options: ["Louis Pasteur", "Alexander Fleming", "Jonas Salk", "Edward Jenner"] },
        { q: "What is the boiling point of water in Fahrenheit?", a: "212", options: ["100", "180", "212", "250"] },
        { q: "Which country invented paper?", a: "China", options: ["Egypt", "Greece", "China", "India"] },
        { q: "What is the study of earthquakes called?", a: "Seismology", options: ["Geology", "Seismology", "Volcanology", "Meteorology"] },
        { q: "How many keys are on a standard piano?", a: "88", options: ["76", "82", "88", "96"] },
        { q: "What is the name of the longest bone in the body?", a: "Femur", options: ["Humerus", "Tibia", "Femur", "Fibula"] },
        { q: "Who painted 'The Starry Night'?", a: "Vincent van Gogh", options: ["Pablo Picasso", "Vincent van Gogh", "Claude Monet", "Salvador Dali"] },
        { q: "What is the currency of Switzerland?", a: "Swiss Franc", options: ["Euro", "Swiss Franc", "Pound", "Krone"] },
        { q: "How many strings does a violin have?", a: "4", options: ["4", "5", "6", "7"] }
      ],

      hell: [
        { q: "What is the only letter not appearing in US state names?", a: "Q", options: ["Q", "X", "Z", "J"] },
        { q: "What is the most abundant element in the universe?", a: "Hydrogen", options: ["Oxygen", "Carbon", "Hydrogen", "Helium"] },
        { q: "Who was the youngest US president to be inaugurated?", a: "Theodore Roosevelt", options: ["JFK", "Theodore Roosevelt", "Bill Clinton", "Barack Obama"] },
        { q: "What is the world's longest-reigning current monarch?", a: "Hassanal Bolkiah", options: ["Queen Elizabeth II", "Hassanal Bolkiah", "Akihito", "Carl XVI Gustaf"] },
        { q: "What is the square root of 169?", a: "13", options: ["11", "12", "13", "14"] },
        { q: "Which element has the chemical symbol 'W'?", a: "Tungsten", options: ["Titanium", "Tungsten", "Tin", "Thallium"] },
        { q: "What is the only metal that is liquid at room temp?", a: "Mercury", options: ["Gallium", "Mercury", "Cesium", "Francium"] },
        { q: "How many chambers does an octopus heart have?", a: "3", options: ["1", "2", "3", "4"] },
        { q: "What is the name of the closest star to Earth?", a: "Proxima Centauri", options: ["Alpha Centauri", "Proxima Centauri", "Sirius", "Betelgeuse"] },
        { q: "What is the study of flags called?", a: "Vexillology", options: ["Cartography", "Vexillology", "Heraldry", "Numismatics"] },
        { q: "How many bones does a shark have?", a: "0", options: ["0", "50", "100", "206"] },
        { q: "What is the rarest M&M color?", a: "Brown", options: ["Red", "Brown", "Yellow", "Green"] },
        { q: "How many hearts does an octopus have?", a: "3", options: ["1", "2", "3", "4"] },
        { q: "What is the world's most expensive spice by weight?", a: "Saffron", options: ["Vanilla", "Saffron", "Cardamom", "Cinnamon"] },
        { q: "What is the fear of long words called?", a: "Hippopotomonstrosesquippedaliophobia", options: ["Sesquipedalophobia", "Hippopotomonstrosesquippedaliophobia", "Logophobia", "Verbophobia"] }
      ]
    };

    const rewards = {
      easy: { exp: 25, money: 500 },
      mid: { exp: 62, money: 1250 },
      hard: { exp: 100, money: 2500 },
      hell: { exp: 500, money: 10000 }
    };

    const timeLimits = {
      easy: 30 * 1000,
      mid: 45 * 1000,
      hard: 60 * 1000,
      hell: 50 * 1000
    };

    const emojis = { easy: "🟢", mid: "🟡", hard: "🟠", hell: "🔴" };

    if (!rewards[difficulty]) {
      return message.reply("❌ Invalid difficulty! Choose: easy, mid, hard, hell");
    }

    // Random question
    const questionPool = questions[difficulty];
    const randomQ = questionPool[Math.floor(Math.random() * questionPool.length)];

    const timeText = `⏳ Time limit: ${timeLimits[difficulty] / 1000}s`;

    let questionMsg = `${emojis[difficulty]} 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 𝗞𝗡𝗢𝗪𝗟𝗘𝗗𝗚𝗘 ${emojis[difficulty]}\n\n`;
    questionMsg += `Difficulty: ${difficulty.toUpperCase()}\n`;
    questionMsg += `💰 Reward: $${rewards[difficulty].money.toLocaleString()} + ${rewards[difficulty].exp} EXP\n`;
    questionMsg += `${timeText}\n\n`;
    questionMsg += `❓ ${randomQ.q}\n\n`;

    randomQ.options.forEach((option, index) => {
      questionMsg += `${index + 1}. ${option}\n`;
    });

    questionMsg += "\nReply with the number (1-4):";

    await message.reply(questionMsg, (err, info) => {
      if (info) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: senderID,
          messageID: info.messageID,
          correctAnswer: randomQ.a,
          correctIndex: randomQ.options.indexOf(randomQ.a),
          reward: rewards[difficulty],
          difficulty: difficulty,
          timestamp: Date.now(),
          timeLimit: timeLimits[difficulty]
        });
      }
    });
  },

  onReply: async function ({ message, event, Reply, usersData, api }) {
    const userID = event.senderID;
    const answer = parseInt(event.body?.trim());

    if (userID !== Reply.author) return;

    global.GoatBot.onReply.delete(Reply.messageID);

    // Check time limit
    const timeTaken = (Date.now() - Reply.timestamp) / 1000;
    
    if (Date.now() - Reply.timestamp > Reply.timeLimit) {
      return message.reply("⏰ Time's up! Try again.");
    }

    if (!answer || answer < 1 || answer > 4) {
      return message.reply("❌ Invalid answer! Please pick 1-4.");
    }

    const user = await usersData.get(userID);

    // Get user info for name
    let userName = "User";
    try {
      const userInfo = await api.getUserInfo(userID);
      userName = userInfo[userID]?.name || "User";
    } catch (e) {
      userName = "User";
    }

    // Initialize stats
    if (!user.data) user.data = {};
    if (!user.data.gkStats) {
      user.data.gkStats = {
        totalQuestions: 0,
        correctAnswers: 0,
        totalEarned: 0
      };
    }

    const stats = user.data.gkStats;
    stats.totalQuestions += 1;

    if (answer - 1 === Reply.correctIndex) {
      // CORRECT
      stats.correctAnswers += 1;
      stats.totalEarned += Reply.reward.money;

      const totalExp = (user.exp || 0) + Reply.reward.exp;
      const totalMoney = (user.money || 0) + Reply.reward.money;
      
      const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

      let rank = "🌟";
      if (accuracy >= 95) rank = "🏆 Genius";
      else if (accuracy >= 85) rank = "⭐ Expert";
      else if (accuracy >= 75) rank = "🚀 Scholar";
      else if (accuracy >= 60) rank = "💫 Learner";
      else rank = "🌟 Beginner";

      await usersData.set(userID, {
        ...user,
        exp: totalExp,
        money: totalMoney,
        data: user.data
      });

      message.reply(
        `✅ 𝗖𝗢𝗥𝗥𝗘𝗖𝗧! 🎉\n\n` +
        `💰 𝗠𝗼𝗻𝗲𝘆: +$${Reply.reward.money.toLocaleString()}\n` +
        `✨ 𝗘𝗫𝗣: +${Reply.reward.exp}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 𝗦𝗰𝗼𝗿𝗲: ${stats.correctAnswers}/${stats.totalQuestions} (${accuracy}%)\n` +
        `⚡ 𝗧𝗶𝗺𝗲: ${timeTaken.toFixed(1)}s\n` +
        `💵 𝗧𝗼𝘁𝗮𝗹 𝗘𝗮𝗿𝗻𝗲𝗱: $${stats.totalEarned.toLocaleString()}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 ${userName} ${rank}`
      );
    } else {
      // WRONG
      const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

      await usersData.set(userID, {
        ...user,
        data: user.data
      });

      message.reply(
        `❌ 𝗪𝗥𝗢𝗡𝗚! 😔\n\n` +
        `💭 𝗬𝗼𝘂𝗿 𝗔𝗻𝘀𝘄𝗲𝗿: ${answer}\n` +
        `✅ 𝗖𝗼𝗿𝗿𝗲𝗰𝘁: ${Reply.correctAnswer}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 𝗦𝗰𝗼𝗿𝗲: ${stats.correctAnswers}/${stats.totalQuestions} (${accuracy}%)\n` +
        `⚡ 𝗧𝗶𝗺𝗲: ${timeTaken.toFixed(1)}s\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Keep learning! 📚`
      );
    }
  }
};
