const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair",
    aliases: ["pairr", "ship"],
    version: "1.1",
    author: "Ncs Pro (updated for GoatBot)",
    role: 0,
    countDown: 10,
    shortDescription: {
      en: "Pair two people randomly"
    },
    longDescription: {
      en: "Randomly pairs you with someone in the group and shows a fun compatibility percentage"
    },
    category: "love",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const pathImg = __dirname + "/cache/background.png";
    const pathAvt1 = __dirname + "/cache/Avtmot.png";
    const pathAvt2 = __dirname + "/cache/Avthai.png";

    const id1 = event.senderID;

    // Get thread info
    const threadInfo = await api.getThreadInfo(event.threadID);
    const allUsers = threadInfo.userInfo;

    // Get sender gender
    let gender1 = "UNKNOWN";
    for (const user of allUsers) {
      if (user.id === id1) {
        gender1 = user.gender || "UNKNOWN";
        break;
      }
    }

    const botID = api.getCurrentUserID();
    let candidates = [];

    if (gender1 === "FEMALE") {
      for (const u of allUsers) {
        if (u.gender === "MALE" && u.id !== id1 && u.id !== botID) {
          candidates.push(u.id);
        }
      }
    } else if (gender1 === "MALE") {
      for (const u of allUsers) {
        if (u.gender === "FEMALE" && u.id !== id1 && u.id !== botID) {
          candidates.push(u.id);
        }
      }
    } else {
      for (const u of allUsers) {
        if (u.id !== id1 && u.id !== botID) {
          candidates.push(u.id);
        }
      }
    }

    if (candidates.length === 0) {
      return api.sendMessage("No suitable partner found in this group 😔", event.threadID, event.messageID);
    }

    const id2 = candidates[Math.floor(Math.random() * candidates.length)];

    // Get real user info (this is the fix!)
    let info1, info2;
    try {
      info1 = await api.getUserInfo(id1);
      info2 = await api.getUserInfo(id2);
    } catch (err) {
      console.error("getUserInfo error:", err);
      return api.sendMessage("Failed to get user information 😢", event.threadID, event.messageID);
    }

    const name1 = info1?.name || "You";
    const name2 = info2?.name || "Partner";

    // Download avatars
    async function downloadAvatar(userId, savePath, fallbackUrl) {
      try {
        let url = info1?.profilePicture || info2?.profilePicture || fallbackUrl;
        if (!url) url = fallbackUrl;
        const response = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(savePath, Buffer.from(response.data));
      } catch (err) {
        console.error(`Avatar download failed for ${userId}:`, err.message);
        // Ultimate fallback: copy a default image if you have one
        // fs.copyFileSync(__dirname + "/cache/default.png", savePath);
      }
    }

    await downloadAvatar(id1, pathAvt1, `https://graph.facebook.com/${id1}/picture?type=large`);
    await downloadAvatar(id2, pathAvt2, `https://graph.facebook.com/${id2}/picture?type=large`);

    // Random background
    const backgrounds = [
      "https://i.postimg.cc/wjJ29HRB/background1.png",
      "https://i.postimg.cc/zf4Pnshv/background2.png",
      "https://i.postimg.cc/5tXRQ46D/background3.png",
    ];
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];

    let bgData;
    try {
      bgData = (await axios.get(randomBg, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(pathImg, Buffer.from(bgData));
    } catch (err) {
      console.error("Background download failed:", err);
      return api.sendMessage("Failed to load background image", event.threadID, event.messageID);
    }

    // Canvas magic
    try {
      const baseImage = await loadImage(pathImg);
      const avt1 = await loadImage(pathAvt1);
      const avt2 = await loadImage(pathAvt2);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(avt1, 100, 150, 300, 300);
      ctx.drawImage(avt2, 900, 150, 300, 300);

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);

      // Random percentage
      const percentages = [Math.floor(Math.random() * 100) + 1, "99.99", "101", "0.01", "-100", "0"];
      const tile = percentages[Math.floor(Math.random() * percentages.length)];

      // Send result
      await api.sendMessage({
        body: `💞 Congratulations ${name1} successfully paired with ${name2}!\nCompatibility: ${tile}% 💕`,
        mentions: [{ tag: name2, id: id2 }],
        attachment: fs.createReadStream(pathImg)
      }, event.threadID, () => {
        fs.unlinkSync(pathImg);
        fs.unlinkSync(pathAvt1);
        fs.unlinkSync(pathAvt2);
      }, event.messageID);

    } catch (err) {
      console.error("Canvas error:", err);
      api.sendMessage("Something went wrong while creating the image 😭", event.threadID, event.messageID);
    }
  }
};
