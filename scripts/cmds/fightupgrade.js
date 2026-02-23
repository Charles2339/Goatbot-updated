// ═══════════════════════════════════════════════════════════════
//   fight_upgrade.js  —  Shop for skills, traits & upgrades
// ═══════════════════════════════════════════════════════════════

// ─── SHOP CATALOG ──────────────────────────────────────────────
const SHOP = {
  // ── Traits (inborn / always-active after purchase) ──────────
  traits: {
    ironhide:   {
      label: "𝗜𝗿𝗼𝗻 𝗛𝗶𝗱𝗲",     cost: 10_000_000_000,
      desc:  "Permanently reduces all incoming damage by 18%.",
      type: "trait",
    },
    shadowstep: {
      label: "𝗦𝗵𝗮𝗱𝗼𝘄 𝗦𝘁𝗲𝗽",   cost: 25_000_000_000,
      desc:  "Permanently adds +20% base dodge chance.",
      type: "trait",
    },
    berserker:  {
      label: "𝗕𝗲𝗿𝘀𝗲𝗿𝗸𝗲𝗿",     cost: 50_000_000_000,
      desc:  "Permanently adds +12 flat damage to every attack.",
      type: "trait",
    },
    cursed:     {
      label: "𝗖𝘂𝗿𝘀𝗲𝗱 𝗙𝗶𝘀𝘁",   cost: 75_000_000_000,
      desc:  "Every attack applies a stacking curse that reduces opponent defense by 10%.",
      type: "trait",
    },
    phoenix:    {
      label: "𝗣𝗵𝗼𝗲𝗻𝗶𝘅 𝗕𝗹𝗼𝗼𝗱", cost: 90_000_000_000_000_000_000,
      desc:  "Once per fight, survive a lethal blow with 1 HP. (Rarest trait!)",
      type: "trait",
    },
  },

  // ── Special Attack Unlocks ────────────────────────────────
  specialAttacks: {
    deathblow: {
      label: "𝗗𝗲𝗮𝘁𝗵𝗯𝗹𝗼𝘄", cost: 15_000_000_000,
      desc:  "Unlock the Deathblow attack (35–55 dmg).",
      type: "skill",
    },
    sonicfist: {
      label: "𝗦𝗼𝗻𝗶𝗰𝗙𝗶𝘀𝘁",  cost: 20_000_000_000,
      desc:  "Unlock the SonicFist attack (30–50 dmg).",
      type: "skill",
    },
    shockwave: {
      label: "𝗦𝗵𝗼𝗰𝗸𝘄𝗮𝘃𝗲",  cost: 18_000_000_000,
      desc:  "Unlock the Shockwave attack (28–45 dmg).",
      type: "skill",
    },
    blazekick: {
      label: "𝗕𝗹𝗮𝘇𝗲𝗞𝗶𝗰𝗸",  cost: 22_000_000_000,
      desc:  "Unlock the BlazeKick attack (32–52 dmg).",
      type: "skill",
    },
  },

  // ── Passive Upgrades (stackable per level) ──────────────────
  passives: {
    atkup: {
      label: "𝗔𝘁𝘁𝗮𝗰𝗸 𝗕𝗼𝗼𝘀𝘁", cost: 5_000_000_000,
      desc:  "+5 flat damage per level (max 10 levels).",
      maxLevel: 10, type: "passive", stat: "fightAtkBonus", gain: 5,
    },
    defup: {
      label: "𝗗𝗲𝗳𝗲𝗻𝘀𝗲 𝗕𝗼𝗼𝘀𝘁", cost: 5_000_000_000,
      desc:  "+5% damage reduction per level (max 10 levels, cap 50%).",
      maxLevel: 10, type: "passive", stat: "fightDefBonus", gain: 5,
    },
    agilityup: {
      label: "𝗔𝗴𝗶𝗹𝗶𝘁𝘆 𝗕𝗼𝗼𝘀𝘁", cost: 5_000_000_000,
      desc:  "+5% dodge chance per level (max 10 levels, cap 50%).",
      maxLevel: 10, type: "passive", stat: "fightAgilityBonus", gain: 5,
    },
    hpup: {
      label: "𝗛𝗲𝗮𝗹𝘁𝗵 𝗕𝗼𝗼𝘀𝘁", cost: 5_000_000,
      desc:  "+50 max HP per purchase (no level cap — stack as much as you want!).",
      maxLevel: Infinity, type: "hpup",
    },
  },

  // ── Unlockable In-Fight Abilities ────────────────────────
  abilities: {
    heal: {
      label: "𝗛𝗲𝗮𝗹", cost: 100_000_000,
      desc:  "Unlock the 'heal' in-fight action — restores 50% of your max HP once per fight.",
      type: "ability",
    },
  },
};

