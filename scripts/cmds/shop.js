module.exports = {
  config: {
    name: "shop",
    aliases: ["tuckshop", "store", "buy"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 3,
    role: 0,
    description: {
      en: "Browse and buy items from MK-TUCKSHOP"
    },
    category: "economy",
    guide: {
      en: "{pn} - View all categories\n{pn} <category> - View items in category\n{pn} buy <item name> - Purchase an item\n\nCategories: bakery, drinks, snacks, alcohol, tech, clothing"
    }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;

    // Shop inventory with categories
    const shopItems = {
      bakery: {
        name: "🥐 BAKERY",
        items: {
          "croissant": { name: "Croissant", price: 25, emoji: "🥐" },
          "donut": { name: "Donut", price: 15, emoji: "🍩" },
          "bread": { name: "Bread Loaf", price: 30, emoji: "🍞" },
          "cake": { name: "Cake Slice", price: 45, emoji: "🍰" },
          "cupcake": { name: "Cupcake", price: 20, emoji: "🧁" },
          "pretzel": { name: "Pretzel", price: 18, emoji: "🥨" },
          "bagel": { name: "Bagel", price: 22, emoji: "🥯" },
          "pie": { name: "Pie Slice", price: 40, emoji: "🥧" }
        }
      },
      drinks: {
        name: "🥤 DRINKS",
        items: {
          "water": { name: "Bottled Water", price: 10, emoji: "💧" },
          "soda": { name: "Soda", price: 20, emoji: "🥤" },
          "juice": { name: "Fruit Juice", price: 25, emoji: "🧃" },
          "coffee": { name: "Coffee", price: 35, emoji: "☕" },
          "tea": { name: "Tea", price: 30, emoji: "🍵" },
          "milkshake": { name: "Milkshake", price: 50, emoji: "🥛" },
          "smoothie": { name: "Smoothie", price: 55, emoji: "🍹" },
          "energy": { name: "Energy Drink", price: 45, emoji: "⚡" }
        }
      },
      snacks: {
        name: "🍿 SNACKS",
        items: {
          "chips": { name: "Chips", price: 15, emoji: "🍟" },
          "popcorn": { name: "Popcorn", price: 20, emoji: "🍿" },
          "candy": { name: "Candy", price: 12, emoji: "🍬" },
          "chocolate": { name: "Chocolate Bar", price: 25, emoji: "🍫" },
          "cookie": { name: "Cookie", price: 18, emoji: "🍪" },
          "icecream": { name: "Ice Cream", price: 40, emoji: "🍦" },
          "pizza": { name: "Pizza Slice", price: 60, emoji: "🍕" },
          "burger": { name: "Burger", price: 75, emoji: "🍔" }
        }
      },
      alcohol: {
        name: "🍺 ALCOHOL (21+)",
        items: {
          "beer": { name: "Beer", price: 50, emoji: "🍺" },
          "wine": { name: "Wine Bottle", price: 120, emoji: "🍷" },
          "champagne": { name: "Champagne", price: 200, emoji: "🍾" },
          "whiskey": { name: "Whiskey", price: 150, emoji: "🥃" },
          "vodka": { name: "Vodka", price: 140, emoji: "🍸" },
          "cocktail": { name: "Cocktail", price: 80, emoji: "🍹" },
          "sake": { name: "Sake", price: 100, emoji: "🍶" },
          "tequila": { name: "Tequila Shot", price: 60, emoji: "🥂" }
        }
      },
      tech: {
        name: "📱 TECH",
        items: {
          "phone": { name: "Smartphone", price: 5000, emoji: "📱" },
          "laptop": { name: "Laptop", price: 15000, emoji: "💻" },
          "headphones": { name: "Headphones", price: 800, emoji: "🎧" },
          "watch": { name: "Smart Watch", price: 2500, emoji: "⌚" },
          "tablet": { name: "Tablet", price: 3500, emoji: "📱" },
          "camera": { name: "Camera", price: 8000, emoji: "📷" },
          "keyboard": { name: "Gaming Keyboard", price: 1200, emoji: "⌨️" },
          "mouse": { name: "Gaming Mouse", price: 600, emoji: "🖱️" }
        }
      },
      clothing: {
        name: "👕 CLOTHING",
        items: {
          "tshirt": { name: "T-Shirt", price: 150, emoji: "👕" },
          "jeans": { name: "Jeans", price: 300, emoji: "👖" },
          "dress": { name: "Dress", price: 400, emoji: "👗" },
          "shoes": { name: "Sneakers", price: 500, emoji: "👟" },
          "jacket": { name: "Jacket", price: 600, emoji: "🧥" },
          "hat": { name: "Hat", price: 100, emoji: "🧢" },
          "sunglasses": { name: "Sunglasses", price: 200, emoji: "🕶️" },
          "backpack": { name: "Backpack", price: 350, emoji: "🎒" }
        }
      }
    };

    // No arguments - show all categories
    if (args.length === 0) {
      let response = "🏪 𝗠𝗞-𝗧𝗨𝗖𝗞𝗦𝗛𝗢𝗣\n";
      response += "━━━━━━━━━━━━━━━━━━━━\n\n";
      response += "Welcome! Browse our categories:\n\n";
      
      for (const [key, category] of Object.entries(shopItems)) {
        response += `${category.name}\n`;
        response += `   +shop ${key}\n\n`;
      }
      
      response += "━━━━━━━━━━━━━━━━━━━━\n";
      response += "💰 Your Balance: $" + ((await usersData.get(senderID)).money || 0).toLocaleString();
      
      return message.reply(response);
    }

    // Buy command
    if (args[0].toLowerCase() === "buy") {
      if (args.length < 2) {
        return message.reply("❌ Please specify an item to buy.\nExample: +shop buy croissant");
      }

      const itemName = args.slice(1).join(" ").toLowerCase();
      let foundItem = null;
      let foundCategory = null;

      // Search for item across all categories
      for (const [catKey, category] of Object.entries(shopItems)) {
        for (const [key, item] of Object.entries(category.items)) {
          if (key === itemName || item.name.toLowerCase() === itemName) {
            foundItem = item;
            foundCategory = catKey;
            break;
          }
        }
        if (foundItem) break;
      }

      if (!foundItem) {
        return message.reply(`❌ Item "${itemName}" not found in the shop.\nUse +shop to browse categories.`);
      }

      // Check user balance
      const userData = await usersData.get(senderID);
      const balance = userData.money || 0;

      if (balance < foundItem.price) {
        return message.reply(
          `❌ Insufficient funds!\n\n` +
          `${foundItem.emoji} ${foundItem.name}: $${foundItem.price}\n` +
          `💰 Your balance: $${balance.toLocaleString()}\n` +
          `📉 Need: $${(foundItem.price - balance).toLocaleString()} more`
        );
      }

      // Process purchase
      const newBalance = balance - foundItem.price;
      
      // Initialize inventory if it doesn't exist
      if (!userData.data) userData.data = {};
      if (!userData.data.inventory) userData.data.inventory = {};
      if (!userData.data.inventory[foundCategory]) {
        userData.data.inventory[foundCategory] = {};
      }

      // Add item to inventory
      if (!userData.data.inventory[foundCategory][itemName]) {
        userData.data.inventory[foundCategory][itemName] = {
          name: foundItem.name,
          emoji: foundItem.emoji,
          quantity: 0
        };
      }
      userData.data.inventory[foundCategory][itemName].quantity += 1;

      // Update user data
      await usersData.set(senderID, {
        money: newBalance,
        exp: userData.exp,
        data: userData.data
      });

      return message.reply(
        `✅ 𝗣𝗨𝗥𝗖𝗛𝗔𝗦𝗘 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟!\n\n` +
        `${foundItem.emoji} ${foundItem.name}\n` +
        `💵 Price: $${foundItem.price.toLocaleString()}\n\n` +
        `💰 New Balance: $${newBalance.toLocaleString()}\n` +
        `📦 Total owned: ${userData.data.inventory[foundCategory][itemName].quantity}`
      );
    }

    // Show specific category
    const category = args[0].toLowerCase();
    
    if (!shopItems[category]) {
      return message.reply(
        `❌ Category "${category}" not found.\n\n` +
        `Available categories:\n` +
        `bakery, drinks, snacks, alcohol, tech, clothing\n\n` +
        `Use +shop to view all categories.`
      );
    }

    // Display category items
    let response = `${shopItems[category].name}\n`;
    response += "━━━━━━━━━━━━━━━━━━━━\n\n";

    for (const [key, item] of Object.entries(shopItems[category].items)) {
      response += `${item.emoji} ${item.name}\n`;
      response += `   💵 $${item.price.toLocaleString()}\n`;
      response += `   +shop buy ${key}\n\n`;
    }

    response += "━━━━━━━━━━━━━━━━━━━━\n";
    response += "💰 Your Balance: $" + ((await usersData.get(senderID)).money || 0).toLocaleString();

    return message.reply(response);
  }
};
