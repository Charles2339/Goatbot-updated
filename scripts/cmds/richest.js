module.exports = {
  config: {
    name: "richest",
    aliases: ["rich", "top", "leaderboard"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 5,
    role: 0,
    description: {
      en: "Display the top 10 richest users"
    },
    category: "economy",
    guide: {
      en: "{pn}\nShows the top 10 richest users in the bot"
    }
  },

  onStart: async function ({ message, usersData, event, api }) {
    try {
      // Get all users data
      const allUsers = await usersData.getAll();

      // Filter and sort users by money
      const richestUsers = allUsers
        .filter(user => user.money !== undefined)
        .sort((a, b) => b.money - a.money)
        .slice(0, 10);

      if (richestUsers.length === 0) {
        return message.reply("❌ No users found with money data.");
      }

      // Build the leaderboard message
      let leaderboard = "💰 𝗧𝗢𝗣 𝟭𝟬 𝗥𝗜𝗖𝗛𝗘𝗦𝗧 𝗨𝗦𝗘𝗥𝗦 💰\n";
      leaderboard += "━━━━━━━━━━━━━━━━━━━━\n\n";

      for (let i = 0; i < richestUsers.length; i++) {
        const user = richestUsers[i];
        const rank = i + 1;
        
        // Medal emojis for top 3
        let medal = "";
        if (rank === 1) medal = "🥇";
        else if (rank === 2) medal = "🥈";
        else if (rank === 3) medal = "🥉";
        else medal = `${rank}.`;

        // Get user info
        let userName = "Unknown User";
        try {
          const userInfo = await api.getUserInfo(user.userID);
          userName = userInfo[user.userID]?.name || "Unknown User";
        } catch (error) {
          userName = "Unknown User";
        }

        // Format money with commas
        const formattedMoney = user.money.toLocaleString();

        // Check if this is the current user
        const isCurrentUser = user.userID === event.senderID;
        const indicator = isCurrentUser ? " 👈 (You)" : "";

        leaderboard += `${medal} ${userName}${indicator}\n`;
        leaderboard += `   💵 $${formattedMoney}\n\n`;
      }

      // Check if current user is in top 10, if not show their rank
      const currentUserIndex = allUsers
        .filter(user => user.money !== undefined)
        .sort((a, b) => b.money - a.money)
        .findIndex(user => user.userID === event.senderID);

      if (currentUserIndex > 9) {
        const currentUser = allUsers.find(user => user.userID === event.senderID);
        const formattedMoney = currentUser.money.toLocaleString();
        leaderboard += `━━━━━━━━━━━━━━━━━━━━\n`;
        leaderboard += `📍 Your Rank: #${currentUserIndex + 1}\n`;
        leaderboard += `💵 Your Balance: $${formattedMoney}`;
      }

      return message.reply(leaderboard);

    } catch (error) {
      console.error("Error in richest command:", error);
      return message.reply("❌ An error occurred while fetching the leaderboard. Please try again.");
    }
  }
};
