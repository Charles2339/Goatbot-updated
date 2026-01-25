const axios = require("axios");
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "hug",
    aliases: ["us", "抱"],
    version: "1.1",
    author: "AceGun (updated)",
    countDown: 5,
    role: 0,
    shortDescription: "Send a hug",
    longDescription: "Hug someone with a cute image",
    category: "love",
    guide: {
      en: "{pn} [@tag]"
    }
  },

  onStart: async function ({ api, message, event, args }) {
    const mentions = Object.keys(event.mentions);

    if (mentions.length === 0) {
      return message.reply("Please mention someone to hug! 🫂");
    }

    let senderId, targetId;

    if (mentions.length === 1) {
      senderId = event.senderID;
      targetId = mentions[0];
    } else {
      senderId = mentions[1] || event.senderID;
      targetId = mentions[0];
    }

    try {
      const path = await createHugImage(senderId, targetId, api);
      await message.reply({
        body: "Come here~ 🫂💕",
        attachment: fs.createReadStream(path)
      });

      // Clean up
      setTimeout(() => fs.unlinkSync(path), 5000);

    } catch (err) {
      console.error("Hug error:", err);
      message.reply("Couldn't create the hug image... sorry 😔");
    }
  }
};

async function createHugImage(one, two, api) {
  let info1, info2;
  try {
    info1 = await api.getUserInfo(one);
    info2 = await api.getUserInfo(two);
  } catch (err) {
    console.error("getUserInfo failed:", err);
  }

  const url1 = info1?.profilePicture || `https://graph.facebook.com/${one}/picture?type=large`;
  const url2 = info2?.profilePicture || `https://graph.facebook.com/${two}/picture?type=large`;

  const avone = await jimp.read(url1);
  avone.circle();

  const avtwo = await jimp.read(url2);
  avtwo.circle();

  const template = await jimp.read("https://i.imgur.com/ReWuiwU.jpg");
  template.resize(466, 659);

  template.composite(avone.resize(110, 110), 150, 76);
  template.composite(avtwo.resize(100, 100), 245, 305);

  const outputPath = `\( {__dirname}/cache/hug_ \){Date.now()}.png`;
  await template.writeAsync(outputPath);

  return outputPath;
}
