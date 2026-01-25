const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "pair",
        aliases: ["ship"],
        version: "2.0",
        author: "Charles MK",
        role: 0,
        countDown: 5,
        category: "love",
        guide: { en: "{pn}" }
    },

    onStart: async function ({ api, event, usersData }) {
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

        const pathImg = path.join(cacheDir, `pair_${event.senderID}.png`);
        
        // 1. Get User Data
        const threadInfo = await api.getThreadInfo(event.threadID);
        const allUsers = threadInfo.userInfo;
        const sender = allUsers.find(u => u.id == event.senderID);
        const gender1 = sender ? sender.gender : "UNKNOWN";

        // 2. Filter for a partner
        let candidates = allUsers.filter(u => u.id != event.senderID && u.id != api.getCurrentUserID());
        let partner = candidates.filter(u => (gender1 === "MALE" ? u.gender === "FEMALE" : u.gender === "MALE"));
        
        // If no opposite gender found, just pick anyone
        const finalPartnerID = partner.length > 0 
            ? partner[Math.floor(Math.random() * partner.length)].id 
            : candidates[Math.floor(Math.random() * candidates.length)].id;

        const name1 = (await usersData.get(event.senderID)).name;
        const name2 = (await usersData.get(finalPartnerID)).name;

        // 3. Image Processing
        const backgroundURL = "https://i.postimg.cc/wjJ29HRB/background1.png";
        const avatarURL = (id) => `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`; 
        // Note: If the above token fails, your bot's app state usually provides a way to get URLs.

        try {
            const [bg, avt1, avt2] = await Promise.all([
                loadImage(backgroundURL),
                loadImage(avatarURL(event.senderID)),
                loadImage(avatarURL(finalPartnerID))
            ]);

            const canvas = createCanvas(bg.width, bg.height);
            const ctx = canvas.getContext("2d");

            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
            
            // Draw Circular Avatars
            drawCircleImage(ctx, avt1, 100, 150, 300, 300);
            drawCircleImage(ctx, avt2, 900, 150, 300, 300);

            fs.writeFileSync(pathImg, canvas.toBuffer());

            return api.sendMessage({
                body: `✅ Congratulations ${name1} and ${name2}!\nMatch: ${Math.floor(Math.random() * 101)}%`,
                attachment: fs.createReadStream(pathImg)
            }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);

        } catch (err) {
            console.error(err);
            return api.sendMessage("❌ Failed to generate image. The avatar API might be down.", event.threadID);
        }
    }
};

function drawCircleImage(ctx, img, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
}
