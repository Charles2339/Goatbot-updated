const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair",
    aliases: ["pairr", "ship"],
    version: "1.2",
    author: "Ncs Pro (updated for GoatBot - local bg)",
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
    const pathImg = __dirname + "/cache/pair_result.png";
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

    // Get real user info
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

    // Download avatars (still from FB)
    async function downloadAvatar(userId, savePath) {
      const fallbackUrl = `https://graph.facebook.com/${userId}/picture?type=large`;
      let url = fallbackUrl;

      try {
        // Prefer profilePicture from getUserInfo if available
        if (info1 && userId === id1 && info1.profilePicture) url = info1.profilePicture;
        if (info2 && userId === id2 && info2.profilePicture) url = info2.profilePicture;

        const response = await axios.get(url, { responseType: "arraybuffer", timeout: 8000 });
        fs.writeFileSync(savePath, Buffer.from(response.data));
      } catch (err) {
        console.error(`Avatar download failed for ${userId}:`, err.message);
        // You can add a default avatar fallback here later if wanted
      }
    }

    await downloadAvatar(id1, pathAvt1);
    await downloadAvatar(id2, pathAvt2);

    // ────────────────────────────────────────────────
    // LOCAL BACKGROUND - only one file
    // ────────────────────────────────────────────────
    const localBgPath = __dirname + "/cache/love_background.jpg";  // ← change to .png if you saved PNG

    let bgData;
    try {
      if (!fs.existsSync(localBgPath)) {
        throw new Error("Background file not found: " + localBgPath);
      }
      bgData = fs.readFileSync(localBgPath);
      fs.writeFileSync(pathImg, bgData);
    } catch (err) {
      console.error("Local background load failed:", err.message);

      // Ultimate fallback: generate simple pink background
      const canvasFallback = createCanvas(1280, 720);
      const ctx = canvasFallback.getContext("2d");
      ctx.fillStyle = "#ffb6c1"; // light pink
      ctx.fillRect(0, 0, 1280, 720);
      ctx.font = "bold 80px Arial";
      ctx.fillStyle = "#ff69b4";
      ctx.textAlign = "center";
      ctx.fillText("Love 💕", 640, 360);
      fs.writeFileSync(pathImg, canvasFallback.toBuffer());
    }

    // Canvas compositing
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
      const percentages = [
        Math.floor(Math.random() * 100) + 1,
        "99.99", "101", "0.01", "-100", "0"
      ];
      const tile = percentages[Math.floor(Math.random() * percentages.length)];

      // Send
      await api.sendMessage({
        body: `💞 ${name1} paired with ${name2}!\nCompatibility: ${tile}% 💕`,
        mentions: [{ tag: name2, id: id2 }],
        attachment: fs.createReadStream(pathImg)
      }, event.threadID, () => {
        fs.unlinkSync(pathImg);
        if (fs.existsSync(pathAvt1)) fs.unlinkSync(pathAvt1);
        if (fs.existsSync(pathAvt2)) fs.unlinkSync(pathAvt2);
      }, event.messageID);

    } catch (err) {
      console.error("Canvas / send error:", err);
      api.sendMessage("Failed to create the pair image 😭", event.threadID, event.messageID);
    }
  }
};
