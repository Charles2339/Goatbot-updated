const axios = require("axios");

module.exports = {
  config: {
    name: "hentai2",
    aliases: ["hentai2", "nhentai", "h2", "porn2"],
    version: "1.0",
    author: "CharlesMK (using NekoBot API)",
    countDown: 10,  // Slightly higher cooldown since multiple requests
    role: 2,        // Change to 1 or 2 to restrict to admins/mods only!
    description: {
      en: "Generate random hentai image(s) using NekoBot API (NSFW)"
    },
    category: "NSFW",
    guide: {
      en: "{pn} [number]\nExample: {pn}     → 1 image\n         {pn} 4   → up to 4 images (max 5)"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      let num = 1;
      if (args.length > 0) {
        const input = parseInt(args[0], 10);
        if (!isNaN(input) && input >= 1) {
          num = Math.min(input, 5); // cap at 5
        }
      }

      await message.reply(`🔞 Fetching \( {num} hentai image \){num > 1 ? 's' : ''} from NekoBot... 🍑💦`);

      const images = [];

      for (let i = 0; i < num; i++) {
        const res = await axios.get("https://nekobot.xyz/api/image?type=hentai");

        if (!res.data?.message || typeof res.data.message !== "string" || !res.data.message.startsWith("http")) {
          throw new Error("Invalid image URL from API");
        }

        const imageUrl = res.data.message;

        const imgStream = await axios.get(imageUrl, {
          responseType: "stream"
        });

        images.push(imgStream.data);
      }

      await message.reply({
        body: `🔞 **HENTAI x${num} GENERATED!**\nVia NekoBot API ~ Enjoy responsibly 🍆💦\n(NSFW - 18+)`,
        attachment: images  // array → sent as multiple photos / album if supported
      });

    } catch (err) {
      console.error("Hentai2 error:", err?.response?.data || err?.message || err);
      await message.reply("❌ Failed to fetch hentai images.\nAPI might be down, rate-limited, or network issue. Try again later.");
    }
  }
};
