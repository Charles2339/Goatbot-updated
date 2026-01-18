const axios = require('axios');

module.exports = {
  config: {
    name: "anime",
    aliases: ["animedl", "animedownload"],
    version: "2.0",
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
        "+anime attack-on-titan 1\n\n" +
        "💡 Tip: Use hyphens (-) instead of spaces"
      );
    }

    // Extract episode number (last argument)
    const episodeNum = args[args.length - 1];
    
    if (isNaN(episodeNum)) {
      return message.reply(
        "❌ Please provide a valid episode number!\n\n" +
        "Example: +anime one-piece 1"
      );
    }

    // Anime name - convert spaces to hyphens
    const animeName = args.slice(0, -1).join('-').toLowerCase();

    try {
      await message.reply(`🔍 Searching for ${animeName.replace(/-/g, ' ')} Episode ${episodeNum}... ⏳`);

      let videoUrl = null;
      let downloadUrl = null;

      // API 1: AnimePahe API
      try {
        const searchUrl = `https://animepahe.ru/api?m=search&q=${encodeURIComponent(animeName.replace(/-/g, ' '))}`;
        const searchResponse = await axios.get(searchUrl, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        if (searchResponse.data?.data && searchResponse.data.data.length > 0) {
          const animeId = searchResponse.data.data[0].session;
          
          const episodeUrl = `https://animepahe.ru/api?m=release&id=${animeId}&sort=episode_asc&page=1`;
          const episodeResponse = await axios.get(episodeUrl, {
            timeout: 15000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });

          const episode = episodeResponse.data?.data?.find(ep => ep.episode == episodeNum);
          
          if (episode) {
            downloadUrl = `https://animepahe.ru/play/${animeId}/${episode.session}`;
            console.log("AnimePahe found:", downloadUrl);
          }
        }
      } catch (e) {
        console.log("AnimePahe failed:", e.message);
      }

      // API 2: Gogoanime via different endpoint
      if (!videoUrl && !downloadUrl) {
        try {
          // Format: gogoanime-id-episode-number
          const gogoId = `${animeName}-episode-${episodeNum}`;
          
          const response = await axios.get(
            `https://gogoanime.consumet.stream/vidcdn/watch/${gogoId}`,
            { 
              timeout: 15000,
              headers: { 'User-Agent': 'Mozilla/5.0' }
            }
          );

          if (response.data?.sources) {
            const source = response.data.sources.find(s => s.quality === '720p') || 
                          response.data.sources.find(s => s.quality === '480p') ||
                          response.data.sources[0];
            
            videoUrl = source.url;
            console.log("Gogoanime found:", videoUrl);
          }
        } catch (e) {
          console.log("Gogoanime failed:", e.message);
        }
      }

      // API 3: Alternative Gogoanime
      if (!videoUrl && !downloadUrl) {
        try {
          const animeId = `${animeName}`;
          const episodeId = `${animeName}-episode-${episodeNum}`;
          
          const response = await axios.get(
            `https://api.consumet.org/anime/gogoanime/watch/${episodeId}`,
            { 
              timeout: 15000,
              headers: { 'User-Agent': 'Mozilla/5.0' }
            }
          );

          if (response.data?.sources) {
            const source = response.data.sources.find(s => s.quality === '720p') || 
                          response.data.sources.find(s => s.quality === '480p') ||
                          response.data.sources[0];
            
            videoUrl = source.url;
            console.log("Consumet found:", videoUrl);
          }
        } catch (e) {
          console.log("Consumet failed:", e.message);
        }
      }

      // API 4: AnimeFox
      if (!videoUrl && !downloadUrl) {
        try {
          const response = await axios.get(
            `https://api-aniwatch.onrender.com/anime/episode-srcs?id=${animeName}-${episodeNum}`,
            { 
              timeout: 15000,
              headers: { 'User-Agent': 'Mozilla/5.0' }
            }
          );

          if (response.data?.sources) {
            videoUrl = response.data.sources[0]?.url;
            console.log("AnimeFox found:", videoUrl);
          }
        } catch (e) {
          console.log("AnimeFox failed:", e.message);
        }
      }

      // API 5: Direct streaming link generator
      if (!videoUrl && !downloadUrl) {
        try {
          // Try common streaming patterns
          const possibleUrls = [
            `https://gogoplay1.com/streaming.php?id=${animeName}-episode-${episodeNum}`,
            `https://gogohd.net/streaming.php?id=${animeName}-episode-${episodeNum}`,
            `https://streamani.net/streaming.php?id=${animeName}-episode-${episodeNum}`
          ];

          for (const url of possibleUrls) {
            try {
              const response = await axios.head(url, { timeout: 5000 });
              if (response.status === 200) {
                videoUrl = url;
                console.log("Direct streaming found:", videoUrl);
                break;
              }
            } catch (e) {
              continue;
            }
          }
        } catch (e) {
          console.log("Direct streaming failed:", e.message);
        }
      }

      if (!videoUrl && !downloadUrl) {
        return message.reply(
          `❌ Could not find "${animeName.replace(/-/g, ' ')}" Episode ${episodeNum}\n\n` +
          `💡 Tips:\n` +
          `• Use hyphens: "one-piece" not "One Piece"\n` +
          `• Try lowercase: "naruto" not "Naruto"\n` +
          `• Check episode exists\n\n` +
          `Examples that work:\n` +
          `+anime one-piece 1\n` +
          `+anime naruto-shippuden 1\n` +
          `+anime attack-on-titan 1\n` +
          `+anime demon-slayer 1\n` +
          `+anime my-hero-academia 1`
        );
      }

      // If we have a download page URL, inform user
      if (downloadUrl && !videoUrl) {
        return message.reply(
          `✅ Found "${animeName.replace(/-/g, ' ')}" Episode ${episodeNum}!\n\n` +
          `📺 Direct streaming not available, but you can watch here:\n` +
          `${downloadUrl}\n\n` +
          `The APIs are having issues with direct downloads right now.`
        );
      }

      await message.reply(`⏬ Downloading ${animeName.replace(/-/g, ' ')} Episode ${episodeNum}... 📺`);

      // Download video
      const videoResponse = await axios.get(videoUrl, {
        responseType: 'stream',
        timeout: 180000, // 3 minutes
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://gogoanime.pe/'
        },
        maxContentLength: 100 * 1024 * 1024,
        maxBodyLength: 100 * 1024 * 1024
      });

      // Send video
      await message.reply({
        body: `✅ ${animeName.replace(/-/g, ' ').toUpperCase()} - Episode ${episodeNum}\n\n📺 Enjoy watching! 🍿`,
        attachment: videoResponse.data
      });

    } catch (error) {
      console.error("Anime download error:", error);

      let errorMsg = "Failed to download anime episode.";

      if (error.code === 'ECONNABORTED') {
        errorMsg = "Download timed out. Episode might be too large or servers are slow.";
      } else if (error.response?.status === 404) {
        errorMsg = "Episode not found. Check the anime name format.";
      } else if (error.message?.includes('maxContentLength')) {
        errorMsg = "Episode file is too large (>100MB).";
      }

      return message.reply(
        `❌ ${errorMsg}\n\n` +
        `Please try:\n` +
        `• Use format: +anime one-piece 1\n` +
        `• Use hyphens between words\n` +
        `• Use lowercase\n` +
        `• Try popular anime with simple names\n\n` +
        `Working examples:\n` +
        `+anime naruto 1\n` +
        `+anime bleach 1\n` +
        `+anime one-piece 1`
      );
    }
  }
};
