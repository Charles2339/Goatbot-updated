const fs = require("fs-extra");
const nullAndUndefined = [undefined, null];

function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
}

async function checkSpamBannedThread(threadID, globalData) {
    const spamBannedThreads = await globalData.get("spamBannedThreads", "data", {});
    if (spamBannedThreads[threadID]) {
        if (spamBannedThreads[threadID].expireTime > Date.now()) {
            return true;
        } else {
            delete spamBannedThreads[threadID];
            await globalData.set("spamBannedThreads", spamBannedThreads, "data");
        }
    }
    return false;
}

async function trackCommandSpam(threadID, threadName, globalData, message) {
    const config = global.GoatBot.config;
    const spamConfig = config.spamProtection || {
        commandThreshold: 8,
        timeWindow: 10,
        banDuration: 24
    };

    if (!global.temp.commandSpamTracker) {
        global.temp.commandSpamTracker = {};
    }

    const now = Date.now();
    const timeWindow = spamConfig.timeWindow * 1000;

    if (!global.temp.commandSpamTracker[threadID]) {
        global.temp.commandSpamTracker[threadID] = [];
    }

    global.temp.commandSpamTracker[threadID].push(now);

    global.temp.commandSpamTracker[threadID] = global.temp.commandSpamTracker[threadID]
        .filter(time => now - time < timeWindow);

    if (global.temp.commandSpamTracker[threadID].length >= spamConfig.commandThreshold) {
        const spamBannedThreads = await globalData.get("spamBannedThreads", "data", {});
        const banDuration = spamConfig.banDuration * 60 * 60 * 1000;

        spamBannedThreads[threadID] = {
            bannedAt: now,
            expireTime: now + banDuration,
            threadName: threadName || "Unknown",
            reason: "Command spam flood detected"
        };

        await globalData.set("spamBannedThreads", spamBannedThreads, "data");
        delete global.temp.commandSpamTracker[threadID];

        const hours = spamConfig.banDuration;
        message.reply(`⛔ | This group has been temporarily banned for ${hours} hours due to command spam.`);
        return true;
    }
    return false;
}

function getRole(threadData, senderID) {
    const config = global.GoatBot.config;
    const adminBot = config.adminBot || [];
    const devUsers = config.devUsers || [];
    const premiumUsers = config.premiumUsers || [];
    if (!senderID) return 0;
    const adminBox = threadData ? threadData.adminIDs || [] : [];

    if (devUsers.includes(senderID)) return 4;
    if (premiumUsers.includes(senderID)) return 3;
    if (adminBot.includes(senderID)) return 2;
    if (adminBox.includes(senderID)) return 1;
    return 0;
}

function getRoleConfig(utils, command, isGroup, threadData, commandName) {
    let roleConfig = { onStart: command.config.role || 0 };
    if (isGroup) roleConfig.onStart = threadData.data.setRole?.[commandName] ?? roleConfig.onStart;
    for (const key of ["onChat", "onStart", "onReaction", "onReply"]) {
        if (roleConfig[key] == undefined) roleConfig[key] = roleConfig.onStart;
    }
    return roleConfig;
}

function isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, lang) {
    const config = global.GoatBot.config;
    if (userData.banned.status == true) return true;
    if (config.adminOnly.enable == true && !config.adminBot.includes(senderID) && !config.adminOnly.ignoreCommand.includes(commandName)) return true;
    if (isGroup && threadData.banned.status == true) return true;
    return false;
}

