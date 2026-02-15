const moment = require("moment-timezone");

// Vehicle definitions with complete details
const VEHICLES = {
  // PUBLIC TRANSPORT (Pay per use)
  publictransport: {
    name: "Public Transport",
    type: "public",
    category: "Public",
    emoji: "🚌",
    speed: 60,
    maxDistance: 10000,
    costPerKm: 2,
    purchaseCost: null,
    fuelPerKm: 0,
    description: "Buses and trains. Cheap but slow. Good for nearby locations.",
    unlocks: []
  },
  
  // BASIC CARS
  car_basic: {
    name: "Basic Sedan",
    type: "car",
    category: "Cars",
    emoji: "🚗",
    speed: 100,
    maxDistance: 3000,
    purchaseCost: 50000,
    fuelPerKm: 5,
    description: "Your first vehicle. Affordable and reliable for regional travel.",
    unlocks: []
  },
  car_sports: {
    name: "Sports Car",
    type: "car",
    category: "Cars",
    emoji: "🏎️",
    speed: 200,
    maxDistance: 4000,
    purchaseCost: 500000,
    fuelPerKm: 15,
    description: "Lightning fast travel. High fuel consumption. Status symbol.",
    unlocks: []
  },
  car_luxury: {
    name: "Luxury Sedan",
    type: "car",
    category: "Cars",
    emoji: "🚙",
    speed: 150,
    maxDistance: 5000,
    purchaseCost: 300000,
    fuelPerKm: 10,
    description: "Comfortable long-distance travel. Balanced speed and efficiency.",
    unlocks: []
  },

  // OFF-ROAD VEHICLES
  car_suv: {
    name: "SUV 4x4",
    type: "4x4",
    category: "Off-Road",
    emoji: "🚙",
    speed: 120,
    maxDistance: 5000,
    purchaseCost: 150000,
    fuelPerKm: 8,
    description: "Off-road capable. Required for Siberia and Mongolia.",
    unlocks: ["siberia", "mongolia"]
  },
  truck_heavy: {
    name: "Heavy Duty Truck",
    type: "4x4",
    category: "Off-Road",
    emoji: "🚚",
    speed: 90,
    maxDistance: 6000,
    purchaseCost: 250000,
    fuelPerKm: 12,
    description: "Built for extreme terrain. Can carry extra mining equipment.",
    unlocks: ["siberia", "mongolia"]
  },

  // COMMERCIAL FLIGHTS (Pay per use)
  flight_economy: {
    name: "Economy Flight",
    type: "flight",
    category: "Commercial",
    emoji: "✈️",
    speed: 800,
    maxDistance: 999999,
    costPerKm: 10,
    purchaseCost: null,
    fuelPerKm: 0,
    description: "Standard air travel. Access any location worldwide.",
    unlocks: []
  },
  flight_business: {
    name: "Business Class",
    type: "flight",
    category: "Commercial",
    emoji: "🛫",
    speed: 850,
    maxDistance: 999999,
    costPerKm: 25,
    purchaseCost: null,
    fuelPerKm: 0,
    description: "Priority boarding, faster travel. 6% time reduction.",
    unlocks: []
  },

  // PREMIUM VEHICLES
  helicopter: {
    name: "Private Helicopter",
    type: "helicopter",
    category: "Premium",
    emoji: "🚁",
    speed: 250,
    maxDistance: 2500,
    purchaseCost: 5000000,
    fuelPerKm: 50,
    description: "Access remote locations. Required for Deep Sea Platform.",
    unlocks: ["deepsea"]
  },
  privatejet: {
    name: "Private Jet",
    type: "privatejet",
    category: "Premium",
    emoji: "🛩️",
    speed: 900,
    maxDistance: 999999,
    purchaseCost: 50000000,
    fuelPerKm: 100,
    description: "Ultimate luxury travel. Required for Antarctica. Instant global access.",
    unlocks: ["antarctica"]
  },
  yacht: {
    name: "Luxury Yacht",
    type: "yacht",
    category: "Premium",
    emoji: "🛥️",
    speed: 80,
    maxDistance: 5000,
    purchaseCost: 20000000,
    fuelPerKm: 75,
    description: "Ocean travel in style. Can reach coastal mining locations.",
    unlocks: []
  },

  // SPECIAL EQUIPMENT
  submarine: {
    name: "Mining Submarine",
    type: "submarine",
    category: "Special",
    emoji: "🔱",
    speed: 0,
    maxDistance: 0,
    purchaseCost: 10000000,
    fuelPerKm: 0,
    description: "Deep sea mining equipment. Required for underwater operations.",
    unlocks: ["deepsea"]
  }
};

