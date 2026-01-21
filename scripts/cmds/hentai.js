const axios = require("axios");

module.exports = {
  config: {
    name: "hentai",
    aliases: ["nsfw", "lewds", "ecchi", "porn"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 5,
    role: 2,               // ← change to 1 or 2 if you want to restrict to admins/mods only
    description: {
      en: "Generate a random hentai image (NSFW)"
    },
    category: "NSFW",
    guide: {
      en: "{pn}\nExample: {pn}"
    }
  },

  onStart: async function ({ message }) {
    try {
      await message.reply("🔞 Fetching something naughty... 🍑💦");

      const res = await axios.get(
        "https://api.waifu.im/search?included_tags=hentai&height>=512&is_nsfw=true"
      );

      if (!res.data?.images?.length) {
        return message.reply("No results right now... try again later 😏");
      }

      const imageUrl = res.data.images[0].url;

      const img = await axios.get(imageUrl, {
        responseType: "stream"
      });

      await message.reply({
        body: "🔞 𝗛𝗘𝗡𝗧𝗔𝗜 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗!\nEnjoy responsibly~ 🍆💦",
        attachment: img.data
      });

    } catch (err) {
      console.error(err?.response?.data || err);
      message.reply("❌ Failed to fetch hentai. API might be down or rate-limited.");
    }
  }
};
