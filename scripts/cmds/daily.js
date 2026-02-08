const moment = require("moment-timezone");

module.exports = {
        config: {
                name: "daily",
                version: "2.0",
                author: "CharlesMK",
                countDown: 5,
                role: 0,
                description: {
                        vi: "Nhận quà hàng ngày",
                        en: "Receive daily gift with streak bonuses"
                },
                category: "game",
                guide: {
                        vi: "   {pn}: Nhận quà hàng ngày"
                                + "\n   {pn} info: Xem thông tin quà hàng ngày",
                        en: "   {pn}: Claim your daily reward"
                                + "\n   {pn} info: View daily gift information and streak bonus"
                },
                envConfig: {
                        rewardFirstDay: {
                                coin: 100,
                                exp: 30
                        }
                }
        },

        langs: {
                vi: {
                        monday: "Thứ 2",
                        tuesday: "Thứ 3",
                        wednesday: "Thứ 4",
                        thursday: "Thứ 5",
                        friday: "Thứ 6",
                        saturday: "Thứ 7",
                        sunday: "Chủ nhật",
                        alreadyReceived: "❌ 𝖸𝗈𝗎 𝗁𝖺𝗏𝖾 𝖺𝗅𝗋𝖾𝖺𝖽𝗒 𝖼𝗅𝖺𝗂𝗆𝖾𝖽 𝗒𝗈𝗎𝗋 𝖽𝖺𝗂𝗅𝗒 𝗋𝖾𝗐𝖺𝗋𝖽 𝗍𝗈𝖽𝖺𝗒!\n\n⏰ 𝖢𝗈𝗆𝖾 𝖻𝖺𝖼𝗄 𝗍𝗈𝗆𝗈𝗋𝗋𝗈𝗐 𝖿𝗈𝗋 𝗆𝗈𝗋𝖾 𝗋𝖾𝗐𝖺𝗋𝖽𝗌!",
                        received: "🎁 𝗗𝗔𝗜𝗟𝗬 𝗥𝗘𝗪𝗔𝗥𝗗 𝗖𝗟𝗔𝗜𝗠𝗘𝗗!\n━━━━━━━━━━━━━━━━━━\n\n💰 𝗠𝗼𝗻𝗲𝘆: $%1\n✨ 𝗘𝗫𝗣: %2\n🔥 𝗦𝘁𝗿𝗲𝗮𝗸: %3 𝖽𝖺𝗒(𝗌)\n\n%4",
                        streakBonus: "🎉 𝗦𝗧𝗥𝗘𝗔𝗞 𝗕𝗢𝗡𝗨𝗦!\n💎 +$1,000,000,000\n⭐ +80 𝖤𝖷𝖯\n\n🏆 𝖸𝗈𝗎'𝗏𝖾 𝖼𝗅𝖺𝗂𝗆𝖾𝖽 7 𝖽𝖺𝗒𝗌 𝗂𝗇 𝖺 𝗋𝗈𝗐!",
                        streakLost: "⚠️ 𝖲𝗍𝗋𝖾𝖺𝗄 𝗋𝖾𝗌𝖾𝗍! 𝖢𝗅𝖺𝗂𝗆 𝖽𝖺𝗂𝗅𝗒 𝖿𝗈𝗋 7 𝖽𝖺𝗒𝗌 𝗌𝗍𝗋𝖺𝗂𝗀𝗁𝗍 𝖿𝗈𝗋 𝖻𝗈𝗇𝗎𝗌!"
                },
                en: {
                        monday: "𝗠𝗼𝗻𝗱𝗮𝘆",
                        tuesday: "𝗧𝘂𝗲𝘀𝗱𝗮𝘆",
                        wednesday: "𝗪𝗲𝗱𝗻𝗲𝘀𝗱𝗮𝘆",
                        thursday: "𝗧𝗵𝘂𝗿𝘀𝗱𝗮𝘆",
                        friday: "𝗙𝗿𝗶𝗱𝗮𝘆",
                        saturday: "𝗦𝗮𝘁𝘂𝗿𝗱𝗮𝘆",
                        sunday: "𝗦𝘂𝗻𝗱𝗮𝘆",
                        alreadyReceived: "❌ 𝖸𝗈𝗎 𝗁𝖺𝗏𝖾 𝖺𝗅𝗋𝖾𝖺𝖽𝗒 𝖼𝗅𝖺𝗂𝗆𝖾𝖽 𝗒𝗈𝗎𝗋 𝖽𝖺𝗂𝗅𝗒 𝗋𝖾𝗐𝖺𝗋𝖽 𝗍𝗈𝖽𝖺𝗒!\n\n⏰ 𝖢𝗈𝗆𝖾 𝖻𝖺𝖼𝗄 𝗍𝗈𝗆𝗈𝗋𝗋𝗈𝗐 𝖿𝗈𝗋 𝗆𝗈𝗋𝖾 𝗋𝖾𝗐𝖺𝗋𝖽𝗌!",
                        received: "🎁 𝗗𝗔𝗜𝗟𝗬 𝗥𝗘𝗪𝗔𝗥𝗗 𝗖𝗟𝗔𝗜𝗠𝗘𝗗!\n━━━━━━━━━━━━━━━━━━\n\n💰 𝗠𝗼𝗻𝗲𝘆: $%1\n✨ 𝗘𝗫𝗣: %2\n🔥 𝗦𝘁𝗿𝗲𝗮𝗸: %3 𝖽𝖺𝗒(𝗌)\n\n%4",
                        streakBonus: "🎉 𝗦𝗧𝗥𝗘𝗔𝗞 𝗕𝗢𝗡𝗨𝗦!\n💎 +$1,000,000,000\n⭐ +80 𝖤𝖷𝖯\n\n🏆 𝖸𝗈𝗎'𝗏𝖾 𝖼𝗅𝖺𝗂𝗆𝖾𝖽 7 𝖽𝖺𝗒𝗌 𝗂𝗇 𝖺 𝗋𝗈𝗐!",
                        streakLost: "⚠️ 𝖲𝗍𝗋𝖾𝖺𝗄 𝗋𝖾𝗌𝖾𝗍! 𝖢𝗅𝖺𝗂𝗆 𝖽𝖺𝗂𝗅𝗒 𝖿𝗈𝗋 7 𝖽𝖺𝗒𝗌 𝗌𝗍𝗋𝖺𝗂𝗀𝗁𝗍 𝖿𝗈𝗋 𝖻𝗈𝗇𝗎𝗌!"
                }
        },

        onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
                const reward = envCommands[commandName].rewardFirstDay;
                
                if (args[0] == "info") {
                        let msg = "📋 𝗗𝗔𝗜𝗟𝗬 𝗥𝗘𝗪𝗔𝗥𝗗 𝗦𝗖𝗛𝗘𝗗𝗨𝗟𝗘\n━━━━━━━━━━━━━━━━━━\n\n";
                        
                        for (let i = 1; i < 8; i++) {
                                const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
                                const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
                                const day = i == 7 ? getLang("sunday") :
                                        i == 6 ? getLang("saturday") :
                                                i == 5 ? getLang("friday") :
                                                      i == 4 ? getLang("thursday") :
                                                      i == 3 ? getLang("wednesday") :
                                                      i == 2 ? getLang("tuesday") :
                                                      getLang("monday");
                                
                                const dayNumber = i == 7 ? "📅" : `📅`;
                                msg += `${dayNumber} ${day}\n   💰 $${getCoin.toLocaleString()}\n   ✨ ${getExp} 𝖤𝖷𝖯\n\n`;
                        }
                        
                        msg += "━━━━━━━━━━━━━━━━━━\n";
                        msg += "🎁 𝗦𝗧𝗥𝗘𝗔𝗞 𝗕𝗢𝗡𝗨𝗦\n";
                        msg += "🔥 𝖢𝗅𝖺𝗂𝗆 7 𝖽𝖺𝗒𝗌 𝗂𝗇 𝖺 𝗋𝗈𝗐:\n";
                        msg += "   💎 $1,000,000,000\n";
                        msg += "   ⭐ 80 𝖤𝖷𝖯\n";
                        msg += "━━━━━━━━━━━━━━━━━━";
                        
                        return message.reply(msg);
                }

                const dateTime = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY");
                const date = new Date();
                const currentDay = date.getDay(); // 0: sunday, 1: monday, 2: tuesday, 3: wednesday, 4: thursday, 5: friday, 6: saturday
                const { senderID } = event;

                const userData = await usersData.get(senderID);
                
                // Check if already claimed today
                if (userData.data.lastTimeGetReward === dateTime)
                        return message.reply(getLang("alreadyReceived"));

                // Initialize streak data if it doesn't exist
                if (!userData.data.dailyStreak) {
                        userData.data.dailyStreak = {
                                count: 0,
                                lastDate: null
                        };
                }

                // Calculate streak
                let streakCount = userData.data.dailyStreak.count || 0;
                const lastDate = userData.data.dailyStreak.lastDate;
                const yesterday = moment.tz("Asia/Ho_Chi_Minh").subtract(1, 'days').format("DD/MM/YYYY");
                
                let streakMessage = "";
                let bonusCoin = 0;
                let bonusExp = 0;

                // Check if streak continues
                if (lastDate === yesterday) {
                        // Streak continues
                        streakCount += 1;
                } else if (lastDate !== dateTime) {
                        // Streak broken, reset to 1
                        if (streakCount > 0) {
                                streakMessage = getLang("streakLost") + "\n";
                        }
                        streakCount = 1;
                }

                // Check for 7-day streak bonus
                if (streakCount === 7) {
                        bonusCoin = 1000000000; // $1,000,000,000
                        bonusExp = 80;
                        streakMessage = getLang("streakBonus");
                        streakCount = 0; // Reset streak after bonus
                } else if (streakCount > 0) {
                        streakMessage = `💪 𝖪𝖾𝖾𝗉 𝗀𝗈𝗂𝗇𝗀! ${7 - streakCount} 𝗆𝗈𝗋𝖾 𝖽𝖺𝗒(𝗌) 𝖿𝗈𝗋 𝖻𝗈𝗇𝗎𝗌!`;
                }

                // Calculate daily rewards
                const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((currentDay == 0 ? 7 : currentDay) - 1));
                const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((currentDay == 0 ? 7 : currentDay) - 1));
                
                // Total rewards
                const totalCoin = getCoin + bonusCoin;
                const totalExp = getExp + bonusExp;

                // Update user data
                userData.data.lastTimeGetReward = dateTime;
                userData.data.dailyStreak = {
                        count: streakCount,
                        lastDate: dateTime
                };

                await usersData.set(senderID, {
                        money: userData.money + totalCoin,
                        exp: userData.exp + totalExp,
                        data: userData.data
                });

                // Display current streak count (before reset if bonus was claimed)
                const displayStreak = bonusCoin > 0 ? 7 : streakCount;
                
                message.reply(getLang("received", totalCoin.toLocaleString(), totalExp, displayStreak, streakMessage));
        }
};
