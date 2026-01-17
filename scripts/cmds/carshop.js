module.exports = {
  config: {
    name: "carshop",
    aliases: ["cars", "buycar", "vehicles"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 5,
    role: 0,
    description: {
      en: "Browse and buy cars from MK-CARS SHOP"
    },
    category: "economy",
    guide: {
      en: "{pn} - View all categories\n{pn} <category> - View cars in category\n{pn} buy <car name> - Purchase a car\n\nCategories: budget, economy, sport, luxury, supercar, hypercar, legendary"
    }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;

    // Car inventory with categories
    const carShop = {
      budget: {
        name: "🚙 BUDGET CARS",
        emoji: "🚙",
        items: {
          "toyotacorolla": { name: "Toyota Corolla", price: 25000, emoji: "🚗", speed: "⭐⭐" },
          "hondacivic": { name: "Honda Civic", price: 28000, emoji: "🚗", speed: "⭐⭐" },
          "fordfocus": { name: "Ford Focus", price: 22000, emoji: "🚗", speed: "⭐⭐" },
          "hyundaielantra": { name: "Hyundai Elantra", price: 24000, emoji: "🚗", speed: "⭐⭐" },
          "kiaforte": { name: "Kia Forte", price: 23000, emoji: "🚗", speed: "⭐⭐" },
          "nissansentra": { name: "Nissan Sentra", price: 26000, emoji: "🚗", speed: "⭐⭐" },
          "chevroletcruze": { name: "Chevrolet Cruze", price: 27000, emoji: "🚗", speed: "⭐⭐" },
          "mazdamx3": { name: "Mazda MX-3", price: 29000, emoji: "🚗", speed: "⭐⭐⭐" }
        }
      },
      economy: {
        name: "🚘 ECONOMY CARS",
        emoji: "🚘",
        items: {
          "toyotacamry": { name: "Toyota Camry", price: 45000, emoji: "🚘", speed: "⭐⭐⭐" },
          "hondaaccord": { name: "Honda Accord", price: 48000, emoji: "🚘", speed: "⭐⭐⭐" },
          "bmw3series": { name: "BMW 3 Series", price: 55000, emoji: "🚘", speed: "⭐⭐⭐" },
          "audida4": { name: "Audi A4", price: 52000, emoji: "🚘", speed: "⭐⭐⭐" },
          "mercedesbenzc": { name: "Mercedes-Benz C-Class", price: 58000, emoji: "🚘", speed: "⭐⭐⭐" },
          "lexuses": { name: "Lexus ES", price: 50000, emoji: "🚘", speed: "⭐⭐⭐" },
          "teslamodel3": { name: "Tesla Model 3", price: 60000, emoji: "⚡", speed: "⭐⭐⭐⭐" },
          "volkswagenpassat": { name: "Volkswagen Passat", price: 42000, emoji: "🚘", speed: "⭐⭐⭐" }
        }
      },
      sport: {
        name: "🏎️ SPORT CARS",
        emoji: "🏎️",
        items: {
          "fordmustang": { name: "Ford Mustang GT", price: 75000, emoji: "🏎️", speed: "⭐⭐⭐⭐" },
          "chevroletcamaro": { name: "Chevrolet Camaro SS", price: 72000, emoji: "🏎️", speed: "⭐⭐⭐⭐" },
          "dodgechallenger": { name: "Dodge Challenger SRT", price: 78000, emoji: "🏎️", speed: "⭐⭐⭐⭐" },
          "subaruwrx": { name: "Subaru WRX STI", price: 65000, emoji: "🏎️", speed: "⭐⭐⭐⭐" },
          "nissan370z": { name: "Nissan 370Z", price: 68000, emoji: "🏎️", speed: "⭐⭐⭐⭐" },
          "bmwm3": { name: "BMW M3", price: 95000, emoji: "🏎️", speed: "⭐⭐⭐⭐" },
          "audirs5": { name: "Audi RS5", price: 98000, emoji: "🏎️", speed: "⭐⭐⭐⭐" },
          "porsche911": { name: "Porsche 911 Carrera", price: 120000, emoji: "🏎️", speed: "⭐⭐⭐⭐⭐" }
        }
      },
      luxury: {
        name: "✨ LUXURY CARS",
        emoji: "✨",
        items: {
          "mercedesbenzs": { name: "Mercedes-Benz S-Class", price: 150000, emoji: "✨", speed: "⭐⭐⭐⭐" },
          "bmw7series": { name: "BMW 7 Series", price: 145000, emoji: "✨", speed: "⭐⭐⭐⭐" },
          "audia8": { name: "Audi A8", price: 140000, emoji: "✨", speed: "⭐⭐⭐⭐" },
          "lexusls": { name: "Lexus LS", price: 135000, emoji: "✨", speed: "⭐⭐⭐⭐" },
          "teslamodels": { name: "Tesla Model S Plaid", price: 180000, emoji: "⚡", speed: "⭐⭐⭐⭐⭐" },
          "bentleyflyingspur": { name: "Bentley Flying Spur", price: 250000, emoji: "✨", speed: "⭐⭐⭐⭐⭐" },
          "rollsroyceghost": { name: "Rolls-Royce Ghost", price: 350000, emoji: "👑", speed: "⭐⭐⭐⭐" },
          "maybach": { name: "Mercedes-Maybach S680", price: 300000, emoji: "👑", speed: "⭐⭐⭐⭐" }
        }
      },
      supercar: {
        name: "🔥 SUPERCARS",
        emoji: "🔥",
        items: {
          "lamborghinihuracan": { name: "Lamborghini Huracán", price: 500000, emoji: "🔥", speed: "⭐⭐⭐⭐⭐" },
          "ferrari488": { name: "Ferrari 488 GTB", price: 550000, emoji: "🔥", speed: "⭐⭐⭐⭐⭐" },
          "mclarenp570s": { name: "McLaren 570S", price: 480000, emoji: "🔥", speed: "⭐⭐⭐⭐⭐" },
          "corvettec8": { name: "Corvette C8 Z06", price: 200000, emoji: "🔥", speed: "⭐⭐⭐⭐⭐" },
          "audir8": { name: "Audi R8 V10", price: 450000, emoji: "🔥", speed: "⭐⭐⭐⭐⭐" },
          "porsche911turbo": { name: "Porsche 911 Turbo S", price: 380000, emoji: "🔥", speed: "⭐⭐⭐⭐⭐" },
          "nissan gtr": { name: "Nissan GT-R Nismo", price: 220000, emoji: "🔥", speed: "⭐⭐⭐⭐⭐" },
          "astonmartindb11": { name: "Aston Martin DB11", price: 320000, emoji: "🔥", speed: "⭐⭐⭐⭐⭐" }
        }
      },
      hypercar: {
        name: "💎 HYPERCARS",
        emoji: "💎",
        items: {
          "lamborghiniaventador": { name: "Lamborghini Aventador SVJ", price: 1500000, emoji: "💎", speed: "⭐⭐⭐⭐⭐⭐" },
          "ferrarif8": { name: "Ferrari F8 Tributo", price: 1800000, emoji: "💎", speed: "⭐⭐⭐⭐⭐⭐" },
          "mclaren720s": { name: "McLaren 720S", price: 1600000, emoji: "💎", speed: "⭐⭐⭐⭐⭐⭐" },
          "bugattiveyron": { name: "Bugatti Veyron", price: 5000000, emoji: "💎", speed: "⭐⭐⭐⭐⭐⭐" },
          "koenigseggagera": { name: "Koenigsegg Agera RS", price: 8000000, emoji: "💎", speed: "⭐⭐⭐⭐⭐⭐" },
          "paganihuayra": { name: "Pagani Huayra", price: 7000000, emoji: "💎", speed: "⭐⭐⭐⭐⭐⭐" },
          "ferrari812": { name: "Ferrari 812 Superfast", price: 4500000, emoji: "💎", speed: "⭐⭐⭐⭐⭐⭐" },
          "porsche918": { name: "Porsche 918 Spyder", price: 3500000, emoji: "💎", speed: "⭐⭐⭐⭐⭐⭐" }
        }
      },
      legendary: {
        name: "👑 LEGENDARY CARS",
        emoji: "👑",
        items: {
          "bugattichiron": { name: "Bugatti Chiron Super Sport", price: 15000000, emoji: "👑", speed: "⭐⭐⭐⭐⭐⭐⭐" },
          "koenigseggjesko": { name: "Koenigsegg Jesko Absolut", price: 20000000, emoji: "👑", speed: "⭐⭐⭐⭐⭐⭐⭐" },
          "paganizonda": { name: "Pagani Zonda HP Barchetta", price: 25000000, emoji: "👑", speed: "⭐⭐⭐⭐⭐⭐⭐" },
          "rollsroyceboattail": { name: "Rolls-Royce Boat Tail", price: 50000000, emoji: "👑", speed: "⭐⭐⭐⭐⭐" },
          "bugattilanoirenoire": { name: "Bugatti La Voiture Noire", price: 75000000, emoji: "👑", speed: "⭐⭐⭐⭐⭐⭐⭐" },
          "mercedesmaybach": { name: "Mercedes-Maybach Exelero", price: 100000000, emoji: "👑", speed: "⭐⭐⭐⭐⭐⭐" },
          "goldenferrari": { name: "Golden Ferrari F60 America", price: 250000000, emoji: "🏆", speed: "⭐⭐⭐⭐⭐⭐⭐" },
          "ultimateone": { name: "The Ultimate One (Custom)", price: 500000000000000000000, emoji: "🌟", speed: "⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐" }
        }
      }
    };

    // No arguments - show all categories
    if (args.length === 0) {
      let response = "🏁 𝗠𝗞-𝗖𝗔𝗥𝗦 𝗦𝗛𝗢𝗣 🏁\n";
      response += "━━━━━━━━━━━━━━━━━━━━\n\n";
      response += "Welcome to the ultimate car dealership!\n\n";
      
      for (const [key, category] of Object.entries(carShop)) {
        response += `${category.name}\n`;
        response += `   +carshop ${key}\n\n`;
      }
      
      response += "━━━━━━━━━━━━━━━━━━━━\n";
      response += "💰 Your Balance: $" + ((await usersData.get(senderID)).money || 0).toLocaleString();
      
      return message.reply(response);
    }

    // Buy command
    if (args[0].toLowerCase() === "buy") {
      if (args.length < 2) {
        return message.reply("❌ Please specify a car to buy.\nExample: +carshop buy fordmustang");
      }

      const carName = args.slice(1).join("").toLowerCase().replace(/\s+/g, "");
      let foundCar = null;
      let foundCategory = null;

      // Search for car across all categories
      for (const [catKey, category] of Object.entries(carShop)) {
        for (const [key, car] of Object.entries(category.items)) {
          if (key === carName || car.name.toLowerCase().replace(/\s+/g, "") === carName) {
            foundCar = car;
            foundCategory = catKey;
            break;
          }
        }
        if (foundCar) break;
      }

      if (!foundCar) {
        return message.reply(`❌ Car "${carName}" not found in the shop.\nUse +carshop to browse categories.`);
      }

      // Check user balance
      const userData = await usersData.get(senderID);
      const balance = userData.money || 0;

      if (balance < foundCar.price) {
        return message.reply(
          `❌ Insufficient funds!\n\n` +
          `${foundCar.emoji} ${foundCar.name}\n` +
          `💵 Price: $${foundCar.price.toLocaleString()}\n` +
          `${foundCar.speed} Speed\n\n` +
          `💰 Your balance: $${balance.toLocaleString()}\n` +
          `📉 Need: $${(foundCar.price - balance).toLocaleString()} more`
        );
      }

      // Process purchase
      const newBalance = balance - foundCar.price;
      
      // Initialize garage if it doesn't exist
      if (!userData.data) userData.data = {};
      if (!userData.data.garage) userData.data.garage = {};

      // Add car to garage
      if (!userData.data.garage[carName]) {
        userData.data.garage[carName] = {
          name: foundCar.name,
          emoji: foundCar.emoji,
          speed: foundCar.speed,
          category: foundCategory,
          purchasePrice: foundCar.price,
          quantity: 0
        };
      }
      userData.data.garage[carName].quantity += 1;

      // Update user data
      await usersData.set(senderID, {
        money: newBalance,
        exp: userData.exp,
        data: userData.data
      });

      return message.reply(
        `✅ 𝗣𝗨𝗥𝗖𝗛𝗔𝗦𝗘 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟! 🎉\n\n` +
        `${foundCar.emoji} ${foundCar.name}\n` +
        `💵 Price: $${foundCar.price.toLocaleString()}\n` +
        `${foundCar.speed} Speed\n\n` +
        `💰 New Balance: $${newBalance.toLocaleString()}\n` +
        `🚗 Total owned: ${userData.data.garage[carName].quantity}\n\n` +
        `Check your garage with +garage!`
      );
    }

    // Show specific category
    const category = args[0].toLowerCase();
    
    if (!carShop[category]) {
      return message.reply(
        `❌ Category "${category}" not found.\n\n` +
        `Available categories:\n` +
        `budget, economy, sport, luxury, supercar, hypercar, legendary\n\n` +
        `Use +carshop to view all categories.`
      );
    }

    // Display category cars
    let response = `${carShop[category].name}\n`;
    response += "━━━━━━━━━━━━━━━━━━━━\n\n";

    for (const [key, car] of Object.entries(carShop[category].items)) {
      response += `${car.emoji} ${car.name}\n`;
      response += `   💵 $${car.price.toLocaleString()}\n`;
      response += `   ${car.speed} Speed\n`;
      response += `   +carshop buy ${key}\n\n`;
    }

    response += "━━━━━━━━━━━━━━━━━━━━\n";
    response += "💰 Your Balance: $" + ((await usersData.get(senderID)).money || 0).toLocaleString();

    return message.reply(response);
  }
};
