module.exports = {
    config: {
        name: "ban",
        version: "1.1.0",
        author: "Charles MK",
        countDown: 5,
        role: 2, // Admin only
        description: "Ban/Unban a user from using the bot (Silent)",
        category: "admin",
        guide: "{pn} [uid/mention]"
    },

    onStart: async function ({ api, event, args, globalData }) {
        const { threadID, messageID, mentions } = event;
        const targetID = Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : args[0];

        if (!targetID || isNaN(targetID)) {
            return api.sendMessage("⚠️ Please provide a valid UID or mention the user.", threadID, messageID);
        }

        // Get the current global ban list from MongoDB
        const currentData = await globalData.get("bannedUsers") || [];
        
        if (currentData.includes(targetID)) {
            // Unban logic
            const newData = currentData.filter(id => id !== targetID);
            await globalData.set("bannedUsers", newData);
            return api.sendMessage(`✅ UID ${targetID} has been unbanned.`, threadID);
        } else {
            // Ban logic
            currentData.push(targetID);
            await globalData.set("bannedUsers", currentData);
            return api.sendMessage(`🤫 UID ${targetID} has been silently banned.`, threadID);
        }
    }
};
