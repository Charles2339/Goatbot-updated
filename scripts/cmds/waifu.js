const axios = require("axios");

module.exports = {
  config: {
    name: "waifu",
    aliases: ["anime", "girl"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 5,
    role: 0,
    description: {
      en: "Generate a random anime waifu image"
    },
    category: "AI",
    guide: {
      en: "{pn}\nExample: {pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      await message.reply("🎌 Fetching a waifu for you... 💖");

      const res = await axios.get(
        "https://api.waifu.im/search?included_tags=waifu&height>=512"
      );

      const imageUrl = res.data.images[0].url;

      const img = await axios.get(imageUrl, {
        responseType: "stream"
      });

      await message.reply({
        body: "💖 𝗪𝗔𝗜𝗙𝗨 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗!",
        attachment: img.data
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ Failed to fetch waifu. Try again later.");
    }
  }
};