module.exports = {
  config: {
    name: "buy",
    aliases: ["transport","purchase", "shop", "store"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 5,
    role: 0,
    shortDescription: "Buy vehicles and equipment",
    longDescription: "Purchase vehicles, aircraft, and special mining equipment",
    category: "economy",
    guide: {
      en: "{pn} vehicles - View all vehicles for sale\n" +
          "{pn} <vehicle_id> - Purchase a vehicle\n" +
          "{pn} garage - View your owned vehicles\n" +
          "{pn} info <vehicle_id> - View vehicle details"
    }
  },

  langs: {
    en: {
      vehicleShop: "🏪 𝗩𝗘𝗛𝗜𝗖𝗟𝗘 𝗦𝗛𝗢𝗣\n━━━━━━━━━━━━━━━━━━\n\n%1\n━━━━━━━━━━━━━━━━━━\n\n💡 𝖴𝗌𝖾: +buy <vehicle_id>\n💰 𝖸𝗈𝗎𝗋 𝖡𝖺𝗅𝖺𝗇𝖼𝖾: $%2",
      
      vehicleInfo: "%1 %2\n━━━━━━━━━━━━━━━━━━\n\n💰 𝗣𝗿𝗶𝗰𝗲: %3\n🚀 𝗦𝗽𝗲𝗲𝗱: %4 km/h\n📏 𝗥𝗮𝗻𝗴𝗲: %5\n⛽ 𝗙𝘂𝗲𝗹: %6\n\n📝 %7\n\n%8\n━━━━━━━━━━━━━━━━━━\n\n💡 𝖴𝗌𝖾: +buy %9",
      
      purchaseSuccess: "✅ 𝗣𝗨𝗥𝗖𝗛𝗔𝗦𝗘 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟\n━━━━━━━━━━━━━━━━━━\n\n%1 %2\n💰 𝗣𝗮𝗶𝗱: $%3\n💵 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: $%4\n\n%5\n━━━━━━━━━━━━━━━━━━",
      
      garage: "🏠 𝗬𝗢𝗨𝗥 𝗚𝗔𝗥𝗔𝗚𝗘\n━━━━━━━━━━━━━━━━━━\n\n%1\n\n💰 𝗧𝗼𝘁𝗮𝗹 𝗩𝗮𝗹𝘂𝗲: $%2\n🚗 𝗩𝗲𝗵𝗶𝗰𝗹𝗲𝘀 𝗢𝘄𝗻𝗲𝗱: %3\n━━━━━━━━━━━━━━━━━━",
      
      emptyGarage: "🏠 𝗬𝗢𝗨𝗥 𝗚𝗔𝗥𝗔𝗚𝗘\n━━━━━━━━━━━━━━━━━━\n\n📦 𝖸𝗈𝗎𝗋 𝗀𝖺𝗋𝖺𝗀𝖾 𝗂𝗌 𝖾𝗆𝗉𝗍𝗒!\n\n💡 𝖴𝗌𝖾 +buy vehicles 𝗍𝗈 𝗌𝗁𝗈𝗉\n🚗 𝖲𝗍𝖺𝗋𝗍 𝗐𝗂𝗍𝗁 𝖺 𝖡𝖺𝗌𝗂𝖼 𝖢𝖺𝗋 ($50,000)\n━━━━━━━━━━━━━━━━━━",
      
      insufficientFunds: "❌ 𝗜𝗡𝗦𝗨𝗙𝗙𝗜𝗖𝗜𝗘𝗡𝗧 𝗙𝗨𝗡𝗗𝗦\n━━━━━━━━━━━━━━━━━━\n\n%1 %2\n💰 𝗣𝗿𝗶𝗰𝗲: $%3\n💵 𝗬𝗼𝘂𝗿 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: $%4\n📊 𝗡𝗲𝗲𝗱𝗲𝗱: $%5\n━━━━━━━━━━━━━━━━━━",
      
      alreadyOwned: "❌ 𝖸𝗈𝗎 𝖺𝗅𝗋𝖾𝖺𝖽𝗒 𝗈𝗐𝗇 𝗍𝗁𝗂𝗌 𝗏𝖾𝗁𝗂𝖼𝗅𝖾!\n\n💡 𝖴𝗌𝖾 +buy garage 𝗍𝗈 𝗌𝖾𝖾 𝗒𝗈𝗎𝗋 𝖼𝗈𝗅𝗅𝖾𝖼𝗍𝗂𝗈𝗇",
      
      vehicleNotFound: "❌ 𝖵𝖾𝗁𝗂𝖼𝗅𝖾 𝗇𝗈𝗍 𝖿𝗈𝗎𝗇𝖽!\n\n💡 𝖴𝗌𝖾 +buy vehicles 𝗍𝗈 𝗌𝖾𝖾 𝖺𝗅𝗅",
      
      notForSale: "❌ 𝖳𝗁𝗂𝗌 𝗂𝗌 𝖺 𝗉𝖺𝗒-𝗉𝖾𝗋-𝗎𝗌𝖾 𝗌𝖾𝗋𝗏𝗂𝖼𝖾!\n\n💡 𝖸𝗈𝗎 𝖽𝗈𝗇'𝗍 𝗇𝖾𝖾𝖽 𝗍𝗈 𝖻𝗎𝗒 𝗂𝗍\n✈️ 𝖴𝗌𝖾 +travel 𝗍𝗈 𝖻𝗈𝗈𝗄 𝖿𝗅𝗂𝗀𝗁𝗍𝗌"
    }
  },

  onStart: async function ({ message, args, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);

    // Initialize travel data
    if (!userData.data.travel) {
      userData.data.travel = {
        currentLocation: "johannesburg",
        traveling: false,
        ownedVehicles: [],
        permits: []
      };
    }

    const travelData = userData.data.travel;

    // Show garage
    if (args[0] === "garage") {
      if (travelData.ownedVehicles.length === 0) {
        return message.reply(getLang("emptyGarage"));
      }

      let garageText = "";
      let totalValue = 0;
      const categories = {};

      travelData.ownedVehicles.forEach(vehicleId => {
        const vehicle = VEHICLES[vehicleId];
        if (vehicle) {
          totalValue += vehicle.purchaseCost;
          
          if (!categories[vehicle.category]) {
            categories[vehicle.category] = [];
          }
          
          categories[vehicle.category].push({
            emoji: vehicle.emoji,
            name: vehicle.name,
            value: vehicle.purchaseCost,
            speed: vehicle.speed,
            unlocks: vehicle.unlocks
          });
        }
      });

      // Display by category
      const categoryOrder = ["Premium", "Special", "Off-Road", "Cars", "Commercial"];
      
      categoryOrder.forEach(category => {
        if (categories[category] && categories[category].length > 0) {
          garageText += `${getCategoryEmoji(category)} ${category.toUpperCase()}\n`;
          categories[category].forEach(v => {
            garageText += `   ${v.emoji} ${v.name}\n`;
            garageText += `      💰 $${v.value.toLocaleString()} | 🚀 ${v.speed}km/h\n`;
            if (v.unlocks.length > 0) {
              garageText += `      🔓 Unlocks: ${v.unlocks.join(", ")}\n`;
            }
          });
          garageText += "\n";
        }
      });

      return message.reply(
        getLang("garage",
          garageText.trim(),
          totalValue.toLocaleString(),
          travelData.ownedVehicles.length
        )
      );
    }

    // Show vehicle info
    if (args[0] === "info" && args[1]) {
      const vehicleId = args[1].toLowerCase();
      const vehicle = VEHICLES[vehicleId];

      if (!vehicle) {
        return message.reply(getLang("vehicleNotFound"));
      }

      const price = vehicle.purchaseCost ? `$${vehicle.purchaseCost.toLocaleString()}` : "Pay per use";
      const range = vehicle.maxDistance === 999999 ? "Unlimited" : `${vehicle.maxDistance.toLocaleString()}km`;
      const fuel = vehicle.fuelPerKm > 0 ? `$${vehicle.fuelPerKm}/km` : 
                   vehicle.costPerKm > 0 ? `$${vehicle.costPerKm}/km` : "Free";
      
      let unlocksText = "";
      if (vehicle.unlocks.length > 0) {
        unlocksText = `🔓 𝗨𝗻𝗹𝗼𝗰𝗸𝘀:\n   ${vehicle.unlocks.map(l => l.toUpperCase()).join(", ")}`;
      }

      const owned = travelData.ownedVehicles.includes(vehicleId);
      const status = owned ? "✅ OWNED" : vehicle.purchaseCost ? "🛒 Available" : "💳 Pay per use";

      return message.reply(
        getLang("vehicleInfo",
          vehicle.emoji,
          vehicle.name,
          price,
          vehicle.speed,
          range,
          fuel,
          vehicle.description,
          unlocksText,
          vehicleId
        ) + `\n\n📊 𝗦𝘁𝗮𝘁𝘂𝘀: ${status}`
      );
    }

    // Show all vehicles
    if (!args[0] || args[0] === "vehicles" || args[0] === "shop") {
      let shopText = "";
      const categories = {};

      Object.entries(VEHICLES).forEach(([id, vehicle]) => {
        if (!categories[vehicle.category]) {
          categories[vehicle.category] = [];
        }
        
        const owned = travelData.ownedVehicles.includes(id);
        const price = vehicle.purchaseCost ? `$${vehicle.purchaseCost.toLocaleString()}` : "Pay/use";
        const status = owned ? "✅" : vehicle.purchaseCost ? "" : "💳";
        
        categories[vehicle.category].push({
          id,
          emoji: vehicle.emoji,
          name: vehicle.name,
          price,
          status,
          owned
        });
      });

      // Display by category
      const categoryOrder = ["Premium", "Special", "Off-Road", "Cars", "Commercial", "Public"];
      
      categoryOrder.forEach(category => {
        if (categories[category]) {
          shopText += `${getCategoryEmoji(category)} ${category.toUpperCase()}\n`;
          categories[category].forEach(v => {
            const ownedMark = v.owned ? " ✅" : "";
            shopText += `   ${v.emoji} ${v.name}${ownedMark}\n`;
            shopText += `      💰 ${v.price}`;
            if (!v.owned && v.status === "") {
              shopText += ` | ID: ${v.id}`;
            }
            shopText += "\n";
          });
          shopText += "\n";
        }
      });

      return message.reply(
        getLang("vehicleShop", shopText.trim(), userData.money.toLocaleString())
      );
    }

    // Purchase vehicle
    const vehicleId = args[0].toLowerCase();
    const vehicle = VEHICLES[vehicleId];

    if (!vehicle) {
      return message.reply(getLang("vehicleNotFound"));
    }

    // Check if it's a purchasable vehicle
    if (!vehicle.purchaseCost) {
      return message.reply(getLang("notForSale"));
    }

    // Check if already owned
    if (travelData.ownedVehicles.includes(vehicleId)) {
      return message.reply(getLang("alreadyOwned"));
    }

    // Check if user can afford
    if (userData.money < vehicle.purchaseCost) {
      return message.reply(
        getLang("insufficientFunds",
          vehicle.emoji,
          vehicle.name,
          vehicle.purchaseCost.toLocaleString(),
          userData.money.toLocaleString(),
          (vehicle.purchaseCost - userData.money).toLocaleString()
        )
      );
    }

    // Purchase vehicle
    travelData.ownedVehicles.push(vehicleId);
    
    await usersData.set(senderID, {
      money: userData.money - vehicle.purchaseCost,
      data: userData.data
    });

    let unlocksText = "";
    if (vehicle.unlocks.length > 0) {
      unlocksText = `\n🔓 𝗡𝗲𝘄 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻𝘀 𝗨𝗻𝗹𝗼𝗰𝗸𝗲𝗱:\n   ${vehicle.unlocks.map(l => l.toUpperCase()).join(", ")}`;
    }

    return message.reply(
      getLang("purchaseSuccess",
        vehicle.emoji,
        vehicle.name,
        vehicle.purchaseCost.toLocaleString(),
        (userData.money - vehicle.purchaseCost).toLocaleString(),
        unlocksText
      )
    );
  }
};

// Helper functions
function getCategoryEmoji(category) {
  const emojis = {
    "Premium": "👑",
    "Special": "🔱",
    "Off-Road": "🏔️",
    "Cars": "🚗",
    "Commercial": "✈️",
    "Public": "🚌"
  };
  return emojis[category] || "📦";
}
