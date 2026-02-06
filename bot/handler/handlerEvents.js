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
        message.reply(`⛔ | This group has been temporarily banned for ${hours} hours due to command spam.\n\nPlease wait or contact an admin to unban.`);

        global.utils.log.warn("SPAM_BAN", `Thread ${threadID} (${threadName}) banned for command spam`);

        return true;
    }

    return false;
}

function getRole(threadData, senderID) {
    const config = global.GoatBot.config;
    const adminBot = config.adminBot || [];
    const devUsers = config.devUsers || [];
    const premiumUsers = config.premiumUsers || [];
    if (!senderID)
        return 0;
    const adminBox = threadData ? threadData.adminIDs || [] : [];

    if (devUsers.includes(senderID))
        return 4;
    if (premiumUsers.includes(senderID)) {
        const userData = global.db.allUserData.find(u => u.userID == senderID);
        if (userData && userData.data && userData.data.premiumExpireTime) {
            if (userData.data.premiumExpireTime < Date.now()) {
                global.temp.expiredPremiumUsers = global.temp.expiredPremiumUsers || [];
                if (!global.temp.expiredPremiumUsers.includes(senderID)) {
                    global.temp.expiredPremiumUsers.push(senderID);
                }
                return adminBot.includes(senderID) ? 2 : (adminBox.includes(senderID) ? 1 : 0);
            }
        }
        return 3;
    }
    if (adminBot.includes(senderID))
        return 2;
    if (adminBox.includes(senderID))
        return 1;
    return 0;
}

async function checkMoneyRequirement(userData, requiredMoney) {
    if (!requiredMoney || requiredMoney <= 0)
        return true;
    const userMoney = userData.money || 0;
    return userMoney >= requiredMoney;
}

function getText(type, reason, time, targetID, lang) {
    const utils = global.utils;
    if (type == "userBanned")
        return utils.getText({ lang, head: "handlerEvents" }, "userBanned", reason, time, targetID);
    else if (type == "threadBanned")
        return utils.getText({ lang, head: "handlerEvents" }, "threadBanned", reason, time, targetID);
    else if (type == "onlyAdminBox")
        return utils.getText({ lang, head: "handlerEvents" }, "onlyAdminBox");
    else if (type == "onlyAdminBot")
        return utils.getText({ lang, head: "handlerEvents" }, "onlyAdminBot");
}

function replaceShortcutInLang(text, prefix, commandName) {
    return text
        .replace(/\{(?:p|prefix)\}/g, prefix)
        .replace(/\{(?:n|name)\}/g, commandName)
        .replace(/\{pn\}/g, `${prefix}${commandName}`);
}

function getRoleConfig(utils, command, isGroup, threadData, commandName) {
    let roleConfig;
    if (utils.isNumber(command.config.role)) {
        roleConfig = {
            onStart: command.config.role
        };
    }
    else if (typeof command.config.role == "object" && !Array.isArray(command.config.role)) {
        if (!command.config.role.onStart)
            command.config.role.onStart = 0;
        roleConfig = command.config.role;
    }
    else {
        roleConfig = {
            onStart: 0
        };
    }

    if (isGroup)
        roleConfig.onStart = threadData.data.setRole?.[commandName] ?? roleConfig.onStart;

    for (const key of ["onChat", "onStart", "onReaction", "onReply"]) {
        if (roleConfig[key] == undefined)
            roleConfig[key] = roleConfig.onStart;
    }

    return roleConfig;
}

function isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, lang) {
    const config = global.GoatBot.config;
    const { adminBot, hideNotiMessage } = config;

    // check if user banned
    const infoBannedUser = userData.banned;
    if (infoBannedUser.status == true) {
        const { reason, date } = infoBannedUser;
        if (hideNotiMessage.userBanned == false)
            message.reply(getText("userBanned", reason, date, senderID, lang));
        return true;
    }

    // check if only admin bot
    if (
        config.adminOnly.enable == true
        && !adminBot.includes(senderID)
        && !config.adminOnly.ignoreCommand.includes(commandName)
    ) {
        if (hideNotiMessage.adminOnly == false)
            message.reply(getText("onlyAdminBot", null, null, null, lang));
        return true;
    }

    // ==========    Check Thread    ========== //
    if (isGroup == true) {
        if (
            threadData.data.onlyAdminBox === true
            && !threadData.adminIDs.includes(senderID)
            && !(threadData.data.ignoreCommanToOnlyAdminBox || []).includes(commandName)
        ) {
            // check if only admin box
            if (!threadData.data.hideNotiMessageOnlyAdminBox)
                message.reply(getText("onlyAdminBox", null, null, null, lang));
            return true;
        }

        // check if thread banned
        const infoBannedThread = threadData.banned;
        if (infoBannedThread.status == true) {
            const { reason, date } = infoBannedThread;
            if (hideNotiMessage.threadBanned == false)
                message.reply(getText("threadBanned", reason, date, threadID, lang));
            return true;
        }
    }
    return false;
}


