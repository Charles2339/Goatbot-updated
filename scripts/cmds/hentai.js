const axios = require("axios");

module.exports = {
  config: {
    name: "hentai",
    aliases: ["nsfw", "lewds", "ecchi", "porn"],
    version: "1.1",
    author: "CharlesMK (enhanced)",
    countDown: 8,
    role: 2,  // ← set to 1 or 2 if you want to restrict it
    description: {
      en: "Generate random hentai image(s) (NSFW) - +hentai [1-5]"
    },
    category: "NSFW",
    guide: {
      en: "{pn} [number]\nExample: {pn} → 1 image\n         {pn} 3 → 3 images (max 5)"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      let num = 1;
      if (args.length > 0) {
        num = parseInt(args[0], 10);
        if (isNaN(num) || num < 1) num = 1;
        if (num > 5) num = 5;
      }

      await message.reply(`🔞 Fetching \( {num} naughty image \){num > 1 ? 's' : ''}... 🍑💦`);

      const images = [];
      // waifu.im supports multiple via many=true + limit, but let's do safe loop
      for (let i = 0; i < num; i++) {
        const res = await axios.get(
          "https://api.waifu.im/search?included_tags=hentai&height>=512&is_nsfw=true&many=false"
        );

        if (!res.data?.images?.[0]?.url) {
          throw new Error("No image returned");
        }

        const imageUrl = res.data.images[0].url;
        const imgStream = await axios.get(imageUrl, { responseType: "stream" });
        images.push(imgStream.data);
      }

      // Try to send all in one message (most frameworks support array of streams)
      await message.reply({
        body: `🔞 𝗛𝗘𝗡𝗧𝗔𝗜 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗! (\( {num} image \){num > 1 ? 's' : ''})\nEnjoy~ 🍆💦 (NSFW)`,
        attachment: images  // array of streams → many bots send as album/carousel
      });

    } catch (err) {
      console.error(err?.response?.data || err);
      await message.reply("❌ Failed to fetch hentai. API issue or rate limit – try again soon.");
    }
  }
};
