// ═══════════════════════════════════════════════════════════════
//   battlestats.js  —  View your full fighter profile
// ═══════════════════════════════════════════════════════════════

const TRAITS = {
  ironhide:   { label: "🧬 𝗜𝗿𝗼𝗻 𝗛𝗶𝗱𝗲",     desc: "-18% incoming dmg" },
  shadowstep: { label: "🧬 𝗦𝗵𝗮𝗱𝗼𝘄 𝗦𝘁𝗲𝗽",   desc: "+20% dodge chance" },
  berserker:  { label: "🧬 𝗕𝗲𝗿𝘀𝗲𝗿𝗸𝗲𝗿",     desc: "+12 flat atk dmg" },
  cursed:     { label: "🧬 𝗖𝘂𝗿𝘀𝗲𝗱 𝗙𝗶𝘀𝘁",   desc: "-10% opp def per hit" },
  phoenix:    { label: "🧬 𝗣𝗵𝗼𝗲𝗻𝗶𝘅 𝗕𝗹𝗼𝗼𝗱", desc: "Survive lethal blow (1HP, 1×/fight)" },
};

const SPECIAL_SKILL_LABELS = {
  deathblow: "💀 𝗗𝗲𝗮𝘁𝗵𝗯𝗹𝗼𝘄",
  sonicfist: "🌪️ 𝗦𝗼𝗻𝗶𝗰𝗙𝗶𝘀𝘁",
  shockwave: "⚡ 𝗦𝗵𝗼𝗰𝗸𝘄𝗮𝘃𝗲",
  blazekick: "🔥 𝗕𝗹𝗮𝘇𝗲𝗞𝗶𝗰𝗸",
};

function xpForLevel(lvl) { return lvl * 100; }

function getLevelAndXP(totalXP) {
  let lvl = 1, xp = totalXP || 0;
  while (xp >= xpForLevel(lvl)) { xp -= xpForLevel(lvl); lvl++; if (lvl >= 100) break; }
  return { level: lvl, currentXP: xp, xpNeeded: xpForLevel(lvl) };
}

function progressBar(current, max, length = 10) {
  const filled = Math.round((current / max) * length);
  return "█".repeat(Math.min(filled, length)) + "░".repeat(Math.max(0, length - filled));
}

