const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

// --- RATE LIMITER CONFIG ---
const groupCooldowns = new Map();
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {
    const handlerEvents = require(process.env.NODE_ENV == 'development' ? "./handlerEvents.dev.js" : "./handlerEvents.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

    return async function (event) {
        const threadID = event.threadID;

        // 1. RATE LIMIT & HUMAN-LIKE DELAY
        if (["message", "message_reply"].includes(event.type)) {
            const now = Date.now();

            // Reset counter every 60 seconds
            if (!groupCooldowns.has(threadID) || now - groupCooldowns.get(threadID).lastReset > 60000) {
                groupCooldowns.set(threadID, { count: 0, lastReset: now });
            }

            const groupData = groupCooldowns.get(threadID);

            // Block if more than 10 messages per minute
            if (groupData.count >= 10) return;

            groupData.count++;

            // Send "Typing..." indicator to look human
            api.sendTypingIndicator(threadID);
            
            // Wait 1.5 to 3 seconds before processing (Simulation of reading/typing)
            await delay(Math.floor(Math.random() * 1500) + 1500);
        }

        // 2. EXISTING ANTI-INBOX
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
