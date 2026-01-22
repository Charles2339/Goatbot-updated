const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

const groupCooldowns = new Map();
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
    const handlerEvents = require(process.env.NODE_ENV == 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

    return async function (event) {
        const { threadID, senderID } = event;

        // 1. SILENT BAN CHECK (MongoDB)
        const bannedUsers = await globalData.get("bannedUsers") || [];
        if (bannedUsers.includes(senderID)) {
            return; // EXIT IMMEDIATELY - No reply, no typing
        }

        // 2. RATE LIMIT & HUMAN-LIKE DELAY
        if (["message", "message_reply"].includes(event.type)) {
            const now = Date.now();
            if (!groupCooldowns.has(threadID) || now - groupCooldowns.get(threadID).lastReset > 60000) {
                groupCooldowns.set(threadID, { count: 0, lastReset: now });
            }
            const groupData = groupCooldowns.get(threadID);
            if (groupData.count >= 10) return;
            groupData.count++;

            api.sendTypingIndicator(threadID);
            await delay(Math.floor(Math.random() * 1000) + 1000); // 1-2s delay
        }

        // 3. PROCEED TO COMMANDS
        if (
            global.GoatBot.config.antiInbox == true &&
            (event.senderID == event.threadID || event.userID == event.senderID || event.isGroup == false) &&
            (event.senderID || event.userID || event.isGroup == false)
        )
            return;

        const message = createFuncMessage(api, event);
        await handlerCheckDB(usersData, threadsData, event);
        const handlerChat = await handlerEvents(event, message);
        if (!handlerChat) return;

        const {
            onAnyEvent, onFirstChat, onStart, onChat,
            onReply, onEvent, handlerEvent, onReaction,
            typ, presence, read_receipt
        } = handlerChat;

        onAnyEvent();
        switch (event.type) {
            case "message":
            case "message_reply":
            case "message_unsend":
                onFirstChat();
                onChat();
                onStart();
                onReply();
                break;
            case "event":
                handlerEvent();
                onEvent();
                break;
            case "message_reaction":
                onReaction();
                break;
            case "typ":
                typ();
                break;
            case "presence":
                presence();
                break;
            case "read_receipt":
                read_receipt();
                break;
            default:
                break;
        }
    };
};
