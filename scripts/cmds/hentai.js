const axios = require("axios");

module.exports = {
  config: {
    name: "hentai",
    aliases: ["nsfw", "lewds", "ecchi", "porn", "hent"],
    version: "1.3",
    author: "Charles MK",
    countDown: 12,
    role: 2,                // keep as-is or change to 0/1 if desired
    description: {
      en: "Generate random hentai image(s) with optional tag/genre (NSFW)"
    },
    category: "NSFW",
    guide: {
      en: "{pn} [number] [tag/genre]\n" +
          "Examples:\n" +
          "  {pn} 8                  → 8 random hentai\n" +
          "  {pn} 5 milf            → 5 milf-themed\n" +
          "  {pn} 10 big_breasts anal → 10 images with both tags\n" +
          "Max images: 15 (Messenger limit)\n" +
          "Common tags: maid,waifu,marin-kitagawa,mori-calliope,raiden-shogun,oppai,selfies,uniform,kamisato-ayaka,ass,hentai,milf,oral,paizuri,ecchi,ero"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      let num = 1;
      let tags = ["hentai"]; // default

      // Parse arguments
      if (args.length > 0) {
        // First arg → number if it's numeric
        const first = parseInt(args[0], 10);
        if (!isNaN(first) && first >= 1) {
          num = first;
          args.shift(); // remove the number from args
        }

        // Cap number
        if (num > 15) {
          num = 15;
          await message.reply("⚠️ Max 15 images due to Messenger limits. Using 15.");
        }

        // Remaining args → tags (space-separated)
        if (args.length > 0) {
          tags = args.map(t => t.trim().toLowerCase());
        }
      }

      const tagString = tags.join(", ");
      await message.reply(`🔞 Fetching \( {num} image \){num > 1 ? 's' : ''} (${tagString})... 🍑💦`);

      const images = [];

      // Try bulk request with tags
      let remaining = num;
      try {
        const bulkUrl = `https://api.waifu.im/search?` +
                        `included_tags=${encodeURIComponent(tags.join(','))}` +
                        `&height>=512&is_nsfw=true&many=true&limit=${num}`;

        const bulkRes = await axios.get(bulkUrl);

        if (bulkRes.data?.images?.length > 0) {
          for (const img of bulkRes.data.images) {
            if (images.length >= num) break;
            const imgStream = await axios.get(img.url, { responseType: "stream" });
            images.push(imgStream.data);
            remaining--;
          }
        }
      } catch (bulkErr) {
        console.log("Bulk fetch failed:", bulkErr.message);
        // fallback to single fetches
      }

      // Fallback: single fetches with the same tags
      while (images.length < num) {
        const singleUrl = `https://api.waifu.im/search?` +
                          `included_tags=${encodeURIComponent(tags.join(','))}` +
                          `&height>=512&is_nsfw=true&many=false`;

        const res = await axios.get(singleUrl);

        if (!res.data?.images?.[0]?.url) {
          throw new Error("No image returned from API");
        }

        const imageUrl = res.data.images[0].url;
        const imgStream = await axios.get(imageUrl, { responseType: "stream" });
        images.push(imgStream.data);
      }

      // Send result
      await message.reply({
        body: `🔞 **HENTAI GENERATED!** (\( {images.length} image \){images.length !== 1 ? 's' : ''})` +
              `\nTags: ${tagString}\nEnjoy~ 🍆💦 (NSFW 18+)`,
        attachment: images
      });

    } catch (err) {
      console.error("Hentai fetch error:", err?.response?.data || err?.message || err);

      let errorMsg = "❌ Failed to fetch images.";
      if (err?.response?.status === 404 || err?.response?.status === 400) {
        errorMsg += "\nInvalid tag(s) or no results for that combination.";
      } else if (err?.response?.status === 429) {
        errorMsg += "\nRate limited – wait a minute and try again.";
      } else {
        errorMsg += "\nAPI might be down or too many requested.";
      }

      await message.reply(errorMsg + "\nTry fewer images or different tags.");
    }
  }
};
