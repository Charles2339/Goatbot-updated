module.exports = {
  config: {
    name: "eat",
    aliases: ["consume"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 3,
    role: 0,
    description: {
      en: "Eat food items from your inventory"
    },
    category: "economy",
    guide: {
      en: "{pn} <item> - Eat a food item\nExample: {pn} donut\n{pn} croissant"
    }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;

    if (args.length === 0) {
      return message.reply("❌ Please specify what you want to eat.\nExample: +eat donut");
    }

    const itemName = args.join(" ").toLowerCase();

    try {
      const userData = await usersData.get(senderID);
      const inventory = userData.data?.inventory || {};

      // Categories that contain food
      const foodCategories = ['bakery', 'snacks'];
      let foundItem = null;
      let foundCategory = null;
      let foundKey = null;

      // Search for item in food categories
      for (const category of foodCategories) {
        if (inventory[category]) {
          for (const [key, item] of Object.entries(inventory[category])) {
            if (key === itemName || item.name.toLowerCase() === itemName) {
              if (item.quantity > 0) {
                foundItem = item;
                foundCategory = category;
                foundKey = key;
                break;
              }
            }
          }
        }
        if (foundItem) break;
      }

      if (!foundItem) {
        return message.reply(
          `❌ You don't have any "${itemName}" to eat!\n\n` +
          `Check your inventory: +inventory\n` +
          `Buy from shop: +shop bakery or +shop snacks`
        );
      }

      // Consume the item
      inventory[foundCategory][foundKey].quantity -= 1;

      // Random eating messages
      const eatMessages = [
        "Mmm, delicious! 😋",
        "That hit the spot! 🤤",
        "Yummy! 😊",
        "So tasty! 😍",
        "Nom nom nom! 🍴",
        "That was amazing! ✨",
        "Satisfied! 😌",
        "Absolutely scrumptious! 🎉"
      ];

      const randomMessage = eatMessages[Math.floor(Math.random() * eatMessages.length)];

      // Save updated inventory
      await usersData.set(senderID, {
        money: userData.money,
        exp: userData.exp,
        data: userData.data
      });

      return message.reply(
        `${foundItem.emoji} 𝗘𝗔𝗧𝗜𝗡𝗚 ${foundItem.name.toUpperCase()}...\n\n` +
        `${randomMessage}\n\n` +
        `📦 Remaining: ${inventory[foundCategory][foundKey].quantity}`
      );

    } catch (error) {
      console.error("Eat command error:", error);
      return message.reply("❌ An error occurred while eating.");
    }
  }
};
