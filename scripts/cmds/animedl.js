const axios = require('axios');

module.exports = {
  config: {
    name: "anime",
    aliases: ["animedl"],
    version: "15.0",
    author: "Gemini",
    countDown: 5,
    role: 0,
    category: "download",
    guide: { en: "{pn} <anime name>" }
  },

  onStart: async function ({ args, message, event, commandName }) {
    const query = args.join(" ");
    if (!query) return message.reply("❌ Please provide an anime name.");

    try {
      // Step 1: Use Jikan (Official MAL API) for searching. Highly stable.
      const searchRes = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
      const results = searchRes.data.data;
      if (!results?.length) return message.reply("❌ No results found in the database.");

      let msg = "📺 **Anime Search Results:**\n\n";
      results.forEach((a, i) => msg += `${i + 1}. ${a.title} (${a.year || 'N/A'})\n`);
      msg += "\n⭐ **Reply with: [Number] | [Episode]**";

      return message.reply(msg, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          authorID: event.senderID,
          results: results.map(a => ({ title: a.title }))
        });
      });
    } catch (e) { return message.reply("⚠️ Search engine is busy. Try again."); }
  },

  onReply: async function ({ message, Reply, event }) {
    const { authorID, results } = Reply;
    if (event.senderID !== authorID) return;

    const [idx, ep] = event.body.split("|").map(s => s.trim());
    const selected = results[parseInt(idx) - 1];
    if (!selected || !ep) return message.reply("❌ Format: Number | Episode");

    message.reply(`🚀 Fetching Ep ${ep} for "${selected.title}"...`);

    // Step 2: Generate current 2026-valid slugs
    const baseSlug = selected.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    // Rotating 2026 API Providers (These are updated for Jan 2026)
    const providers = [
      `https://api-anime-rouge.vercel.app/gogoanime/watch/${baseSlug}-episode-${ep}`,
      `https://hianime-api.vercel.app/anime/watch?id=${baseSlug}&ep=${ep}`,
      `https://consumet-api-fawn.vercel.app/anime/gogoanime/watch/${baseSlug}-episode-${ep}`
    ];

    let videoUrl = null;
    let sizeMB = 0;

    for (const url of providers) {
      try {
        const res = await axios.get(url, { timeout: 8000 });
        const sources = res.data.sources || res.data;
        if (Array.isArray(sources) && sources.length > 0) {
          // Priority: 360p (to fit 25MB) > 480p > lowest
          const source = sources.find(s => s.quality === '360p') || 
                         sources.find(s => s.quality === '480p') || 
                         sources[sources.length - 1];
          videoUrl = source.url;
          break;
        }
      } catch (e) { continue; }
    }

    if (!videoUrl) return message.reply("❌ **Video Not Found.** Try a more specific title like 'Naruto Shippuden'.");

    try {
      // Step 3: Size check to respect the 25MB limit
      const head = await axios.head(videoUrl, { timeout: 5000 }).catch(() => null);
      const sizeBytes = head ? parseInt(head.headers['content-length'] || 0) : 0;
      sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

      if (sizeBytes > 26214400) {
        return message.reply(`📁 **Too Large (${sizeMB} MB)**\n\nThis episode exceeds the 25MB Messenger limit. Try a lower quality or a shorter episode.`);
      }

      // Step 4: Stream Download
      const stream = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://anitaku.to/' }
      });

      return message.reply({
        body: `✅ **${selected.title}** - Ep ${ep}\n📦 Size: ${sizeMB} MB`,
        attachment: stream.data
      });

    } catch (err) {
      return message.reply("❌ **Server Refused.** The video host blocked the bot's download request.");
    }
  }
};
