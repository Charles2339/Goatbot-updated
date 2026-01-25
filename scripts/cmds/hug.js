const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "hug",
        version: "2.0",
        author: "Charles MK",
        countDown: 5,
        role: 0,
        category: "love",
        guide: { en: "{pn} @tag" }
    },

    onStart: async function ({ api, event, message }) {
        const mention = Object.keys(event.mentions);
        if (mention.length == 0) return message.reply("Please mention someone to hug!");

        const one = event.senderID;
        const two = mention[0];
        const cachePath = path.join(__dirname, `cache`, `hug_${one}.png`);

        try {
            const baseImg = await loadImage("https://i.imgur.com/ReWuiwU.jpg");
            const avt1 = await loadImage(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
            const avt2 = await loadImage(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

            const canvas = createCanvas(466, 659);
            const ctx = canvas.getContext("2d");

            ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

            // User 1 face (position adjusted for the meme)
            drawCircleImage(ctx, avt1, 150, 76, 110, 110);
            // User 2 face
            drawCircleImage(ctx, avt2, 245, 305, 100, 100);

            fs.writeFileSync(cachePath, canvas.toBuffer());
            return message.reply({
                body: "Just you and me <3",
                attachment: fs.createReadStream(cachePath)
            }, () => fs.unlinkSync(cachePath));

        } catch (e) {
            return message.reply("❌ Error loading images. The link might be dead.");
        }
    }
};

// Re-using the helper function from above
function drawCircleImage(ctx, img, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
}
