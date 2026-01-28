const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "pair",
        version: "2.5",
        author: "Charles MK",
        countDown: 10,
        role: 0,
        description: { en: "Pair with a random member using your custom wedding background." },
        category: "love",
        guide: { en: "{pn}" }
    },

    onStart: async function ({ api, event, usersData }) {
        const { threadID, messageID, senderID } = event;
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        const pathImg = path.join(cacheDir, `pair_${senderID}.png`);
        
        // This points to the image you uploaded
        const localBgPath = path.join(__dirname, "love_background.jpg");

        try {
            const threadInfo = await api.getThreadInfo(threadID);
            const participantIDs = threadInfo.participantIDs;
            const botID = api.getCurrentUserID();

            let listIDs = participantIDs.filter(id => id != senderID && id != botID);
            if (listIDs.length === 0) return api.sendMessage("💔 Not enough members to pair!", threadID, messageID);

            const id2 = listIDs[Math.floor(Math.random() * listIDs.length)];
            const name1 = await usersData.getName(senderID);
            const name2 = await usersData.getName(id2);

            const avt1Url = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            const avt2Url = `https://graph.facebook.com/${id2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

            const lovePercent = Math.floor(Math.random() * 51) + 50; 

            // Load assets (Background from local path)
            const [bgImg, avt1, avt2] = await Promise.all([
                loadImage(localBgPath),
                loadImage(avt1Url).catch(() => loadImage("https://i.imgur.com/6ve9Yas.png")),
                loadImage(avt2Url).catch(() => loadImage("https://i.imgur.com/6ve9Yas.png"))
            ]);

            const canvas = createCanvas(bgImg.width, bgImg.height);
            const ctx = canvas.getContext("2d");

            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            // Added a slight dark overlay so white text is readable over the sun flare
            ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const drawUser = (img, name, x, y) => {
                ctx.save();
                // Outer Glow
                ctx.shadowColor = "#ffffff";
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(x + 150, y + 150, 150, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(img, x, y, 300, 300);
                ctx.restore();

                // Text styling
                ctx.font = "bold 45px Arial";
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = "black";
                ctx.shadowBlur = 10;
                ctx.textAlign = "center";
                ctx.fillText(name, x + 150, y + 380);
            };

            // Adjusted positions to fit the couple in the background better
            drawUser(avt1, name1, 100, 50);
            drawUser(avt2, name2, canvas.width - 400, 50);

            // Center UI
            ctx.font = "bold 120px Arial";
            ctx.shadowBlur = 15;
            ctx.fillText("❤️", canvas.width / 2, canvas.height / 2);
            ctx.font = "bold 70px Arial";
            ctx.fillText(`${lovePercent}%`, canvas.width / 2, (canvas.height / 2) + 100);

            const buffer = canvas.toBuffer();
            fs.writeFileSync(pathImg, buffer);

            return api.sendMessage({
                body: `🌹 **A MATCH MADE IN HEAVEN** 🌹\n\n` +
                      `👤 **${name1}**\n` +
                      `👤 **${name2}**\n\n` +
                      `Love Level: **${lovePercent}%**\n` +
                      `*Wishing you a lifetime of happiness!*`,
                mentions: [{ tag: name2, id: id2 }],
                attachment: fs.createReadStream(pathImg)
            }, threadID, () => fs.unlinkSync(pathImg), messageID);

        } catch (e) {
            console.error(e);
            return api.sendMessage("❌ Error: Make sure 'love_background.jpg' is in the same folder as this script.", threadID, messageID);
        }
    }
};