module.exports = function (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) {
    return async function (event, message) {
        const { utils, client, GoatBot } = global;
        const { getPrefix, log, getTime } = utils;
        const { config } = GoatBot;
        const { body, threadID, isGroup } = event;

        if (!threadID) return;
        const senderID = event.userID || event.senderID || event.author;

        let threadData = global.db.allThreadData.find(t => t.threadID == threadID);
        let userData = global.db.allUserData.find(u => u.userID == senderID);

        if (!userData && !isNaN(senderID)) userData = await usersData.create(senderID);
        if (!threadData && !isNaN(threadID)) threadData = await threadsData.create(threadID);

        const prefix = getPrefix(threadID);
        const role = getRole(threadData, senderID);
        const langCode = threadData.data.lang || config.language || "en";

        const parameters = { api, usersData, threadsData, message, event, userModel, threadModel, prefix, role, globalData };

        // —————————————————————————————————————————————— //
        //                  ON START (Commands)           //
        // —————————————————————————————————————————————— //
        async function onStart() {
            if (!body || !body.startsWith(prefix)) return;

            const args = body.slice(prefix.length).trim().split(/ +/);
            let commandName = args.shift().toLowerCase();
            let command = GoatBot.commands.get(commandName) || GoatBot.commands.get(GoatBot.aliases.get(commandName));

            if (command) {
                commandName = command.config.name;

                // --- RESTRICTION CHECK (Only for Commands) ---
                if (isGroup && !["restrict", "unrestrict", "restricted"].includes(commandName)) {
                    const restrictions = threadData.data?.restrictions;
                    if (restrictions) {
                        // Check if command is admin-only
                        if (restrictions.global && restrictions.global.includes(commandName) && role < 2) {
                            return await message.reply(`👑 ${commandName} 𝗂𝗌 𝗋𝖾𝗌𝗍𝗋𝗂𝖼𝗍𝖾𝖽 𝗍𝗈 𝖺𝖽𝗆𝗂𝗇𝗌 𝗈𝗇𝗅𝗒`);
                        }
                        // Check if user is banned from command
                        if (restrictions.users && restrictions.users[senderID] && restrictions.users[senderID].includes(commandName)) {
                            return await message.reply(`🚫 𝖸𝗈𝗎 𝖺𝗋𝖾 𝗋𝖾𝗌𝗍𝗋𝗂𝖼𝗍𝖾𝖽 𝖿𝗋𝗈𝗆 𝗎𝗌𝗂𝗇𝗀 ${commandName}`);
                        }
                    }
                }

                if (isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, langCode)) return;

                const roleConfig = getRoleConfig(utils, command, isGroup, threadData, commandName);
                if (roleConfig.onStart > role) return await message.reply("⚠️ | You don't have permission.");

                try {
                    await command.onStart({ ...parameters, args, commandName });
                } catch (err) {
                    log.err("onStart", err);
                }
            }
        }

        // —————————————————————————————————————————————— //
        //                     ON REPLY                   //
        // —————————————————————————————————————————————— //
        async function onReply() {
            if (!event.messageReply) return;
            const { onReply } = GoatBot;
            const Reply = onReply.get(event.messageReply.messageID);
            if (!Reply) return;

            const command = GoatBot.commands.get(Reply.commandName);
            if (!command) return;

            const roleConfig = getRoleConfig(utils, command, isGroup, threadData, Reply.commandName);
            if (roleConfig.onReply > role) return;

            try {
                const args = body ? body.split(/ +/) : [];
                await command.onReply({ ...parameters, Reply, args, commandName: Reply.commandName });
            } catch (err) {
                log.err("onReply", err);
            }
        }

        // —————————————————————————————————————————————— //
        //                     ON CHAT                    //
        // —————————————————————————————————————————————— //
        async function onChat() {
            const { onChat } = GoatBot;
            for (const [key, command] of onChat) {
                if (!command || !command.onChat) continue;
                
                const roleConfig = getRoleConfig(utils, command, isGroup, threadData, key);
                if (roleConfig.onChat > role) continue;

                try {
                    await command.onChat({ ...parameters, commandName: key });
                } catch (err) {
                    log.err("onChat", err);
                }
            }
        }

        // —————————————————————————————————————————————— //
        //                   ON REACTION                  //
        // —————————————————————————————————————————————— //
        async function onReaction() {
            const { onReaction } = GoatBot;
            const Reaction = onReaction.get(event.messageID);
            if (!Reaction) return;

            const command = GoatBot.commands.get(Reaction.commandName);
            if (!command) return;

            const roleConfig = getRoleConfig(utils, command, isGroup, threadData, Reaction.commandName);
            if (roleConfig.onReaction > role) return;

            try {
                await command.onReaction({ ...parameters, Reaction, commandName: Reaction.commandName });
            } catch (err) {
                log.err("onReaction", err);
            }
        }

        // —————————————————————————————————————————————— //
        //                  ON ANY EVENT                  //
        // —————————————————————————————————————————————— //
        async function onAnyEvent() {
            const { onAnyEvent } = GoatBot;
            for (const [key, command] of onAnyEvent) {
                if (!command || !command.onAnyEvent) continue;

                try {
                    await command.onAnyEvent({ ...parameters, commandName: key });
                } catch (err) {
                    log.err("onAnyEvent", err);
                }
            }
        }

        // —————————————————————————————————————————————— //
        //                 HANDLER EVENT                  //
        // —————————————————————————————————————————————— //
        async function handlerEvent() {
            const { handlerEvent } = GoatBot;
            for (const [key, command] of handlerEvent) {
                if (!command || !command.handlerEvent) continue;

                try {
                    await command.handlerEvent({ ...parameters, commandName: key });
                } catch (err) {
                    log.err("handlerEvent", err);
                }
            }
        }

        // —————————————————————————————————————————————— //
        //                    ON EVENT                    //
        // —————————————————————————————————————————————— //
        async function onEvent() {
            const { onEvent } = GoatBot;
            const eventCommand = onEvent.get(event.logMessageType);
            if (!eventCommand) return;

            const roleConfig = getRoleConfig(utils, eventCommand, isGroup, threadData, eventCommand.config.name);
            if (roleConfig.onEvent > role) return;

            try {
                await eventCommand.onEvent({ ...parameters, commandName: eventCommand.config.name });
            } catch (err) {
                log.err("onEvent", err);
            }
        }

        // Execute handlers
        onAnyEvent();
        switch (event.type) {
            case "message":
            case "message_reply":
                await onStart();
                await onReply();
                await onChat();
                break;
            case "message_reaction":
                await onReaction();
                break;
            case "event":
                await handlerEvent();
                await onEvent();
                break;
        }

        return { onAnyEvent, onStart, onReply, onChat, onReaction, handlerEvent, onEvent };
    };
};
