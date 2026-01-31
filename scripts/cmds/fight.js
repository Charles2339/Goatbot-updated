const TIMEOUT_SECONDS = 120;
const ongoingFights = new Map();
const gameInstances = new Map();
const pendingChallenges = new Map();

module.exports = {
  config: {
    name: "fight",
    version: "2.0",
    author: "Shikai | Redwan | Charles",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Fight with your friends!" },
    category: "fun",
    guide: { en: "{pn} @mention | Reply to message | {pn} [UID] | Use 'topfighter' for leaderboard" },
  },

  onStart: async function ({ event, message, usersData, args }) {
    const threadID = event.threadID;

    // 🏆 Leaderboard
    if (args[0] === "topfighter" || args[0] === "topfight") {
      const allUsers = await usersData.getAll();
      const fighters = allUsers
        .filter(u => u.data && u.data.fightWins > 0)
        .sort((a, b) => {
          const winsA = a.data.fightWins || 0;
          const winsB = b.data.fightWins || 0;
          if (winsB !== winsA) return winsB - winsA;
          const lossesA = a.data.fightLosses || 0;
          const lossesB = b.data.fightLosses || 0;
          return lossesA - lossesB;
        });

      if (fighters.length === 0) {
        return message.reply("🥊 𝗧𝗢𝗣 𝗙𝗜𝗚𝗛𝗧𝗘𝗥𝗦\n━━━━━━━━━━━━━━━━━━━━━━\nNo fighters yet!");
      }

      let msg = "🥊 𝗧𝗢𝗣 𝗙𝗜𝗚𝗛𝗧𝗘𝗥𝗦\n━━━━━━━━━━━━━━━━━━━━━━\n";
      fighters.slice(0, 10).forEach((user, index) => {
        const wins = user.data.fightWins || 0;
        const losses = user.data.fightLosses || 0;
        const total = wins + losses;
        const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;

        msg += `${index + 1}. ${user.name}\n`;
        msg += `   🏆 ${wins}W - ${losses}L | 📊 ${winRate}%\n\n`;
      });
      return message.reply(msg);
    }

    if (ongoingFights.has(threadID)) {
      return message.send("⚔️ 𝗔 𝗳𝗶𝗴𝗵𝘁 𝗶𝘀 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗶𝗻 𝗽𝗿𝗼𝗴𝗿𝗲𝘀𝘀.");
    }

    let opponentID;

    // Check for opponent
    if (event.type === "message_reply") {
      opponentID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      opponentID = Object.keys(event.mentions)[0];
    } else if (args[0] && /^\d+$/.test(args[0])) {
      opponentID = args[0];
    }

    if (!opponentID) {
      return message.send("🤔 𝗣𝗹𝗲𝗮𝘀𝗲 𝗺𝗲𝗻𝘁𝗶𝗼𝗻, 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼, 𝗼𝗿 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗨𝗜𝗗 𝘁𝗼 𝗳𝗶𝗴𝗵𝘁.");
    }

    if (opponentID === event.senderID) {
      return message.send("🤡 𝗬𝗼𝘂 𝗰𝗮𝗻𝗻𝗼𝘁 𝗳𝗶𝗴𝗵𝘁 𝘆𝗼𝘂𝗿𝘀𝗲𝗹𝗳.");
    }

    try {
      const challengerID = event.senderID;
      const challengerName = await usersData.getName(challengerID);
      const opponentName = await usersData.getName(opponentID);

      // Create pending challenge
      const challengeKey = `${threadID}_${challengerID}`;
      pendingChallenges.set(challengeKey, {
        challengerID,
        challengerName,
        opponentID,
        opponentName,
        threadID,
        step: 'mode_selection'
      });

      const sent = await message.send(
        `🤺 𝗙𝗜𝗚𝗛𝗧 𝗖𝗛𝗔𝗟𝗟𝗘𝗡𝗚𝗘\n━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 ${challengerName} 𝘸𝘢𝘯𝘵𝘴 𝘵𝘰 𝘧𝘪𝘨𝘩𝘵 ${opponentName}!\n\n` +
        `𝗖𝗵𝗼𝗼𝘀𝗲 𝗳𝗶𝗴𝗵𝘁 𝗺𝗼𝗱𝗲:\n` +
        `💰 Type "bet" - 𝘍𝘪𝘨𝘩𝘵 𝘸𝘪𝘵𝘩 𝘮𝘰𝘯𝘦𝘺 𝘰𝘯 𝘵𝘩𝘦 𝘭𝘪𝘯𝘦\n` +
        `🤝 Type "friendly" - 𝘍𝘳𝘪𝘦𝘯𝘥𝘭𝘺 𝘮𝘢𝘵𝘤𝘩 ($50M prize)\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `⏱️ 𝘙𝘦𝘱𝘭𝘺 𝘸𝘪𝘵𝘩𝘪𝘯 60𝘴 𝘰𝘳 𝘵𝘺𝘱𝘦 "cancel"`
      );

      // Set timeout for mode selection
      setTimeout(() => {
        if (pendingChallenges.has(challengeKey)) {
          pendingChallenges.delete(challengeKey);
          message.send("⏰ 𝗖𝗵𝗮𝗹𝗹𝗲𝗻𝗴𝗲 𝗲𝘅𝗽𝗶𝗿𝗲𝗱 𝗱𝘂𝗲 𝘁𝗼 𝗶𝗻𝗮𝗰𝘁𝗶𝘃𝗶𝘁𝘆.");
        }
      }, 60000);

    } catch (e) {
      return message.send("❌ 𝗖𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗳𝗶𝗻𝗱 𝘁𝗵𝗮𝘁 𝘂𝘀𝗲𝗿 𝗶𝗻 𝘁𝗵𝗲 𝗱𝗮𝘁𝗮𝗯𝗮𝘀𝗲.");
    }
  },

  onChat: async function ({ event, message, usersData }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const userInput = event.body.trim().toLowerCase();

    // Handle pending challenges
    const challengeKey = `${threadID}_${senderID}`;
    const pendingChallenge = pendingChallenges.get(challengeKey);

    if (pendingChallenge) {
      const { challengerID, challengerName, opponentID, opponentName, step } = pendingChallenge;

      if (userInput === "cancel") {
        pendingChallenges.delete(challengeKey);
        return message.send("❌ 𝗖𝗵𝗮𝗹𝗹𝗲𝗻𝗴𝗲 𝗰𝗮𝗻𝗰𝗲𝗹𝗹𝗲𝗱.");
      }

      // Mode selection
      if (step === 'mode_selection') {
        if (userInput === "bet") {
          pendingChallenge.mode = 'bet';
          pendingChallenge.step = 'bet_amount';
          return message.send(
            `💰 𝗕𝗘𝗧 𝗠𝗢𝗗𝗘 𝗦𝗘𝗟𝗘𝗖𝗧𝗘𝗗\n━━━━━━━━━━━━━━━━━━━━━━\n` +
            `${challengerName}, 𝘩𝘰𝘸 𝘮𝘶𝘤𝘩 𝘥𝘰 𝘺𝘰𝘶 𝘸𝘢𝘯𝘵 𝘵𝘰 𝘣𝘦𝘵?\n` +
            `Type an amount (minimum $1,000)`
          );
        } else if (userInput === "friendly") {
          return this.startFight(message, usersData, {
            challengerID, challengerName, opponentID, opponentName, threadID,
            mode: 'friendly', challengerBet: 0, opponentBet: 0
          });
        }
        return;
      }

      // Bet amount for challenger
      if (step === 'bet_amount') {
        const betAmount = parseInt(userInput.replace(/[,$]/g, ''));
        if (isNaN(betAmount) || betAmount < 1000) {
          return message.send("❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗮𝗺𝗼𝘂𝗻𝘁 (min $1,000)");
        }

        const challengerData = await usersData.get(challengerID);
        if (challengerData.money < betAmount) {
          return message.send(`❌ 𝗬𝗼𝘂 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗲𝗻𝗼𝘂𝗴𝗵 𝗺𝗼𝗻𝗲𝘆!\n𝘉𝘢𝘭𝘢𝘯𝘤𝘦: $${challengerData.money.toLocaleString()}`);
        }

        pendingChallenge.challengerBet = betAmount;
        pendingChallenge.step = 'waiting_opponent_bet';
        
        // Transfer to opponent for response
        const opponentKey = `${threadID}_${opponentID}`;
        pendingChallenges.set(opponentKey, {
          ...pendingChallenge,
          step: 'opponent_bet'
        });
        pendingChallenges.delete(challengeKey);

        return message.send(
          `💰 ${challengerName} 𝗯𝗲𝘁 $${betAmount.toLocaleString()}\n━━━━━━━━━━━━━━━━━━━━━━\n` +
          `${opponentName}, 𝘩𝘰𝘸 𝘮𝘶𝘤𝘩 𝘥𝘰 𝘺𝘰𝘶 𝘸𝘢𝘯𝘵 𝘵𝘰 𝘣𝘦𝘵?\n` +
          `Type an amount or "decline" to refuse`
        );
      }
    }

    // Handle opponent bet
    const opponentKey = `${threadID}_${senderID}`;
    const opponentChallenge = pendingChallenges.get(opponentKey);

    if (opponentChallenge && opponentChallenge.step === 'opponent_bet') {
      if (userInput === "decline") {
        pendingChallenges.delete(opponentKey);
        return message.send(`❌ ${opponentChallenge.opponentName} 𝗱𝗲𝗰𝗹𝗶𝗻𝗲𝗱 𝘁𝗵𝗲 𝗳𝗶𝗴𝗵𝘁.`);
      }

      const betAmount = parseInt(userInput.replace(/[,$]/g, ''));
      if (isNaN(betAmount) || betAmount < 1000) {
        return message.send("❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗮𝗺𝗼𝘂𝗻𝘁 (min $1,000)");
      }

      const opponentData = await usersData.get(senderID);
      if (opponentData.money < betAmount) {
        return message.send(`❌ 𝗬𝗼𝘂 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗲𝗻𝗼𝘂𝗴𝗵 𝗺𝗼𝗻𝗲𝘆!\n𝘉𝘢𝘭𝘢𝘯𝘤𝘦: $${opponentData.money.toLocaleString()}`);
      }

      opponentChallenge.opponentBet = betAmount;
      pendingChallenges.delete(opponentKey);

      return this.startFight(message, usersData, opponentChallenge);
    }

    // Handle ongoing fight
    const gameInstance = gameInstances.get(threadID);
    if (!gameInstance) return;

    const { fight } = gameInstance;
    const attack = userInput;

    const isChallenger = senderID === fight.participants[0].id;
    const isOpponent = senderID === fight.participants[1].id;
    if (!isChallenger && !isOpponent) return;

    if (senderID !== fight.currentPlayer) {
      if (!gameInstance.turnMessageSent) {
        const currentPlayerName = fight.participants.find(p => p.id === fight.currentPlayer).name;
        message.send(`⏳ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁! It's ${currentPlayerName}'s turn.`);
        gameInstance.turnMessageSent = true;
      }
      return;
    }

    if (attack === "forfeit") {
      const loser = fight.participants.find(p => p.id === senderID);
      const winner = fight.participants.find(p => p.id !== senderID);
      
      await this.handleFightEnd(message, usersData, fight, winner, loser, true);
      return endFight(threadID);
    }

    const moves = {
      kick: { min: 10, max: 20, emoji: "🦵" },
      punch: { min: 5, max: 15, emoji: "👊" },
      slap: { min: 1, max: 5, emoji: "✋" },
      headbutt: { min: 15, max: 25, emoji: "🗿" },
      elbow: { min: 8, max: 18, emoji: "💪" },
      uppercut: { min: 12, max: 22, emoji: "🥊" },
      backslash: { min: 20, max: 35, emoji: "⚡" }
    };

    if (moves[attack]) {
      let damage = Math.floor(Math.random() * (moves[attack].max - moves[attack].min + 1)) + moves[attack].min;
      const isCritical = Math.random() < 0.15;
      const isDodge = Math.random() < 0.10;

      const attacker = fight.participants.find(p => p.id === senderID);
      const defender = fight.participants.find(p => p.id !== senderID);

      if (isDodge) {
        message.send(
          `💨 𝗗𝗢𝗗𝗚𝗘𝗗!\n━━━━━━━━━━━━━━━━━━━━━━\n` +
          `${moves[attack].emoji} ${attacker.name} 𝘶𝘴𝘦𝘥 ${attack}\n` +
          `🌪️ ${defender.name} 𝘦𝘷𝘢𝘥𝘦𝘥 𝘵𝘩𝘦 𝘢𝘵𝘵𝘢𝘤𝘬!\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `💚 ${attacker.name}: ${attacker.hp} HP\n` +
          `💚 ${defender.name}: ${defender.hp} HP`
        );
      } else {
        if (isCritical) damage = Math.floor(damage * 1.5);
        defender.hp -= damage;

        let msg = isCritical
          ? `💥 𝗖𝗥𝗜𝗧𝗜𝗖𝗔𝗟 𝗛𝗜𝗧!\n━━━━━━━━━━━━━━━━━━━━━━\n`
          : `⚔️ 𝗔𝗧𝗧𝗔𝗖𝗞!\n━━━━━━━━━━━━━━━━━━━━━━\n`;

        msg += `${moves[attack].emoji} ${attacker.name} 𝘶𝘴𝘦𝘥 ${attack}\n`;
        msg += `🩸 ${defender.name} 𝘵𝘰𝘰𝘬 ${damage} 𝘥𝘢𝘮𝘢𝘨𝘦\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `💚 ${attacker.name}: ${attacker.hp} HP\n`;
        msg += defender.hp > 0
          ? `💛 ${defender.name}: ${Math.max(0, defender.hp)} HP`
          : `💀 ${defender.name}: 𝘒.𝘖.`;

        message.send(msg);

        if (defender.hp <= 0) {
          setTimeout(async () => {
            await this.handleFightEnd(message, usersData, fight, attacker, defender, false);
            endFight(threadID);
          }, 1000);
          return;
        }
      }

      fight.currentPlayer = defender.id;
      gameInstance.turnMessageSent = false;
      resetTimeout(threadID, message);
    }
  },

  startFight: async function(message, usersData, fightData) {
    const { challengerID, challengerName, opponentID, opponentName, threadID, mode, challengerBet, opponentBet } = fightData;

    const fight = {
      participants: [
        { id: challengerID, name: challengerName, hp: 100 },
        { id: opponentID, name: opponentName, hp: 100 }
      ],
      currentPlayer: Math.random() < 0.5 ? challengerID : opponentID,
      threadID: threadID,
      mode: mode,
      challengerBet: challengerBet || 0,
      opponentBet: opponentBet || 0
    };

    const gameInstance = {
      fight: fight,
      timeoutID: null,
      turnMessageSent: false,
    };

    gameInstances.set(threadID, gameInstance);
    ongoingFights.set(threadID, fight);

    const attackList = ["𝘬𝘪𝘤𝘬", "𝘱𝘶𝘯𝘤𝘩", "𝘴𝘭𝘢𝘱", "𝘩𝘦𝘢𝘥𝘣𝘶𝘵𝘵", "𝘦𝘭𝘣𝘰𝘸", "𝘶𝘱𝘱𝘦𝘳𝘤𝘶𝘵", "𝘣𝘢𝘤𝘬𝘴𝘭𝘢𝘴𝘩"];

    let modeText = mode === 'bet'
      ? `💰 𝗕𝗘𝗧 𝗠𝗔𝗧𝗖𝗛\n${challengerName}: $${challengerBet.toLocaleString()}\n${opponentName}: $${opponentBet.toLocaleString()}\n🏆 𝘗𝘳𝘪𝘻𝘦 𝘗𝘰𝘰𝘭: $${(challengerBet + opponentBet).toLocaleString()}`
      : `🤝 𝗙𝗥𝗜𝗘𝗡𝗗𝗟𝗬 𝗠𝗔𝗧𝗖𝗛\n🏆 𝘗𝘳𝘪𝘻𝘦: $50,000,000`;

    message.send(
      `🤺 𝗧𝗛𝗘 𝗗𝗨𝗘𝗟 𝗕𝗘𝗚𝗜𝗡𝗦!\n━━━━━━━━━━━━━━━━━━━━━━\n` +
      `${modeText}\n━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 ${challengerName} 𝘷𝘴 ${opponentName}\n` +
      `⚔️ 𝗙𝗶𝗿𝘀𝘁 𝗧𝘂𝗿𝗻: ${fight.currentPlayer === challengerID ? challengerName : opponentName}\n\n` +
      `💡 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗠𝗼𝘃𝗲𝘀:\n${attackList.join(", ")}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `⏱️ 𝘛𝘪𝘮𝘦 𝘓𝘪𝘮𝘪𝘵: ${TIMEOUT_SECONDS}s | Type "forfeit" to surrender`
    );

    // Deduct bets if bet mode
    if (mode === 'bet') {
      await usersData.set(challengerID, { money: (await usersData.get(challengerID)).money - challengerBet });
      await usersData.set(opponentID, { money: (await usersData.get(opponentID)).money - opponentBet });
    }

    startTimeout(threadID, message);
    
    // Clear pending challenge
    for (const [key, value] of pendingChallenges.entries()) {
      if (value.threadID === threadID && 
          (value.challengerID === challengerID || value.opponentID === opponentID)) {
        pendingChallenges.delete(key);
      }
    }
  },

  handleFightEnd: async function(message, usersData, fight, winner, loser, forfeited) {
    const { mode, challengerBet, opponentBet } = fight;

    // Update stats
    const winnerData = await usersData.get(winner.id);
    const loserData = await usersData.get(loser.id);

    const newWinnerWins = (winnerData.data.fightWins || 0) + 1;
    const newLoserLosses = (loserData.data.fightLosses || 0) + 1;

    let winnings = 0;
    let finalMsg = "";

    if (mode === 'bet') {
      winnings = challengerBet + opponentBet;
      await usersData.set(winner.id, {
        money: winnerData.money + winnings,
        data: { ...winnerData.data, fightWins: newWinnerWins }
      });

      finalMsg = `🏆 𝗩𝗜𝗖𝗧𝗢𝗥𝗬!\n━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👑 ${winner.name} ${forfeited ? '𝘸𝘪𝘯𝘴 𝘣𝘺 𝘧𝘰𝘳𝘧𝘦𝘪𝘵' : '𝘩𝘢𝘴 𝘥𝘦𝘧𝘦𝘢𝘵𝘦𝘥'} ${loser.name}!\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 𝗪𝗶𝗻𝗻𝗶𝗻𝗴𝘀: $${winnings.toLocaleString()}\n` +
        `🏅 𝗧𝗼𝘁𝗮𝗹 𝗩𝗶𝗰𝘁𝗼𝗿𝗶𝗲𝘀: ${newWinnerWins}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎉 𝘎𝘎 𝘞𝘗!`;
    } else {
      winnings = 50000000;
      await usersData.set(winner.id, {
        money: winnerData.money + winnings,
        data: { ...winnerData.data, fightWins: newWinnerWins }
      });

      finalMsg = `🏆 𝗩𝗜𝗖𝗧𝗢𝗥𝗬!\n━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👑 ${winner.name} ${forfeited ? '𝘸𝘪𝘯𝘴 𝘣𝘺 𝘧𝘰𝘳𝘧𝘦𝘪𝘵' : '𝘩𝘢𝘴 𝘥𝘦𝘧𝘦𝘢𝘵𝘦𝘥'} ${loser.name}!\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎁 𝗣𝗿𝗶𝘇𝗲: $${winnings.toLocaleString()}\n` +
        `🏅 𝗧𝗼𝘁𝗮𝗹 𝗩𝗶𝗰𝘁𝗼𝗿𝗶𝗲𝘀: ${newWinnerWins}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎉 𝘎𝘎 𝘞𝘗!`;
    }

    await usersData.set(loser.id, {
      data: { ...loserData.data, fightLosses: newLoserLosses }
    });

    message.send(finalMsg);
  }
};

