module.exports = {
    config: {
        name: "ban",
        version: "1.1.1",
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

        // Fetch current list
        const currentData = await globalData.get("bannedUsers") || [];
        let newData;
        
        if (currentData.includes(targetID)) {
            newData = currentData.filter(id => id !== targetID);
            // Fix: Wrap the array in an object for globalData.set
            await globalData.set("bannedUsers", { bannedUsers: newData });
            return api.sendMessage(`✅ UID ${targetID} has been unbanned.`, threadID);
        } else {
            newData = [...currentData, targetID];
            // Fix: Wrap the array in an object for globalData.set
            await globalData.set("bannedUsers", { bannedUsers: newData });
            return api.sendMessage(`🤫 UID ${targetID} has been silently banned.`, threadID);
        }
    }
};