// ═══════════════════════════════════════════════════════════════
module.exports = {
  config: {
    name: "battlestats",
    aliases: ["bstats", "fstats", "fighterstats", "battleprofile"],
    version: "1.0",
    author: "Charles MK",
    countDown: 5,
    role: 0,
    shortDescription: { en: "📊 View your full fighter profile & stats" },
    category: "fun",
    guide: {
      en:
        "+battlestats           — Your own stats\n" +
        "+battlestats @mention  — Another user's stats",
    },
  },

  onStart: async function ({ event, message, usersData, args }) {
    let targetID = event.senderID;

    // Allow viewing another user's stats
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    const userData = await usersData.get(targetID);
    const name     = await usersData.getName(targetID);
    const d        = userData.data || {};

    const { level, currentXP, xpNeeded } = getLevelAndXP(d.fightXP || 0);

    const wins   = d.fightWins   || 0;
    const losses = d.fightLosses || 0;
    const total  = wins + losses;
    const wr     = total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0";

    const atkBonus     = d.fightAtkBonus     || 0;
    const defBonus     = d.fightDefBonus     || 0;
    const agilityBonus = d.fightAgilityBonus || 0;
    const bonusHP      = d.fightBonusHP      || 0;
    const maxHP        = 100 + bonusHP;
    const abilities    = d.fightAbilities    || {};

    // Rank based on level + wins
    const rankScore = level * 10 + wins;
    let rank;
    if (rankScore >= 500)     rank = "💎 𝗟𝗲𝗴𝗲𝗻𝗱𝗮𝗿𝘆";
    else if (rankScore >= 300) rank = "🏆 𝗚𝗿𝗮𝗻𝗱𝗺𝗮𝘀𝘁𝗲𝗿";
    else if (rankScore >= 150) rank = "🥇 𝗠𝗮𝘀𝘁𝗲𝗿";
    else if (rankScore >= 70)  rank = "🥈 𝗘𝘅𝗽𝗲𝗿𝘁";
    else if (rankScore >= 30)  rank = "🥉 𝗩𝗲𝘁𝗲𝗿𝗮𝗻";
    else if (rankScore >= 10)  rank = "🔰 𝗖𝗼𝗺𝗽𝗲𝘁𝗶𝘁𝗼𝗿";
    else                        rank = "🥋 𝗡𝗼𝘃𝗶𝗰𝗲";

    const xpBar = progressBar(currentXP, xpNeeded);

    // ── Build skills section ────────────────────────────────
    const skills   = d.fightSkills || {};
    const specials = Object.keys(SPECIAL_SKILL_LABELS).filter(s => skills[s] >= 1);

    // Move skill levels
    const trainedMoves = Object.entries(skills)
      .filter(([k]) => !SPECIAL_SKILL_LABELS[k] && skills[k] > 0)
      .sort((a, b) => b[1] - a[1]);

    // ── Trait ──────────────────────────────────────────────
    const traitKey  = d.fightTrait;
    const traitInfo = TRAITS[traitKey];

    // ── Training cooldown ──────────────────────────────────
    const trainedAt = d.fightTrainedAt || 0;
    const cooldownMs = 5 * 60 * 60 * 1000;
    const sinceTraining = Date.now() - trainedAt;
    const canTrain = sinceTraining >= cooldownMs;
    const remainMs = cooldownMs - sinceTraining;
    const h = Math.floor(remainMs / 3600000);
    const m = Math.floor((remainMs % 3600000) / 60000);
    const trainStatus = canTrain ? "✅ 𝗥𝗲𝗮𝗱𝘆!" : `⏳ ${h}h ${m}m`;

    // ── Compose output ──────────────────────────────────────
    let msg =
      `⚔️ 𝗕𝗔𝗧𝗧𝗟𝗘 𝗣𝗥𝗢𝗙𝗜𝗟𝗘\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 𝗡𝗮𝗺𝗲:  ${name}\n` +
      `🏅 𝗥𝗮𝗻𝗸:  ${rank}\n` +
      `⭐ 𝗟𝗲𝘃𝗲𝗹: ${level}\n` +
      `📊 𝗫𝗣:   [${xpBar}] ${currentXP}/${xpNeeded}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🏆 𝗪𝗶𝗻𝘀:   ${wins}\n` +
      `💀 𝗟𝗼𝘀𝘀𝗲𝘀: ${losses}\n` +
      `📈 𝗪𝗶𝗻 𝗥𝗮𝘁𝗲: ${wr}%\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `❤️ 𝗠𝗮𝘅 𝗛𝗣:          ${maxHP}${bonusHP > 0 ? ` (+${bonusHP} 𝘂𝘱𝗴𝗿𝗮𝗱𝗲𝗱)` : ""}\n` +
      `💥 𝗔𝘁𝘁𝗮𝗰𝗸 𝗕𝗼𝗻𝘂𝘀:    +${atkBonus} 𝗱𝗺𝗴\n` +
      `🛡️ 𝗗𝗲𝗳𝗲𝗻𝘀𝗲 𝗕𝗼𝗻𝘂𝘀:  ${defBonus}% 𝗿𝗲𝗱𝘂𝗰𝘁𝗶𝗼𝗻\n` +
      `💨 𝗔𝗴𝗶𝗹𝗶𝘁𝘆 𝗕𝗼𝗻𝘂𝘀:  +${agilityBonus}% 𝗱𝗼𝗱𝗴𝗲\n` +
      `💚 𝗛𝗲𝗮𝗹 𝗔𝗯𝗶𝗹𝗶𝘁𝘆:   ${abilities.heal ? "✅ 𝗨𝗻𝗹𝗼𝗰𝗸𝗲𝗱" : "🔒 𝗟𝗼𝗰𝗸𝗲𝗱"}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n`;

    // Trait
    msg += traitInfo
      ? `${traitInfo.label}\n   𝘌𝘧𝘧𝘦𝘤𝘵: ${traitInfo.desc}\n`
      : `🧬 𝗧𝗿𝗮𝗶𝘁: 𝘕𝘰𝘯𝘦 (𝘶𝘴𝘦 +𝘧𝘪𝘨𝘩𝘵𝘶𝘱𝘨𝘳𝘢𝘥𝘦)\n`;

    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;

    // Special attacks
    if (specials.length > 0) {
      msg += `🔓 𝗦𝗽𝗲𝗰𝗶𝗮𝗹 𝗔𝘁𝘁𝗮𝗰𝗸𝘀:\n`;
      specials.forEach(s => {
        msg += `   ${SPECIAL_SKILL_LABELS[s]}\n`;
      });
    } else {
      msg += `🔒 𝗦𝗽𝗲𝗰𝗶𝗮𝗹 𝗔𝘁𝘁𝗮𝗰𝗸𝘀: 𝘕𝘰𝘯𝘦 𝘶𝘯𝘭𝘰𝘤𝘬𝘦𝘥\n`;
    }

    // Trained moves
    if (trainedMoves.length > 0) {
      msg += `\n💪 𝗧𝗿𝗮𝗶𝗻𝗲𝗱 𝗠𝗼𝘃𝗲𝘀:\n`;
      trainedMoves.slice(0, 8).forEach(([move, lvl]) => {
        msg += `   ${move}: 𝗟𝘃.${lvl} (+${lvl * 3} 𝗱𝗺𝗴 𝗯𝗼𝗻𝘂𝘀)\n`;
      });
    }

    msg +=
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🏋️ 𝗧𝗿𝗮𝗶𝗻 𝗦𝘁𝗮𝘁𝘂𝘀: ${trainStatus}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━`;

    return message.send(msg);
  },
};
