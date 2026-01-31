const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pair",
    author: "Ew'r Saim X Ariyan",
    category: "love",
    version: "2.8"
  },

  onStart: async function ({ api, event, usersData }) {
    const { threadID, messageID, senderID } = event;
    const cachePath = path.join(__dirname, "cache", `pair_${senderID}.png`);

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs.filter(id => id !== senderID && id !== api.getCurrentUserID());
      
      if (participantIDs.length === 0) return api.sendMessage("❌ Need more members!", threadID, messageID);

      const allUsers = await api.getUserInfo([...participantIDs, senderID]);
      const myGender = allUsers[senderID].gender;

      const opposites = participantIDs.filter(id => (myGender === 2 && allUsers[id].gender === 1) || (myGender === 1 && allUsers[id].gender === 2));
      const matchID = opposites.length > 0 ? opposites[Math.floor(Math.random() * opposites.length)] : participantIDs[Math.floor(Math.random() * participantIDs.length)];

      const canvas = createCanvas(800, 400);
      const ctx = canvas.getContext("2d");

      // 1. Draw Background
      const background = await loadImage("https://i.postimg.cc/pdv5dFVX/611905695-855684437229208-8377464727643815456-n.png");
      ctx.drawImage(background, 0, 0, 800, 400);

      // 2. Load PFPs
      const avt1 = await loadImage(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
      const avt2 = await loadImage(`https://graph.facebook.com/${matchID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);

      // 3. Draw PFPs in the Floral Frame positions
      // Position for Frame 1 (Top Circle)
      const x1 = 575, y1 = 65, size1 = 155;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x1 + size1/2, y1 + size1/2, size1/2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avt1, x1, y1, size1, size1);
      ctx.restore();

      // Position for Frame 2 (Bottom Circle)
      const x2 = 825, y2 = 535, size2 = 155; 
      // Note: If the image is 800px wide, the second frame is actually partially cut off or small.
      // Based on your image, let's use these relative coordinates:
      const frameTopX = 578, frameTopY = 68;      // Center of top flower
      const frameBottomX = 840, frameBottomY = 540; // Center of bottom flower (approx)

      // Let's adjust to fit standard 800x400 canvas scale:
      // Avatar 1 (Top Flower)
      drawCirclePfp(ctx, avt1, 578, 68, 75); 
      // Avatar 2 (Bottom Flower)
      drawCirclePfp(ctx, avt2, 840, 545, 75); 

      function drawCirclePfp(context, img, x, y, radius) {
        context.save();
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.clip();
        context.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
        context.restore();
      }

      // 4. Name Labels
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "center";
      ctx.fillText(allUsers[senderID].name, 578, 165);
      ctx.fillText(allUsers[matchID].name, 840, 640);

      if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"));
      fs.writeFileSync(cachePath, canvas.toBuffer());

      return api.sendMessage({
        body: `💓 𝐌𝐚𝐭𝐜𝐡 𝐅𝐨𝐮𝐧𝐝!\n${allUsers[senderID].name} x ${allUsers[matchID].name}`,
        attachment: fs.createReadStream(cachePath)
      }, threadID, () => fs.unlinkSync(cachePath), messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Error placing avatars. Check console.", threadID, messageID);
    }
  }
};
