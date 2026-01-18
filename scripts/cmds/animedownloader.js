const axios = require('axios');

module.exports = {
  config: {
    name: "anime",
    aliases: ["animedl", "animedownload"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 10,
    role: 0,
    description: {
      en: "Search and download anime episodes"
    },
    category: "download",
    guide: {
      en: "{pn} <anime name> <episode number>\nExample: {pn} Naruto 1\n{pn} One Piece 100"
    }
  },

  onStart: async function ({ args, message, event }) {
    if (args.length < 2) {
      return message.reply(
        "❌ Please provide anime name and episode number!\n\n" +
        "Usage: +anime <name> <episode>\n" +
        "Example: +anime Naruto 1"
      );
    }

    // Extract episode number (last argument)
    const episodeNum = args[args.length - 1];
    
    // Check if last argument is a number
    if (isNaN(episodeNum)) {
      return message.reply(
        "❌ Please provide a valid episode number!\n\n" +
        "Example: +anime Naruto 1"
      );
    }

    // Anime name is everything except the last argument
    const animeName = args.slice(0, -1).join(' ');

    try {
      await message.reply(`🔍 Searching for ${animeName} Episode ${episodeNum}... ⏳`);

      // Try API 1: GoGoAnime API
      let videoUrl = null;
      let animeTitle = animeName;

      try {
        // Search for anime
        const searchResponse = await axios.get(
          `https://api.consumet.org/anime/gogoanime/${encodeURIComponent(animeName)}`,
          { timeout: 15000 }
        );

        if (searchResponse.data?.results && searchResponse.data.results.length > 0) {
          const anime = searchResponse.data.results[0];
          animeTitle = anime.title;
          const animeId = anime.id;

          // Get episode info
          const episodesResponse = await axios.get(
            `https://api.consumet.org/anime/gogoanime/info/${animeId}`,
            { timeout: 15000 }
          );

          if (episodesResponse.data?.episodes) {
            const episode = episodesResponse.data.episodes.find(ep => 
              ep.number === parseInt(episodeNum)
            );

            if (episode) {
              // Get video link
              const videoResponse = await axios.get(
                `https://api.consumet.org/anime/gogoanime/watch/${episode.id}`,
                { timeout: 15000 }
              );

              if (videoResponse.data?.sources) {
                // Get best quality
                const source = videoResponse.data.sources.find(s => s.quality === '720p') || 
                              videoResponse.data.sources.find(s => s.quality === '480p') ||
                              videoResponse.data.sources[0];
                
                videoUrl = source.url;
              }
            }
          }
        }
      } catch (e) {
        console.log("API 1 failed:", e.message);
      }

      // Try API 2: AnimeFox (Backup)
      if (!videoUrl) {
        try {
          const searchResponse = await axios.get(
            `https://api-anime-rouge.vercel.app/anime/search/${encodeURIComponent(animeName)}`,
            { timeout: 15000 }
          );

          if (searchResponse.data?.results?.[0]) {
            const anime = searchResponse.data.results[0];
            animeTitle = anime.title?.english || anime.title?.romaji || animeName;
            
            const episodeResponse = await axios.get(
              `https://api-anime-rouge.vercel.app/anime/episode/${anime.id}/${episodeNum}`,
              { timeout: 15000 }
            );

            videoUrl = episodeResponse.data?.video || episodeResponse.data?.sources?.[0]?.url;
          }
        } catch (e) {
          console.log("API 2 failed:", e.message);
        }
      }

      // Try API 3: Anime API (Backup 2)
      if (!videoUrl) {
        try {
          const response = await axios.get(
            `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeName)}&limit=1`,
            { timeout: 15000 }
          );

          if (response.data?.data?.[0]) {
            animeTitle = response.data.data[0].title;
          }

          // Try alternative download API
          const dlResponse = await axios.post(
            'https://anime-dl-api.herokuapp.com/download',
            {
              anime: animeName,
              episode: episodeNum
            },
            { timeout: 15000 }
          );

          videoUrl = dlResponse.data?.url || dlResponse.data?.video;
        } catch (e) {
          console.log("API 3 failed:", e.message);
        }
      }

      if (!videoUrl) {
        return message.reply(
          `❌ Could not find ${animeName} Episode ${episodeNum}\n\n` +
          `Please check:\n` +
          `• Anime name spelling\n` +
          `• Episode number exists\n` +
          `• Try different spelling\n\n` +
          `Example: +anime One Piece 1`
        );
      }

      await message.reply(`⏬ Downloading ${animeTitle} Episode ${episodeNum}... 📺`);

      // Download video
      const videoResponse = await axios.get(videoUrl, {
        responseType: 'stream',
        timeout: 120000, // 2 minutes for large files
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://gogoanime.pe/'
        },
        maxContentLength: 100 * 1024 * 1024, // 100MB limit
        maxBodyLength: 100 * 1024 * 1024
      });

      // Send video
      await message.reply({
        body: `✅ ${animeTitle} - Episode ${episodeNum}\n\n📺 Enjoy watching! 🍿`,
        attachment: videoResponse.data
      });

    } catch (error) {
      console.error("Anime download error:", error);

      let errorMsg = "Failed to download anime episode.";

      if (error.code === 'ECONNABORTED') {
        errorMsg = "Download timed out. The episode file might be too large.";
      } else if (error.response?.status === 404) {
        errorMsg = "Episode not found. Please check the anime name and episode number.";
      } else if (error.message?.includes('maxContentLength')) {
        errorMsg = "Episode file is too large (>100MB). Try a different episode or lower quality.";
      }

      return message.reply(
        `❌ ${errorMsg}\n\n` +
        `Troubleshooting:\n` +
        `• Check anime name spelling\n` +
        `• Verify episode exists\n` +
        `• Try popular anime for better availability\n` +
        `• Some episodes may be too large to send`
      );
    }
  }
};