function createGetText2(langCode, pathCustomLang, prefix, command) {
    const commandType = command.config.countDown ? "command" : "command event";
    const commandName = command.config.name;
    let customLang = {};
    let getText2 = () => { };
    if (fs.existsSync(pathCustomLang))
        customLang = require(pathCustomLang)[commandName]?.text || {};
    if (command.langs || customLang || {}) {
        getText2 = function (key, ...args) {
            let lang = command.langs?.[langCode]?.[key] || customLang[key] || "";
            lang = replaceShortcutInLang(lang, prefix, commandName);
            for (let i = args.length - 1; i >= 0; i--)
                lang = lang.replace(new RegExp(`%${i + 1}`, "g"), args[i]);
            return lang || `❌ Can't find text on language "${langCode}" for ${commandType} "${commandName}" with key "${key}"`;
        };
    }
    return getText2;
}

module.exports = function (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) {
    return async function (event, message) {

        const { utils, client, GoatBot } = global;
        const { getPrefix, removeHomeDir, log, getTime } = utils;
        const { config, configCommands: { envGlobal, envCommands, envEvents } } = GoatBot;
        const { autoRefreshThreadInfoFirstTime } = config.database;
        let { hideNotiMessage = {} } = config;

        const { body, messageID, threadID, isGroup } = event;

        // Check if has threadID
        if (!threadID)
            return;

        const senderID = event.userID || event.senderID || event.author;

        let threadData = global.db.allThreadData.find(t => t.threadID == threadID);
        let userData = global.db.allUserData.find(u => u.userID == senderID);

        if (!userData && !isNaN(senderID))
            userData = await usersData.create(senderID);

        if (!threadData && !isNaN(threadID)) {
            if (global.temp.createThreadDataError.includes(threadID))
                return;
            threadData = await threadsData.create(threadID);
            global.db.receivedTheFirstMessage[threadID] = true;
        }
        else {
            if (
                autoRefreshThreadInfoFirstTime === true
                && !global.db.receivedTheFirstMessage[threadID]
            ) {
                global.db.receivedTheFirstMessage[threadID] = true;
                await threadsData.refreshInfo(threadID);
            }
        }

        if (typeof threadData.settings.hideNotiMessage == "object")
            hideNotiMessage = threadData.settings.hideNotiMessage;

        const prefix = getPrefix(threadID);
        const role = getRole(threadData, senderID);
        const parameters = {
            api, usersData, threadsData, message, event,
            userModel, threadModel, prefix, dashBoardModel,
            globalModel, dashBoardData, globalData, envCommands,
            envEvents, envGlobal, role,
            removeCommandNameFromBody: function removeCommandNameFromBody(body_, prefix_, commandName_) {
                if ([body_, prefix_, commandName_].every(x => nullAndUndefined.includes(x)))
                    throw new Error("Please provide body, prefix and commandName to use this function, this function without parameters only support for onStart");
                for (let i = 0; i < arguments.length; i++)
                    if (typeof arguments[i] != "string")
                        throw new Error(`The parameter "${i + 1}" must be a string, but got "${getType(arguments[i])}"`);

                return body_.replace(new RegExp(`^${prefix_}(\\s+|)${commandName_}`, "i"), "").trim();
            }
        };
        const langCode = threadData.data.lang || config.language || "en";

        function createMessageSyntaxError(commandName) {
            message.SyntaxError = async function () {
                return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "commandSyntaxError", prefix, commandName));
            };
        }

        /*
         +-----------------------------------------------+
         |           WHEN CALL COMMAND                   |
         +-----------------------------------------------+
        */
        let isUserCallCommand = false;
        async function onStart() {
            // —————————————— CHECK USE BOT —————————————— //
            if (!body || !body.startsWith(prefix))
                return;

            // —————————— CHECK GLOBAL BAN (SILENT) —————————— //
            const globalBannedList = await globalData.get("bannedUsers", "data", []);
            if (globalBannedList.includes(senderID)) {
                // Silently ignore - no message sent
                return;
            }

            // —————————— CHECK SPAM BANNED THREAD —————————— //
            if (isGroup) {
                const isSpamBanned = await checkSpamBannedThread(threadID, globalData);
                if (isSpamBanned) {
                    if (!hideNotiMessage.threadBanned)
                        message.reply("⛔ | This group is temporarily banned due to command spam.");
                    return;
                }
            }
            const dateNow = Date.now();
            const args = body.slice(prefix.length).trim().split(/ +/);
            // ————————————  CHECK HAS COMMAND ——————————— //
            let commandName = args.shift().toLowerCase();
            let command = GoatBot.commands.get(commandName) || GoatBot.commands.get(GoatBot.aliases.get(commandName));
            // ———————— CHECK ALIASES SET BY GROUP ———————— //
            const aliasesData = threadData.data.aliases || {};
            for (const cmdName in aliasesData) {
                if (aliasesData[cmdName].includes(commandName)) {
                    command = GoatBot.commands.get(cmdName);
                    break;
                }
            }
            // ————————————— SET COMMAND NAME ————————————— //
            if (command)
                commandName = command.config.name;
            // ——————— FUNCTION REMOVE COMMAND NAME ———————— //
            function removeCommandNameFromBody(body_, prefix_, commandName_) {
                if (arguments.length) {
                    if (typeof body_ != "string")
                        throw new Error(`The first argument (body) must be a string, but got "${getType(body_)}"`);
                    if (typeof prefix_ != "string")
                        throw new Error(`The second argument (prefix) must be a string, but got "${getType(prefix_)}"`);
                    if (typeof commandName_ != "string")
                        throw new Error(`The third argument (commandName) must be a string, but got "${getType(commandName_)}"`);

                    return body_.replace(new RegExp(`^${prefix_}(\\s+|)${commandName_}`, "i"), "").trim();
                }
                else {
                    return body.replace(new RegExp(`^${prefix}(\\s+|)${commandName}`, "i"), "").trim();
                }
            }

            // ————————— RESTRICTION CHECK ————————— //
            if (command && isGroup && !["restrict", "unrestrict", "restricted"].includes(commandName)) {
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

            // —————  CHECK BANNED OR ONLY ADMIN BOX  ————— //
            if (isBannedOrOnlyAdmin(userData, threadData, senderID, threadID, isGroup, commandName, message, langCode))
                return;
            if (!command) {
                if (!hideNotiMessage.commandNotFound) {
                    if (!commandName) {
                        return await message.reply(
                            `That's just the bot prefix. Try typing ${prefix}help to see available commands.`
                        );
                    }

                    // Command suggestion using Levenshtein distance
                    const allCommands = Array.from(GoatBot.commands.keys());
                    const allAliases = Array.from(GoatBot.aliases.keys());
                    const allCommandNames = [...allCommands, ...allAliases];

                    let bestMatch = null;
                    let bestDistance = Infinity;

                    function levenshtein(a, b) {
                        const matrix = [];
                        for (let i = 0; i <= b.length; i++) {
                            matrix[i] = [i];
                        }
                        for (let j = 0; j <= a.length; j++) {
                            matrix[0][j] = j;
                        }
                        for (let i = 1; i <= b.length; i++) {
                            for (let j = 1; j <= a.length; j++) {
                                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                                    matrix[i][j] = matrix[i - 1][j - 1];
                                } else {
                                    matrix[i][j] = Math.min(
                                        matrix[i - 1][j - 1] + 1,
                                        matrix[i][j - 1] + 1,
                                        matrix[i - 1][j] + 1
                                    );
                                }
                            }
                        }
                        return matrix[b.length][a.length];
                    }

                    for (const cmd of allCommandNames) {
                        const distance = levenshtein(commandName.toLowerCase(), cmd.toLowerCase());
                        if (distance < bestDistance && distance <= 3) {
                            bestDistance = distance;
                            bestMatch = cmd;
                        }
                    }

                    let suggestionMsg = utils.getText({ lang: langCode, head: "handlerEvents" }, "commandNotFound", commandName, prefix);
                    if (bestMatch) {
                        suggestionMsg += `\n\nDid you mean: ${prefix}${bestMatch}?`;
                    }

                    return await message.reply(suggestionMsg);
                }
                else
                    return true;
            }
            // ————————— CHECK MONEY REQUIREMENT (FIRST) ————————— //
            const requiredMoney = command.config.requiredMoney;
            if (requiredMoney && requiredMoney > 0) {
                const hasEnoughMoney = await checkMoneyRequirement(userData, requiredMoney);
                if (!hasEnoughMoney) {
                    const userMoney = userData.money || 0;
                    return await message.reply(
                        `⚠ | You need at least $${requiredMoney} to use this command.\n` +
                        `Your balance: $${userMoney}\n` +
                        `You need $${requiredMoney - userMoney} more.`
                    );
                }
            }

            // ————————————— CHECK PERMISSION ———————————— //
            const roleConfig = getRoleConfig(utils, command, isGroup, threadData, commandName);
            const needRole = roleConfig.onStart;

            if (needRole > role) {
                if (!hideNotiMessage.needRoleToUseCmd) {
                    if (needRole == 1)
                        return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyAdmin", commandName));
                    else if (needRole == 2)
                        return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "onlyAdminBot2", commandName));
                    else if (needRole == 3)
                        return await message.reply(`⚠ | This command requires premium access (Role 3). Contact an admin to get premium status.`);
                    else if (needRole == 4)
                        return await message.reply(`⚠ | This command is for developers only (Role 4). Highest permission level required.`);
                }
                else {
                    return true;
                }
            }
            // ———————————————— countDown ———————————————— //
            if (!client.countDown[commandName])
                client.countDown[commandName] = {};
            const timestamps = client.countDown[commandName];
            let getCoolDown = command.config.countDown;
            if (!getCoolDown && getCoolDown != 0 || isNaN(getCoolDown))
                getCoolDown = 1;
            const cooldownCommand = getCoolDown * 1000;
            if (timestamps[senderID]) {
                const expirationTime = timestamps[senderID] + cooldownCommand;
                if (dateNow < expirationTime)
                    return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "waitingForCommand", ((expirationTime - dateNow) / 1000).toString().slice(0, 3)));
            }
            // ——————————————— RUN COMMAND ——————————————— //
            const time = getTime("DD/MM/YYYY HH:mm:ss");
            isUserCallCommand = true;

            // —————————— TRACK SPAM AND AUTO-BAN —————————— //
            if (isGroup) {
                const threadName = threadData?.threadName || "Unknown Group";
                const wasSpamBanned = await trackCommandSpam(threadID, threadName, globalData, message);
                if (wasSpamBanned) {
                    return;
                }
            }

            try {
                // analytics command call
                (async () => {
                    const analytics = await globalData.get("analytics", "data", {});
                    if (!analytics[commandName])
                        analytics[commandName] = 0;
                    analytics[commandName]++;
                    await globalData.set("analytics", analytics, "data");
                })();

                createMessageSyntaxError(commandName);
                const getText2 = createGetText2(langCode, `${process.cwd()}/languages/cmds/${langCode}.js`, prefix, command);
                await command.onStart({
                    ...parameters,
                    args,
                    commandName,
                    getLang: getText2,
                    removeCommandNameFromBody
                });
                timestamps[senderID] = dateNow;
                log.info("CALL COMMAND", `${commandName} | ${userData.name} | ${senderID} | ${threadID} | ${args.join(" ")}`);
            }
            catch (err) {
                log.err("CALL COMMAND", `An error occurred when calling the command ${commandName}`, err);
                return await message.reply(utils.getText({ lang: langCode, head: "handlerEvents" }, "errorOccurred", time, commandName, removeHomeDir(err.stack ? err.stack.split("\n").slice(0, 5).join("\n") : JSON.stringify(err, null, 2))));
            }
        }

        // [Rest of the functions remain the same: onChat, onAnyEvent, onFirstChat, onReply, onReaction, handlerEvent, onEvent, presence, read_receipt, typ]

        return {
            onAnyEvent,
            onFirstChat,
            onChat,
            onStart,
            onReaction,
            onReply,
            onEvent,
            handlerEvent,
            presence,
            read_receipt,
            typ
        };
    };
};
