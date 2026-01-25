const axios = require('axios');
const { connectDB, UserStats } = require('../../database/mongodb'); 

module.exports = {
  config: {
    name: "tof",
    aliases: ["trueorfalse"],
    version: "1.4",
    author: "Charles MK",
    countDown: 5,
    role: 0,
    category: "game",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, event, api }) {
    await connectDB(); 
    
    try {
      const res = await axios.get("https://opentdb.com/api.php?amount=1&type=boolean");
      const data = res.data.results[0];
      const question = data.question
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&amp;/g, "&");
      
      const msg = `🧩 𝗧𝗥𝗨𝗘 𝗢𝗥 𝗙𝗔𝗟𝗦𝗘\n\n💭 𝗤𝘂𝖾𝗌𝗍𝗂𝗼𝗻: *${question}*\n\n😲: **True**\n👍: **False**\n\n⏰ *30 seconds to react!*`;
      const info = await message.reply(msg);

      global.GoatBot.onReaction.set(info.messageID, {
        commandName: this.config.name,
        author: event.senderID,
        correctAnswer: data.correct_answer,
        status: "active"
      });

    } catch (e) {
      return message.reply("❌ *API Error. Try again later.*");
    }
  },

  onReaction: async function ({ api, event, Reaction, usersData }) {
    if (!Reaction || Reaction.status !== "active" || event.userID !== Reaction.author) return;

    // Updated Reaction Logic: Added '😲' and improved detection
    let userChoice = null;
    const react = event.reaction;

    if (react === "😲" || react === "😮") userChoice = "True"; 
    else if (react === "👍") userChoice = "False";

    if (!userChoice) return;

    global.GoatBot.onReaction.delete(Reaction.messageID);
    await connectDB();

    let statsDoc = await UserStats.findOne({ userID: event.userID });
    if (!statsDoc) statsDoc = new UserStats({ userID: event.userID });

    const isCorrect = userChoice === Reaction.correctAnswer;
    const user = await usersData.get(event.userID);
    
    let rewardMoney = 0;
    let rewardExp = 0;
    let streakBonusMsg = "";

    if (isCorrect) {
      statsDoc.tof.correct++;
      statsDoc.tof.streak++;
      
      rewardMoney = Math.floor(Math.random() * 5001) + 10000;
      rewardExp = 150;

      if (statsDoc.tof.streak === 5) {
        rewardMoney += 25000;
        rewardExp += 120;
        statsDoc.tof.streak = 0; 
        streakBonusMsg = "\n🔥 ***MEGA STREAK BONUS: +$25,000 & +120 EXP!***";
      }
    } else {
      statsDoc.tof.wrong++;
      statsDoc.tof.streak = 0; 
    }

    await statsDoc.save();

    const updatedUser = await usersData.set(event.userID, {
      money: (user.money || 0) + rewardMoney,
      exp: (user.exp || 0) + rewardExp
    });

    const resultHeader = isCorrect ? "✅ 𝘾𝙊𝙍𝙍𝙀𝘾𝙏!" : "❌ 𝙄𝙉𝘾𝙊𝙍𝙍𝙀𝘾𝙏";
    const justification = isCorrect ? "" : `\n𝙅𝙐𝙎𝙏𝙄𝙁𝙄𝘾𝘼𝙏𝙄𝙊𝙉: *Answer was ${Reaction.correctAnswer}*`;

    return api.sendMessage(
      `${resultHeader}${streakBonusMsg}${justification}\n\n𝙀𝘼𝙍𝙉𝙀𝘿: **$${rewardMoney.toLocaleString()}**\n𝙀𝙓𝙋: **+${rewardExp}**\n\n📊 𝙇𝙄𝙁𝙀𝙏𝙄𝙈𝙀 𝙎𝙏𝘼𝙏𝙎:\n✅ Correct: *${statsDoc.tof.correct}*\n❌ Incorrect: *${statsDoc.tof.wrong}*\n🔥 Current Streak: *${statsDoc.tof.streak}/5*\n\n𝐂𝐔𝐑𝐑𝐄𝐍𝐓 𝐁𝐀𝐋𝐀𝐍𝐂𝐄: **$${updatedUser.money.toLocaleString()}**`,
      event.threadID,
      event.messageID
    );
  }
};
