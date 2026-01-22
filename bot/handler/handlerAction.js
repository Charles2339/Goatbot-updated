const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

// --- GLOBAL TRACKING ---
const groupCooldowns = new Map();

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
    const handlerEvents = require(process.env.NODE_ENV == 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

    return async function (event) {
        const { threadID, senderID, type } = event;

        // 1. SILENT BAN CHECK (MongoDB)
        try {
            const bannedUsers = await globalData.get("bannedUsers") || [];
            if (bannedUsers.includes(senderID)) return; 
        } catch (e) {
            // If DB fails, we log it but let the bot continue to avoid a crash
            console.error("Ban check error:", e);
        }

        // 2. RATE LIMITER (10 messages per minute per group)
        if (["message", "message_reply"].includes(type)) {
            const now = Date.now();
            if (!groupCooldowns.has(threadID) || now - groupCooldowns.get(threadID).lastReset > 60000) {
                groupCooldowns.set(threadID, { count: 0, lastReset: now });
            }

            const groupData = groupCooldowns.get(threadID);
            if (groupData.count >= 10) return; // Ignore if over limit
            
            groupData.count++;
            
            // Turn on typing indicator to look human
            api.sendTypingIndicator(threadID);
        }

        // 3. EXISTING CORE LOGIC
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
        switch (type) {
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
