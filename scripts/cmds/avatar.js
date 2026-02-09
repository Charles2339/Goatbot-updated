const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
        config: {
                name: "avatar",
                aliases: ["avt", "banner", "card"],
                author: "CharlesMK",
                version: "4.0",
                countDown: 5,
                role: 0,
                shortDescription: "Create custom avatar/banner",
                longDescription: "Create beautiful custom avatars and banners with various styles",
                category: "image",
                guide: {
                        en: "{pn} <style> <text>\n\n" +
                            "Available styles:\n" +
                            "● welcome - Welcome card\n" +
                            "● goodbye - Goodbye card\n" +
                            "● rank - Rank card\n" +
                            "● ship - Ship card\n" +
                            "● tweet - Fake tweet\n" +
                            "● youtube - YT comment\n" +
                            "\nExamples:\n" +
                            "{pn} welcome CharlesMK\n" +
                            "{pn} rank CharlesMK | 50 | 1000\n" +
                            "{pn} tweet CharlesMK | Hello World!"
                }
        },

        onStart: async function ({ args, message, event, usersData }) {
                if (!args[0]) {
                        return message.reply(
                                "🎨 𝗔𝗩𝗔𝗧𝗔𝗥/𝗕𝗔𝗡𝗡𝗘𝗥 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗢𝗥\n" +
                                "━━━━━━━━━━━━━━━━━━\n\n" +
                                "📋 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗦𝘁𝘆𝗹𝗲𝘀:\n" +
                                "━━━━━━━━━━━━━━━━━━\n" +
                                "● welcome - Welcome card\n" +
                                "● goodbye - Goodbye card\n" +
                                "● rank - Rank card\n" +
                                "● ship - Ship/love card\n" +
                                "● tweet - Fake tweet\n" +
                                "● youtube - YT comment\n" +
                                "● triggered - Triggered meme\n" +
                                "● wanted - Wanted poster\n\n" +
                                "💡 𝗨𝘀𝗮𝗴𝗲:\n" +
                                "+avatar <style> <text>\n\n" +
                                "📝 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:\n" +
                                "+avatar welcome CharlesMK\n" +
                                "+avatar rank MK | 50 | 1000\n" +
                                "+avatar tweet @CharlesMK | Hello!\n" +
                                "━━━━━━━━━━━━━━━━━━"
                        );
                }

                const style = args[0].toLowerCase();
                const input = args.slice(1).join(" ").split("|").map(item => item.trim());
                
                const { senderID } = event;
                const userData = await usersData.get(senderID);
                const userName = userData.name || "User";
                
                // Get user's avatar
                const userAvatar = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

                message.reply("🎨 𝖢𝗋𝖾𝖺𝗍𝗂𝗇𝗀 𝗒𝗈𝗎𝗋 𝗂𝗆𝖺𝗀𝖾...");

                try {
                        let apiUrl = "";
                        let successMsg = "";

                        switch (style) {
                                case "welcome":
                                case "goodbye": {
                                        const displayName = input[0] || userName;
                                        const memberCount = input[1] || "1000";
                                        const type = style === "welcome" ? "welcomecard" : "goodbyecard";
                                        
                                        apiUrl = `https://api.popcat.xyz/${type}?background=https://i.imgur.com/9HGBgOD.jpg&text1=${encodeURIComponent(displayName)}&text2=Member #${memberCount}&text3=${style === "welcome" ? "Welcome!" : "Goodbye!"}&avatar=${userAvatar}`;
                                        successMsg = `✅ ${style.toUpperCase()} 𝗖𝗔𝗥𝗗\n━━━━━━━━━━━━━━━━━━\n\n👤 𝗡𝗮𝗺𝗲: ${displayName}\n📊 𝗠𝗲𝗺𝗯𝗲𝗿: #${memberCount}`;
                                        break;
                                }

                                case "rank": {
                                        const displayName = input[0] || userName;
                                        const level = input[1] || "1";
                                        const xp = input[2] || "0";
                                        const neededxp = input[3] || "100";
                                        
                                        apiUrl = `https://api.popcat.xyz/levelcard?background=https://i.imgur.com/9HGBgOD.jpg&avatar=${userAvatar}&username=${encodeURIComponent(displayName)}&level=${level}&currentxp=${xp}&neededxp=${neededxp}`;
                                        successMsg = `✅ 𝗥𝗔𝗡𝗞 𝗖𝗔𝗥𝗗\n━━━━━━━━━━━━━━━━━━\n\n👤 𝗡𝗮𝗺𝗲: ${displayName}\n⭐ 𝗟𝗲𝘃𝗲𝗹: ${level}\n✨ 𝗘𝗫𝗣: ${xp}/${neededxp}`;
                                        break;
                                }

                                case "ship":
                                case "love": {
                                        const user1 = input[0] || userName;
                                        const user2 = input[1] || "Someone";
                                        
                                        apiUrl = `https://api.popcat.xyz/ship?user1=${userAvatar}&user2=https://i.imgur.com/0R4F6qp.png`;
                                        successMsg = `✅ 𝗦𝗛𝗜𝗣 𝗖𝗔𝗥𝗗\n━━━━━━━━━━━━━━━━━━\n\n💕 ${user1} × ${user2}\n━━━━━━━━━━━━━━━━━━`;
                                        break;
                                }

                                case "tweet":
                                case "twitter": {
                                        const username = input[0] || "@CharlesMK";
                                        const text = input[1] || "Hello World!";
                                        const displayName = input[2] || userName;
                                        
                                        apiUrl = `https://api.popcat.xyz/twitter?text=${encodeURIComponent(text)}&username=${encodeURIComponent(username)}&displayname=${encodeURIComponent(displayName)}&avatar=${userAvatar}`;
                                        successMsg = `✅ 𝗧𝗪𝗘𝗘𝗧 𝗖𝗔𝗥𝗗\n━━━━━━━━━━━━━━━━━━\n\n👤 ${displayName} (${username})\n💬 "${text}"`;
                                        break;
                                }

                                case "youtube":
                                case "yt": {
                                        const username = input[0] || userName;
                                        const comment = input[1] || "Great video!";
                                        
                                        apiUrl = `https://api.popcat.xyz/youtube-comment?image=${userAvatar}&username=${encodeURIComponent(username)}&comment=${encodeURIComponent(comment)}`;
                                        successMsg = `✅ 𝗬𝗢𝗨𝗧𝗨𝗕𝗘 𝗖𝗢𝗠𝗠𝗘𝗡𝗧\n━━━━━━━━━━━━━━━━━━\n\n👤 ${username}\n💬 "${comment}"`;
                                        break;
                                }

                                case "triggered":
                                case "trigger": {
                                        apiUrl = `https://api.popcat.xyz/triggered?image=${userAvatar}`;
                                        successMsg = `✅ 𝗧𝗥𝗜𝗚𝗚𝗘𝗥𝗘𝗗\n━━━━━━━━━━━━━━━━━━\n\n😡 ${userName} is triggered!`;
                                        break;
                                }

                                case "wanted": {
                                        const price = input[0] || "$1,000,000";
                                        apiUrl = `https://api.popcat.xyz/wanted?image=${userAvatar}`;
                                        successMsg = `✅ 𝗪𝗔𝗡𝗧𝗘𝗗 𝗣𝗢𝗦𝗧𝗘𝗥\n━━━━━━━━━━━━━━━━━━\n\n🎯 ${userName}\n💰 Reward: ${price}`;
                                        break;
                                }

                                case "blur": {
                                        apiUrl = `https://api.popcat.xyz/blur?image=${userAvatar}`;
                                        successMsg = `✅ 𝗕𝗟𝗨𝗥𝗥𝗘𝗗\n━━━━━━━━━━━━━━━━━━\n\n🌫️ Blurred effect applied`;
                                        break;
                                }

                                case "invert": {
                                        apiUrl = `https://api.popcat.xyz/invert?image=${userAvatar}`;
                                        successMsg = `✅ 𝗜𝗡𝗩𝗘𝗥𝗧𝗘𝗗\n━━━━━━━━━━━━━━━━━━\n\n🔄 Color inverted`;
                                        break;
                                }

                                case "greyscale":
                                case "gray": {
                                        apiUrl = `https://api.popcat.xyz/greyscale?image=${userAvatar}`;
                                        successMsg = `✅ 𝗚𝗥𝗘𝗬𝗦𝗖𝗔𝗟𝗘\n━━━━━━━━━━━━━━━━━━\n\n⚫ Converted to greyscale`;
                                        break;
                                }

                                default:
                                        return message.reply(
                                                "❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗦𝗧𝗬𝗟𝗘\n\n" +
                                                "💡 Available: welcome, goodbye, rank, ship, tweet, youtube, triggered, wanted, blur, invert, greyscale\n\n" +
                                                "📖 Use: +avatar to see all options"
                                        );
                        }

                        // Fetch the image
                        const response = await axios.get(apiUrl, {
                                responseType: 'arraybuffer',
                                timeout: 60000
                        });

                        const path = __dirname + `/cache/avatar_${senderID}_${Date.now()}.png`;
                        fs.writeFileSync(path, Buffer.from(response.data));

                        await message.reply({
                                body: successMsg + "\n━━━━━━━━━━━━━━━━━━",
                                attachment: fs.createReadStream(path)
                        });

                        fs.unlinkSync(path);

                } catch (error) {
                        console.error("Avatar generation error:", error);
                        return message.reply(
                                "❌ 𝗘𝗥𝗥𝗢𝗥\n" +
                                "━━━━━━━━━━━━━━━━━━\n\n" +
                                `⚠️ ${error.message}\n\n` +
                                "💡 Please check your input and try again\n" +
                                "📖 Use: +avatar for help"
                        );
                }
        }
};
