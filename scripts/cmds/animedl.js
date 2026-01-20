const axios = require('axios');

module.exports = {
  config: {
    name: "anime",
    aliases: ["animedl"],
    version: "8.0",
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
      // Search via Jikan (Stable)
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
      const results = res.data.data;
      if (!results?.length) return message.reply("❌ No results found.");

      let msg = "📺 **Anime Results:**\n\n";
      results.forEach((a, i) => msg += `${i + 1}. ${a.title}\n`);
      msg += "\n⭐ **Reply with: [Number] | [Episode]**";

      return message.reply(msg, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          authorID: event.senderID,
          results: results.map(a => ({ title: a.title }))
        });
      });
    } catch (e) { return message.reply("⚠️ Search error. Try again."); }
  },

  onReply: async function ({ message, Reply, event }) {
    const { authorID, results } = Reply;
    if (event.senderID !== authorID) return;

    const [idx, ep] = event.body.split("|").map(s => s.trim());
    const selected = results[parseInt(idx) - 1];
    if (!selected || !ep) return message.reply("❌ Use: Number | Episode");

    message.reply(`🔍 Fetching Ep ${ep} for "${selected.title}"...`);

    // We generate multiple slug variations to increase success rate
    const baseSlug = selected.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const slugs = [
      baseSlug,
      `${baseSlug}-dub`,
      baseSlug.replace(/-tv$|-2002$|-2007$/g, '')
    ];

    let foundSource = null;

    // Try multiple API mirrors
    for (const s of slugs) {
      if (foundSource) break;
      const apiList = [
        `https://anime-api.xyz/api/gogoanime/watch/${s}-episode-${ep}`,
        `https://consumet-api-fawn.vercel.app/anime/gogoanime/watch/${s}-episode-${ep}`
      ];

      for (const url of apiList) {
        try {
          const check = await axios.get(url, { timeout: 5000 });
          if (check.data?.sources?.[0]?.url) {
            foundSource = check.data.sources;
            break;
          }
        } catch (e) { continue; }
      }
    }

    if (!foundSource) {
      return message.reply(`❌ **Link Not Found**\n\nThe provider couldn't find a direct file for Ep ${ep}. This happens if the anime is licensed or the slug doesn't match.\n\nTry searching for: **"${selected.title} Dub"** or check if the episode exists.`);
    }

    try {
      const videoUrl = foundSource.find(s => s.quality === '360p')?.url || foundSource[0].url;
      
      // Attempt to check size
      const head = await axios.head(videoUrl).catch(() => ({ headers: {} }));
      const sizeBytes = parseInt(head.headers['content-length'] || 0);

      if (sizeBytes > 26214400) {
        return message.reply(`⚠️ **File is > 25MB**\n\nI can't upload this directly to Messenger, but you can watch it here:\n🔗 ${videoUrl}`);
      }

      const stream = await axios.get(videoUrl, { 
        responseType: 'stream', 
        headers: { 'Referer': 'https://gogoanime.hu/' } 
      });

      return message.reply({
        body: `✅ **${selected.title}** - Ep ${ep}`,
        attachment: stream.data
      });

    } catch (err) {
      return message.reply(`❌ **Streaming Error**\n\nFound the link, but the video server blocked the download. You can still watch it here:\n🔗 ${foundSource[0].url}`);
    }
  }
};
