module.exports = {
  config: {
    name: "garage",
    aliases: ["mycars", "cars", "carlist"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 5,
    role: 0,
    description: {
      en: "View your car collection"
    },
    category: "economy",
    guide: {
      en: "{pn} - View all your cars\n{pn} <category> - View cars in a specific category\n\nCategories: budget, economy, sport, luxury, supercar, hypercar, legendary"
    }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;

    try {
      const userData = await usersData.get(senderID);
      const garage = userData.data?.garage || {};

      // Category display names
      const categoryNames = {
        budget: "🚙 BUDGET CARS",
        economy: "🚘 ECONOMY CARS",
        sport: "🏎️ SPORT CARS",
        luxury: "✨ LUXURY CARS",
        supercar: "🔥 SUPERCARS",
        hypercar: "💎 HYPERCARS",
        legendary: "👑 LEGENDARY CARS"
      };

      // Check if garage is empty
      const hasCars = Object.keys(garage).some(car => 
        garage[car].quantity > 0
      );

      if (!hasCars) {
        return message.reply(
          "🏁 𝗬𝗢𝗨𝗥 𝗚𝗔𝗥𝗔𝗚𝗘 🏁\n" +
          "━━━━━━━━━━━━━━━━━━━━\n\n" +
          "Your garage is empty! 😢\n\n" +
          "Visit the car shop to buy cars:\n" +
          "+carshop"
        );
      }

      // Show specific category
      if (args.length > 0) {
        const category = args[0].toLowerCase();

        if (!categoryNames[category]) {
          return message.reply(
            `❌ Category "${category}" not found.\n\n` +
            `Available categories:\n` +
            `budget, economy, sport, luxury, supercar, hypercar, legendary`
          );
        }

        const categoryCars = Object.entries(garage).filter(([key, car]) => 
          car.category === category && car.quantity > 0
        );

        if (categoryCars.length === 0) {
          return message.reply(
            `${categoryNames[category]}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `You don't have any cars in this category.\n\n` +
            `Visit +carshop ${category} to buy cars!`
          );
        }

        let response = `${categoryNames[category]}\n`;
        response += "━━━━━━━━━━━━━━━━━━━━\n\n";

        for (const [key, car] of categoryCars) {
          response += `${car.emoji} ${car.name}\n`;
          response += `   🚗 Quantity: ${car.quantity}\n`;
          response += `   ${car.speed} Speed\n`;
          response += `   💵 Value: $${car.purchasePrice.toLocaleString()}\n\n`;
        }

        return message.reply(response);
      }

      // Show all cars
      let response = "🏁 𝗬𝗢𝗨𝗥 𝗚𝗔𝗥𝗔𝗚𝗘 🏁\n";
      response += "━━━━━━━━━━━━━━━━━━━━\n\n";

      let totalCars = 0;
      let totalValue = 0;

      // Group cars by category
      const carsByCategory = {};
      for (const [key, car] of Object.entries(garage)) {
        if (car.quantity > 0) {
          if (!carsByCategory[car.category]) {
            carsByCategory[car.category] = [];
          }
          carsByCategory[car.category].push({ key, ...car });
          totalCars += car.quantity;
          totalValue += car.purchasePrice * car.quantity;
        }
      }

      for (const [catKey, cars] of Object.entries(carsByCategory)) {
        response += `${categoryNames[catKey]}\n`;
        
        for (const car of cars) {
          response += `  ${car.emoji} ${car.name} x${car.quantity}\n`;
        }
        
        response += "\n";
      }

      response += "━━━━━━━━━━━━━━━━━━━━\n";
      response += `🚗 Total Cars: ${totalCars}\n`;
      response += `💰 Total Value: $${totalValue.toLocaleString()}\n`;
      response += `💵 Balance: $${(userData.money || 0).toLocaleString()}`;

      return message.reply(response);

    } catch (error) {
      console.error("Garage error:", error);
      return message.reply("❌ An error occurred while loading your garage.");
    }
  }
};