// ─── HELPERS ────────────────────────────────────────────────────
const ALL_ITEMS = {
  ...SHOP.traits,
  ...SHOP.specialAttacks,
  ...SHOP.passives,
  ...SHOP.abilities,
};

function fmt(n) { return `$${BigInt(Math.round(n)).toLocaleString()}`; }

// ═══════════════════════════════════════════════════════════════
module.exports = {
  config: {
    name: "fightupgrade",
    aliases: ["fightshop", "fightbuy"],
    version: "1.0",
    author: "Charles MK",
    countDown: 5,
    role: 0,
    shortDescription: { en: "⚔️ Purchase fight upgrades, traits & special moves" },
    category: "fun",
    guide: {
      en:
        "+fightupgrade           — View shop\n" +
        "+fightupgrade buy [id]  — Purchase an item\n" +
        "+fightupgrade info [id] — Details about an item",
    },
  },

  onStart: async function ({ event, message, usersData, args }) {
    const senderID = event.senderID;
    const sub = args[0]?.toLowerCase();

    // ── Info ───────────────────────────────────────────────
    if (sub === "info" && args[1]) {
      const id   = args[1].toLowerCase();
      const item = ALL_ITEMS[id];
      if (!item) return message.send("❌ 𝗜𝘁𝗲𝗺 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱. Use +fightupgrade to see the shop.");
      return message.send(
        `🔍 𝗜𝗧𝗘𝗠 𝗗𝗘𝗧𝗔𝗜𝗟𝗦\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📦 ${item.label}\n` +
        `💵 𝗖𝗼𝘀𝘁: ${fmt(item.cost)}\n` +
        `📋 ${item.desc}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `𝘜𝘴𝘦: +fightupgrade buy ${id}`
      );
    }

    // ── Buy ────────────────────────────────────────────────
    if (sub === "buy" && args[1]) {
      const id   = args[1].toLowerCase();
      const item = ALL_ITEMS[id];
      if (!item) return message.send("❌ 𝗜𝘁𝗲𝗺 𝗻𝗼𝘁 𝗳𝗼𝘂𝗻𝗱.");

      const userData = await usersData.get(senderID);
      const data     = userData.data || {};

      // ── Trait check ──────────────────────────────────────
      if (item.type === "trait") {
        if (data.fightTrait)
          return message.send(
            `❌ 𝗬𝗼𝘂 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗵𝗮𝘃𝗲 𝗮 𝘁𝗿𝗮𝗶𝘁: ${SHOP.traits[data.fightTrait]?.label || data.fightTrait}\n` +
            `Traits cannot be replaced.`
          );
        if (userData.money < item.cost)
          return message.send(`❌ 𝗜𝗻𝘀𝘂𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝘁 𝗳𝘂𝗻𝗱𝘀!\n💵 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: ${fmt(userData.money)}\n💸 𝗡𝗲𝗲𝗱: ${fmt(item.cost)}`);

        await usersData.set(senderID, {
          money: userData.money - item.cost,
          data: { ...data, fightTrait: id },
        });
        return message.send(
          `✅ 𝗧𝗿𝗮𝗶𝘁 𝗨𝗻𝗹𝗼𝗰𝗸𝗲𝗱!\n━━━━━━━━━━━━━━━━━━━━━━\n` +
          `🧬 ${item.label} 𝗶𝘀 𝗻𝗼𝘄 𝗮𝗰𝘁𝗶𝘃𝗲!\n` +
          `📋 ${item.desc}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `💰 𝗥𝗲𝗺𝗮𝗶𝗻𝗶𝗻𝗴: ${fmt(userData.money - item.cost)}`
        );
      }

      // ── Skill check ──────────────────────────────────────
      if (item.type === "skill") {
        const skills = data.fightSkills || {};
        if (skills[id] >= 1)
          return message.send(`✅ 𝗬𝗼𝘂 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗼𝘄𝗻 ${item.label}.`);
        if (userData.money < item.cost)
          return message.send(`❌ 𝗜𝗻𝘀𝘂𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝘁 𝗳𝘂𝗻𝗱𝘀!\n💵 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: ${fmt(userData.money)}\n💸 𝗡𝗲𝗲𝗱: ${fmt(item.cost)}`);

        skills[id] = 1;
        await usersData.set(senderID, {
          money: userData.money - item.cost,
          data: { ...data, fightSkills: skills },
        });
        return message.send(
          `✅ 𝗦𝗸𝗶𝗹𝗹 𝗨𝗻𝗹𝗼𝗰𝗸𝗲𝗱!\n━━━━━━━━━━━━━━━━━━━━━━\n` +
          `⚔️ ${item.label} 𝗶𝘀 𝗻𝗼𝘄 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲!\n` +
          `📋 ${item.desc}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `💰 𝗥𝗲𝗺𝗮𝗶𝗻𝗶𝗻𝗴: ${fmt(userData.money - item.cost)}`
        );
      }

      // ── Passive check ────────────────────────────────────
      if (item.type === "passive") {
        const curLevel = data[`${item.stat}Level`] || 0;
        if (curLevel >= item.maxLevel)
          return message.send(`❌ ${item.label} 𝗶𝘀 𝗮𝘁 𝗺𝗮𝘅 𝗹𝗲𝘃𝗲𝗹 (${item.maxLevel}).`);

        const scaledCost = item.cost * (curLevel + 1);
        if (userData.money < scaledCost)
          return message.send(`❌ 𝗜𝗻𝘀𝘂𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝘁 𝗳𝘂𝗻𝗱𝘀!\n💵 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: ${fmt(userData.money)}\n💸 𝗡𝗲𝗲𝗱: ${fmt(scaledCost)} (𝗟𝘃.${curLevel + 1})`);

        const newLevel    = curLevel + 1;
        const newStatVal  = (data[item.stat] || 0) + item.gain;

        await usersData.set(senderID, {
          money: userData.money - scaledCost,
          data: {
            ...data,
            [item.stat]:              newStatVal,
            [`${item.stat}Level`]:    newLevel,
          },
        });
        return message.send(
          `✅ 𝗨𝗽𝗴𝗿𝗮𝗱𝗲𝗱!\n━━━━━━━━━━━━━━━━━━━━━━\n` +
          `📈 ${item.label} → 𝗟𝘃.${newLevel}\n` +
          `💪 +${item.gain} applied (𝗧𝗼𝘁𝗮𝗹: ${newStatVal})\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `💰 𝗥𝗲𝗺𝗮𝗶𝗻𝗶𝗻𝗴: ${fmt(userData.money - scaledCost)}\n` +
          (newLevel < item.maxLevel
            ? `🔼 𝗡𝗲𝘅𝘁 𝘂𝗽𝗴𝗿𝗮𝗱𝗲: ${fmt(item.cost * (newLevel + 1))}`
            : `🏆 𝗠𝗔𝗫 𝗟𝗘𝗩𝗘𝗟 𝗥𝗘𝗔𝗖𝗛𝗘𝗗!`)
        );
      }

      // ── HP Upgrade ───────────────────────────────────────
      if (item.type === "hpup") {
        if (userData.money < item.cost)
          return message.send(`❌ 𝗜𝗻𝘀𝘂𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝘁 𝗳𝘂𝗻𝗱𝘀!\n💵 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: ${fmt(userData.money)}\n💸 𝗡𝗲𝗲𝗱: ${fmt(item.cost)}`);

        const curHP    = data.fightBonusHP || 0;
        const newHP    = curHP + 50;
        const newMoney = userData.money - item.cost;

        await usersData.set(senderID, {
          money: newMoney,
          data: { ...data, fightBonusHP: newHP },
        });
        return message.send(
          `✅ 𝗛𝗲𝗮𝗹𝘁𝗵 𝗨𝗽𝗴𝗿𝗮𝗱𝗲𝗱!\n━━━━━━━━━━━━━━━━━━━━━━\n` +
          `❤️ 𝗠𝗮𝘅 𝗛𝗣: ${100 + curHP} → ${100 + newHP}\n` +
          `💪 +50 𝗛𝗣 𝗮𝗱𝗱𝗲𝗱 𝘁𝗼 𝘆𝗼𝘂𝗿 𝗳𝗶𝗴𝗵𝘁 𝗽𝗼𝗼𝗹!\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `💰 𝗥𝗲𝗺𝗮𝗶𝗻𝗶𝗻𝗴: ${fmt(newMoney)}\n` +
          `🔼 𝘉𝘶𝘺 𝘢𝘨𝘢𝘪𝘯 𝘧𝘰𝘳 𝘢𝘯𝘰𝘵𝘩𝘦𝘳 +50 𝘏𝘗!`
        );
      }

      // ── Ability unlock ───────────────────────────────────
      if (item.type === "ability") {
        const abilities = data.fightAbilities || {};
        if (abilities[id])
          return message.send(`✅ 𝗬𝗼𝘂 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗼𝘄𝗻 ${item.label}.`);
        if (userData.money < item.cost)
          return message.send(`❌ 𝗜𝗻𝘀𝘂𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝘁 𝗳𝘂𝗻𝗱𝘀!\n💵 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: ${fmt(userData.money)}\n💸 𝗡𝗲𝗲𝗱: ${fmt(item.cost)}`);

        abilities[id] = true;
        await usersData.set(senderID, {
          money: userData.money - item.cost,
          data: { ...data, fightAbilities: abilities },
        });
        return message.send(
          `✅ 𝗔𝗯𝗶𝗹𝗶𝘁𝘆 𝗨𝗻𝗹𝗼𝗰𝗸𝗲𝗱!\n━━━━━━━━━━━━━━━━━━━━━━\n` +
          `💚 ${item.label} 𝗶𝘀 𝗻𝗼𝘄 𝘂𝘀𝗮𝗯𝗹𝗲 𝗶𝗻 𝗳𝗶𝗴𝗵𝘁!\n` +
          `📋 ${item.desc}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `💰 𝗥𝗲𝗺𝗮𝗶𝗻𝗶𝗻𝗴: ${fmt(userData.money - item.cost)}`
        );
      }

      return message.send("❌ 𝗨𝗻𝗸𝗻𝗼𝘄𝗻 𝗶𝘁𝗲𝗺 𝘁𝘆𝗽𝗲.");
    }

    // ── Shop listing ───────────────────────────────────────
    let msg =
      `🛒 𝗙𝗜𝗚𝗛𝗧 𝗦𝗛𝗢𝗣\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `𝘜𝘴𝘦: +fightupgrade buy [id]\n\n`;

    msg += `🧬 𝗧𝗥𝗔𝗜𝗧𝗦 (𝗣𝗲𝗿𝗺𝗮𝗻𝗲𝗻𝘁, 𝗮𝗹𝘄𝗮𝘆𝘀 𝗮𝗰𝘁𝗶𝘃𝗲)\n`;
    for (const [id, item] of Object.entries(SHOP.traits)) {
      msg += `  [${id}] ${item.label} — ${fmt(item.cost)}\n`;
    }

    msg += `\n⚔️ 𝗦𝗣𝗘𝗖𝗜𝗔𝗟 𝗔𝗧𝗧𝗔𝗖𝗞𝗦 (𝗨𝗻𝗹𝗼𝗰𝗸𝗮𝗯𝗹𝗲 𝗺𝗼𝘃𝗲𝘀)\n`;
    for (const [id, item] of Object.entries(SHOP.specialAttacks)) {
      msg += `  [${id}] ${item.label} — ${fmt(item.cost)}\n`;
    }

    msg += `\n📈 𝗣𝗔𝗦𝗦𝗜𝗩𝗘 𝗨𝗣𝗚𝗥𝗔𝗗𝗘𝗦 (𝗣𝗲𝗿 𝗹𝗲𝘃𝗲𝗹, 𝗖𝗼𝘀𝘁 𝘀𝗰𝗮𝗹𝗲𝘀)\n`;
    for (const [id, item] of Object.entries(SHOP.passives)) {
      if (item.type === "hpup") {
        msg += `  [${id}] ${item.label} — ${fmt(item.cost)} per +50 HP (𝗻𝗼 𝗰𝗮𝗽)\n`;
      } else {
        msg += `  [${id}] ${item.label} — ${fmt(item.cost)}/𝗹𝘃𝗹 × 𝗹𝗲𝘃𝗲𝗹 (𝗺𝗮𝘅 ${item.maxLevel})\n`;
      }
    }

    msg += `\n💚 𝗜𝗡-𝗙𝗜𝗚𝗛𝗧 𝗔𝗕𝗜𝗟𝗜𝗧𝗜𝗘𝗦 (𝗨𝘀𝗲𝗮𝗯𝗹𝗲 𝗱𝘂𝗿𝗶𝗻𝗴 𝗯𝗮𝘁𝘁𝗹𝗲)\n`;
    for (const [id, item] of Object.entries(SHOP.abilities)) {
      msg += `  [${id}] ${item.label} — ${fmt(item.cost)}\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🔍 +fightupgrade info [id] 𝗳𝗼𝗿 𝗱𝗲𝘁𝗮𝗶𝗹𝘀`;
    return message.send(msg);
  },
};
