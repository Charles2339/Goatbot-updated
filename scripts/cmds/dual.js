const fs = require("fs");
const path = require("path");

global.rpgBattles = global.rpgBattles || new Map();
global.rpgInvites = global.rpgInvites || new Map();

module.exports = {
    config: {
        name: "dual",
        version: "2.5.0",
        author: "Charles MK",
        countDown: 5,
        role: 0,
        description: "Invite users to a dual with traits and arsenal checks",
        category: "game",
        guide: "{pn} @mention"
    },

    onStart: async function ({ api, event, args, usersData }) {
        const { threadID, messageID, senderID, mentions } = event;
        const targetID = Object.keys(mentions).length > 0 ? Object.keys(mentions)[0] : args[0];

        if (!targetID || targetID == senderID) return api.sendMessage("⚠️ Tag an opponent!", threadID, messageID);

        const p1Name = (await usersData.get(senderID)).name;
        const p2Name = (await usersData.get(targetID)).name;

        const inviteID = `${threadID}_${targetID}`;
        global.rpgInvites.set(inviteID, { challengerID: senderID, challengerName: p1Name, time: Date.now() });

        setTimeout(() => {
            if (global.rpgInvites.has(inviteID)) {
                global.rpgInvites.delete(inviteID);
                api.sendMessage(`⌛ Match invite from ${p1Name} expired.`, threadID);
            }
        }, 60000);

        return api.sendMessage(`⚔️ ${p1Name} challenged ${p2Name}!\n👉 Reply "Accept" within 60s.`, threadID, messageID);
    },

    onReply: async function ({ api, event, Reply, usersData }) {
        const { threadID, senderID, messageID, body } = event;
        const input = body.toLowerCase();
        const inviteID = `${threadID}_${senderID}`;
        const invite = global.rpgInvites.get(inviteID);

        if (!invite) return;

        // 1. ACCEPTANCE & GEAR CHECK
        if (input === "accept") {
            const p1 = await getOrInitStats(invite.challengerID, usersData);
            const p2 = await getOrInitStats(senderID, usersData);

            let arsenalMsg = `📊 𝗔𝗥𝗦𝗘𝗡𝗔𝗟 𝗖𝗛𝗘𝗖𝗞 📊\n━━━━━━━━━━━━\n` +
                `👤 ${invite.challengerName}\n🧬 Trait: ${p1.trait.name}\n❤️ HP: ${p1.hp} | 💪 STR: ${p1.str} | ⚡ SPD: ${p1.speed}\n` +
                `━━━━━━━━━━━━\n` +
                `👤 ${p2.name}\n🧬 Trait: ${p2.trait.name}\n❤️ HP: ${p2.hp} | 💪 STR: ${p2.str} | ⚡ SPD: ${p2.speed}\n\n`;

            const p1HasGear = (await usersData.get(invite.challengerID)).data.inventory?.length > 0;
            const p2HasGear = (await usersData.get(senderID)).data.inventory?.length > 0;

            if (!p1HasGear || !p2HasGear) {
                arsenalMsg += `👊 No equipment found! Continue as a FIST FIGHT?\n👉 Reply "Yes" or "No"`;
                return api.sendMessage(arsenalMsg, threadID, messageID);
            }
            
            global.rpgInvites.delete(inviteID);
            return startBattle(api, invite.challengerID, senderID, p1, p2, threadID, false);
        }

        // 2. FIST FIGHT CONFIRMATION
        if (input === "yes") {
            const p1 = await getOrInitStats(invite.challengerID, usersData);
            const p2 = await getOrInitStats(senderID, usersData);
            global.rpgInvites.delete(inviteID);
            return startBattle(api, invite.challengerID, senderID, p1, p2, threadID, true);
        }
    }
};

async function getOrInitStats(userID, usersData) {
    const userData = await usersData.get(userID);
    if (userData.data.rpgStats) return { ...userData.data.rpgStats, name: userData.name };

    const traits = JSON.parse(fs.readFileSync(path.join(__dirname, 'rpg', 'traits.json'), 'utf8'));
    const trait = traits[Math.floor(Math.random() * traits.length)];

    const stats = {
        hp: 100 + (trait.hp || 0),
        speed: 1 + (trait.speed || 0),
        dex: 1 + (trait.dex || 0),
        str: 1 + (trait.str || 0),
        int: 1 + (trait.int || 0),
        luk: 1 + (trait.luk || 0),
        energy: 100 + (trait.energy || 0),
        trait: trait
    };

    await usersData.set(userID, { data: { ...userData.data, rpgStats: stats } });
    return { ...stats, name: userData.name };
}

async function startBattle(api, p1ID, p2ID, p1, p2, threadID, isFist) {
    const battleKey = `${threadID}_battle`;
    global.rpgBattles.set(battleKey, { p1: {...p1, id: p1ID}, p2: {...p2, id: p2ID}, turn: p1ID });

    api.sendMessage(`🥊 ${isFist ? "FIST FIGHT" : "ARMED DUAL"} START!\n━━━━━━━━━━━━\n👉 ${p1.name}, choose:\n• Punch (10 NRG)\n• Consecutive (25 NRG)\n• Uppercut (15 NRG)\n• Dodge (5 NRG)`, threadID);
}
