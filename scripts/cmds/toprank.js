module.exports = {
  config: {
    name: "toprank",
    version: "1.0",
    author: "Charles MK",
    countDown: 5,
    role: 0,
    description: { en: "Show the top 10 users with the highest levels." },
    category: "rank",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, usersData, commandName, envCommands }) {
    // We use the same deltaNext as your rank.js for consistency
    // If you don't have it in envConfig, we'll default to 5
    const deltaNext = 5; 

    const expToLevel = (exp) => {
      if (!exp || isNaN(exp) || exp < 0) return 1;
      return Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
    };

    const allUsers = await usersData.getAll();
    
    // Sort by EXP descending
    const sortedUsers = allUsers
      .filter(u => u.name && typeof u.exp === 'number')
      .sort((a, b) => b.exp - a.exp);

    const top10 = sortedUsers.slice(0, 10);
    const totalUsers = allUsers.length;

    let msg = `🏆 **TOP 10 RANKINGS**\n${"━".repeat(15)}\n\n`;

    top10.forEach((user, index) => {
      const level = expToLevel(user.exp);
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
      
      msg += `${medal} **${user.name}**\n`;
      msg += `╰┈➤ Level: **${level}** | Exp: **${user.exp.toLocaleString()}**\n\n`;
    });

    msg += `${"━".repeat(15)}\n`;
    msg += `👥 **Total Bot Users:** ${totalUsers.toLocaleString()}`;

    return message.reply(msg);
  }
};
