module.exports = {
  config: {
    name: "smartest",
    aliases: ["smart", "topexp", "brainy"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 5,
    role: 0,
    description: {
      en: "Display the top 10 smartest users (by EXP)"
    },
    category: "game",
    guide: {
      en: "{pn}\nShows the top 10 users with the most EXP from answering math questions"
    }
  },

  onStart: async function ({ message, usersData, event, api }) {
    try {
      // Get all users data
      const allUsers = await usersData.getAll();

      // Filter and sort users by EXP
      const smartestUsers = allUsers
        .filter(user => user.exp !== undefined && user.exp > 0)
        .sort((a, b) => b.exp - a.exp)
        .slice(0, 10);

      if (smartestUsers.length === 0) {
        return message.reply("❌ No users have earned EXP yet!\n\nPlay +maths to start earning EXP! 🧠");
      }

      // Build the leaderboard message
      let leaderboard = "🧠 𝗧𝗢𝗣 𝟭𝟬 𝗦𝗠𝗔𝗥𝗧𝗘𝗦𝗧 𝗨𝗦𝗘𝗥𝗦 🧠\n";
      leaderboard += "━━━━━━━━━━━━━━━━━━━━\n\n";

      for (let i = 0; i < smartestUsers.length; i++) {
        const user = smartestUsers[i];
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

        // Format EXP with commas
        const formattedExp = user.exp.toLocaleString();

        // Check if this is the current user
        const isCurrentUser = user.userID === event.senderID;
        const indicator = isCurrentUser ? " 👈 (You)" : "";

        leaderboard += `${medal} ${userName}${indicator}\n`;
        leaderboard += `   ⭐ ${formattedExp} EXP\n\n`;
      }

      // Check if current user is in top 10, if not show their rank
      const currentUserIndex = allUsers
        .filter(user => user.exp !== undefined && user.exp > 0)
        .sort((a, b) => b.exp - a.exp)
        .findIndex(user => user.userID === event.senderID);

      if (currentUserIndex > 9 && currentUserIndex !== -1) {
        const currentUser = allUsers.find(user => user.userID === event.senderID);
        const formattedExp = (currentUser.exp || 0).toLocaleString();
        leaderboard += `━━━━━━━━━━━━━━━━━━━━\n`;
        leaderboard += `📍 Your Rank: #${currentUserIndex + 1}\n`;
        leaderboard += `📊 Your EXP: ${formattedExp}`;
      }

      return message.reply(leaderboard);

    } catch (error) {
      console.error("Error in smartest command:", error);
      return message.reply("❌ An error occurred while fetching the leaderboard. Please try again.");
    }
  }
};