function startTimeout(threadID, message) {
  const timeoutID = setTimeout(() => {
    if (gameInstances.has(threadID)) {
      const fight = gameInstances.get(threadID).fight;
      message.send(
        `⏰ 𝗧𝗜𝗠𝗘𝗢𝗨𝗧!\n━━━━━━━━━━━━━━━━━━━━━━\n` +
        `𝘛𝘩𝘦 𝘧𝘪𝘨𝘩𝘵 𝘩𝘢𝘴 𝘣𝘦𝘦𝘯 𝘤𝘢𝘯𝘤𝘦𝘭𝘭𝘦𝘥.\n` +
        `${fight.mode === 'bet' ? '💰 𝘉𝘦𝘵𝘴 𝘩𝘢𝘷𝘦 𝘣𝘦𝘦𝘯 𝘳𝘦𝘧𝘶𝘯𝘥𝘦𝘥.' : ''}`
      );
      
      // Refund bets if timeout
      if (fight.mode === 'bet') {
        const usersData = global.GoatBot.usersData;
        usersData.get(fight.participants[0].id).then(data => {
          usersData.set(fight.participants[0].id, { money: data.money + fight.challengerBet });
        });
        usersData.get(fight.participants[1].id).then(data => {
          usersData.set(fight.participants[1].id, { money: data.money + fight.opponentBet });
        });
      }
      
      endFight(threadID);
    }
  }, TIMEOUT_SECONDS * 1000);
  gameInstances.get(threadID).timeoutID = timeoutID;
}

function resetTimeout(threadID, message) {
  const instance = gameInstances.get(threadID);
  if (instance?.timeoutID) {
    clearTimeout(instance.timeoutID);
    startTimeout(threadID, message);
  }
}

function endFight(threadID) {
  const instance = gameInstances.get(threadID);
  if (instance?.timeoutID) clearTimeout(instance.timeoutID);
  ongoingFights.delete(threadID);
  gameInstances.delete(threadID);
}
