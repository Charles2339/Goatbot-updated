const axios = require('axios');

module.exports = {
  config: {
    name: "anime",
    aliases: ["animedl", "animedownload"],
    version: "2.1",
    author: "CharlesMK",
    countDown: 10,
    role: 0,
    description: {
      en: "Search and download anime episodes"
    },
    category: "download",
    guide: {
      en: "{pn} <anime name> <episode number>\nExample: {pn} one-piece 1\n{pn} naruto 5"
    }
  },

  onStart: async function ({ args, message, event }) {
    if (args.length < 2) {
      return message.reply(
        "❌ Please provide anime name and episode number!\n\n" +
        "Usage: +anime <name> <episode>\n" +
        "Examples:\n" +
        "+anime one-piece 1\n" +
        "+anime naruto 5\n" +
        "+anime bleach 2\n\n" +
        "💡 Tip: Use hyphens (-) instead of spaces"
      );
    }

    const episodeNum = args[args.length - 1];
    
    if (isNaN(episodeNum)) {
      return message.reply("❌ Please provide a valid episode number!");
    }

    const animeName = args.slice(0, -1).join('-').toLowerCase();

    try {
      await message.reply(`🔍 Searching for ${animeName.replace(/-/g, ' ')} Episode ${episodeNum}... ⏳`);

      let videoUrl = null;

      // Try Consumet API (usually most reliable)
      try {
        const episodeId = `${animeName}-episode-${episodeNum}`;
        
        const response = await axios.get(
          `https://api.consumet.org/anime/gogoanime/watch/${episodeId}`,
          { 
            timeout: 20000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          }
        );

        if (response.data?.sources) {
          // Prefer lower quality for faster downloads
          const source = response.data.sources.find(s => s.quality === '360p') || 
                        response.data.sources.find(s => s.quality === '480p') ||
                        response.data.sources.find(s => s.quality === '720p') ||
                        response.data.sources[0];
          
          videoUrl = source.url;
          console.log("Found video URL:", videoUrl, "Quality:", source.quality);
        }
      } catch (e) {
        console.log("Consumet failed:", e.message);
      }

      // Backup API
      if (!videoUrl) {
        try {
          const response = await axios.get(
            `https://gogoanime.consumet.stream/vidcdn/watch/${animeName}-episode-${episodeNum}`,
            { 
              timeout: 20000,
              headers: { 'User-Agent': 'Mozilla/5.0' }
            }
          );

          if (response.data?.sources) {
            const source = response.data.sources.find(s => s.quality === '360p') || 
                          response.data.sources[0];
            videoUrl = source.url;
          }
        } catch (e) {
          console.log("Backup API failed:", e.message);
        }
      }

      if (!videoUrl) {
        return message.reply(
          `❌ Could not find "${animeName.replace(/-/g, ' ')}" Episode ${episodeNum}\n\n` +
          `Try:\n` +
          `• Check spelling: "bleach" not "Bleach"\n` +
          `• Use hyphens: "one-piece" not "one piece"\n` +
          `• Verify episode exists\n\n` +
          `Examples:\n` +
          `+anime bleach 1\n` +
          `+anime naruto 1\n` +
          `+anime one-piece 1`
        );
      }

      await message.reply(`⏬ Downloading... This may take 1-2 minutes ⏳`);

      // Check file size first
      let fileSize = 0;
      try {
        const headResponse = await axios.head(videoUrl, {
          timeout: 10000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        fileSize = parseInt(headResponse.headers['content-length'] || 0);
        
        if (fileSize > 50 * 1024 * 1024) { // 50MB
          return message.reply(
            `❌ Episode file is too large (${Math.round(fileSize / 1024 / 1024)}MB)\n\n` +
            `Messenger has a 25-50MB limit for video uploads.\n\n` +
            `You can watch it here instead:\n` +
            `https://gogoanime.pe/${animeName}-episode-${episodeNum}\n\n` +
            `💡 Try a different episode or anime with smaller file sizes.`
          );
        }
      } catch (e) {
        console.log("Could not check file size");
      }

      // Download with strict timeout
      const videoResponse = await axios.get(videoUrl, {
        responseType: 'stream',
        timeout: 60000, // 1 minute max
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://gogoanime.pe/'
        },
        maxContentLength: 50 * 1024 * 1024, // 50MB max
        maxBodyLength: 50 * 1024 * 1024,
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (percentCompleted % 25 === 0) {
            console.log(`Download progress: ${percentCompleted}%`);
          }
        }
      });

      // Send video
      await message.reply({
        body: `✅ ${animeName.replace(/-/g, ' ').toUpperCase()} - Episode ${episodeNum}\n\n📺 Enjoy! 🍿`,
        attachment: videoResponse.data
      });

    } catch (error) {
      console.error("Anime download error:", error.message);

      let errorMsg = "Failed to download anime episode.";

      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        errorMsg = "⏱️ Download timed out (took too long)\n\nThe episode file is likely too large for Messenger.";
      } else if (error.message?.includes('maxContentLength') || error.message?.includes('maxBodyLength')) {
        errorMsg = "📦 Episode file is too large (>50MB)\n\nMessenger cannot send files this big.";
      } else if (error.response?.status === 404) {
        errorMsg = "❌ Episode not found. Check the anime name and episode number.";
      } else if (error.response?.status === 403) {
        errorMsg = "🚫 Access denied. The video source is blocked.";
      }

      return message.reply(
        `${errorMsg}\n\n` +
        `💡 Suggestions:\n` +
        `• Try a different episode\n` +
        `• Try shorter/older anime (smaller files)\n` +
        `• Watch online instead:\n` +
        `  https://gogoanime.pe/${animeName}-episode-${episodeNum}\n\n` +
        `✅ Anime that usually work:\n` +
        `+anime naruto 1\n` +
        `+anime death-note 1\n` +
        `+anime cowboy-bebop 1`
      );
    }
  }
};
