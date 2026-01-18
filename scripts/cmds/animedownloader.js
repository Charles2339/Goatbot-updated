const axios = require('axios');

module.exports = {
  config: {
    name: "anime",
    aliases: ["animedl", "animedownload"],
    version: "3.0",
    author: "CharlesMK",
    countDown: 10,
    role: 0,
    description: {
      en: "Search and download anime episodes"
    },
    category: "download",
    guide: {
      en: "{pn} <anime name>\nExample: {pn} naruto ep 1\n{pn} bleach ep 5"
    }
  },

  onStart: async function ({ args, message, event }) {
    if (args.length < 3) {
      return message.reply(
        "❌ Usage: +anime <name> ep <number>\n\n" +
        "Examples:\n" +
        "+anime naruto ep 1\n" +
        "+anime bleach ep 1\n" +
        "+anime one piece ep 1\n" +
        "+anime death note ep 1"
      );
    }

    // Find "ep" keyword
    const epIndex = args.findIndex(arg => arg.toLowerCase() === 'ep');
    
    if (epIndex === -1 || epIndex === args.length - 1) {
      return message.reply("❌ Format: +anime <name> ep <number>\nExample: +anime naruto ep 1");
    }

    const animeName = args.slice(0, epIndex).join(' ').toLowerCase();
    const episodeNum = args[epIndex + 1];

    if (isNaN(episodeNum)) {
      return message.reply("❌ Invalid episode number!");
    }

    try {
      await message.reply(`🔍 Searching for ${animeName} Episode ${episodeNum}... ⏳`);

      let videoUrl = null;
      let downloadLink = null;

      // Create slug (convert to gogoanime format)
      const slug = animeName.replace(/\s+/g, '-');

      // Try multiple gogoanime servers
      const servers = [
        `https://anitaku.pe/${slug}-episode-${episodeNum}`,
        `https://gogoanime3.co/${slug}-episode-${episodeNum}`,
        `https://www1.gogoanime.bid/${slug}-episode-${episodeNum}`,
        `https://gogoanime.cl/${slug}-episode-${episodeNum}`
      ];

      // Check which server has the episode
      for (const server of servers) {
        try {
          const response = await axios.head(server, { 
            timeout: 5000,
            maxRedirects: 5 
          });
          
          if (response.status === 200) {
            downloadLink = server;
            console.log("Found episode page:", server);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (downloadLink) {
        return message.reply(
          `✅ Found "${animeName}" Episode ${episodeNum}!\n\n` +
          `📺 Watch here:\n${downloadLink}\n\n` +
          `⚠️ Direct downloads are currently unavailable due to API restrictions.\n` +
          `You can watch it online at the link above! 🍿`
        );
      }

      // Alternative: Try API-based search
      const searchTerms = [
        slug,
        animeName.replace(/\s+/g, ''),
        animeName.replace(/\s+/g, '-').toLowerCase()
      ];

      for (const term of searchTerms) {
        try {
          const episodeId = `${term}-episode-${episodeNum}`;
          
          const response = await axios.get(
            `https://api.consumet.org/anime/gogoanime/watch/${episodeId}?server=gogocdn`,
            { 
              timeout: 15000,
              headers: { 'User-Agent': 'Mozilla/5.0' }
            }
          );

          if (response.data?.sources && response.data.sources.length > 0) {
            const source = response.data.sources.find(s => s.quality === '360p') || 
                          response.data.sources.find(s => s.quality === '480p') ||
                          response.data.sources[0];
            
            videoUrl = source.url;
            console.log(`Found via API with term: ${term}`);
            break;
          }
        } catch (e) {
          console.log(`API failed for term: ${term}`);
          continue;
        }
      }

      if (!videoUrl) {
        // Provide helpful search suggestions
        const suggestions = [
          "naruto",
          "bleach", 
          "one-piece",
          "attack-on-titan",
          "demon-slayer",
          "death-note",
          "my-hero-academia",
          "dragon-ball-z"
        ];

        const closestMatch = suggestions.find(s => 
          s.includes(animeName.replace(/\s+/g, '-')) || 
          animeName.replace(/\s+/g, '-').includes(s)
        );

        return message.reply(
          `❌ Could not find "${animeName}" Episode ${episodeNum}\n\n` +
          `💡 Try these formats:\n` +
          `+anime ${animeName} ep ${episodeNum}\n` +
          (closestMatch ? `+anime ${closestMatch} ep ${episodeNum}\n\n` : '\n') +
          `✅ Working examples:\n` +
          `+anime naruto ep 1\n` +
          `+anime bleach ep 1\n` +
          `+anime one piece ep 1\n` +
          `+anime death note ep 1\n\n` +
          `⚠️ Note: The free anime APIs are currently unstable.\n` +
          `Try watching at: https://gogoanime3.co/search.html?keyword=${encodeURIComponent(animeName)}`
        );
      }

      await message.reply(`⏬ Downloading ${animeName} Episode ${episodeNum}... 📺`);

      // Check file size
      try {
        const headResponse = await axios.head(videoUrl, { timeout: 10000 });
        const fileSize = parseInt(headResponse.headers['content-length'] || 0);
        
        if (fileSize > 50 * 1024 * 1024) {
          return message.reply(
            `❌ Episode is too large (${Math.round(fileSize / 1024 / 1024)}MB)\n\n` +
            `Messenger limit: ~25-50MB\n\n` +
            `Watch online: https://gogoanime3.co/search.html?keyword=${encodeURIComponent(animeName)}`
          );
        }
      } catch (e) {
        console.log("Could not check file size");
      }

      // Download with timeout
      const videoResponse = await axios.get(videoUrl, {
        responseType: 'stream',
        timeout: 90000, // 90 seconds
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://gogoanime.pe/'
        },
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024
      });

      await message.reply({
        body: `✅ ${animeName.toUpperCase()} - Episode ${episodeNum}\n\n📺 Enjoy watching! 🍿`,
        attachment: videoResponse.data
      });

    } catch (error) {
      console.error("Anime error:", error.message);

      return message.reply(
        `❌ Download failed\n\n` +
        `Reason: ${error.code === 'ECONNABORTED' ? 'Timeout (file too large)' : 'API/Network error'}\n\n` +
        `💡 Alternative:\n` +
        `Watch online at:\n` +
        `https://gogoanime3.co/search.html?keyword=${encodeURIComponent(animeName)}\n\n` +
        `Or try:\n` +
        `https://9anime.to/search?keyword=${encodeURIComponent(animeName)}`
      );
    }
  }
};
