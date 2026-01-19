module.exports = {
  config: {
    name: "biology",
    aliases: ["bio", "bioquiz"],
    version: "1.0",
    author: "CharlesMK",
    countDown: 3,
    role: 0,
    description: {
      en: "Answer biology questions and earn money + EXP!"
    },
    category: "game",
    guide: {
      en: "{pn} <difficulty>\nDifficulties: easy, mid, hard, hell\n\nExample: {pn} easy\n\nRewards:\n🟢 Easy: $500 + 25 EXP\n🟡 Mid: $1,250 + 62 EXP\n🟠 Hard: $2,500 + 100 EXP\n🔴 Hell: $10,000 + 500 EXP"
    }
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;

    if (args.length === 0) {
      return message.reply(
        "🧬 𝗕𝗜𝗢𝗟𝗢𝗚𝗬 𝗤𝗨𝗜𝗭\n\n" +
        "Choose a difficulty:\n" +
        "🟢 +biology easy ($500 + 25 EXP)\n" +
        "🟡 +biology mid ($1,250 + 62 EXP)\n" +
        "🟠 +biology hard ($2,500 + 100 EXP)\n" +
        "🔴 +biology hell ($10,000 + 500 EXP)"
      );
    }

    const difficulty = args[0].toLowerCase();

    const questions = {
      easy: [
        { q: "How many chambers does the human heart have?", a: "4", options: ["2", "3", "4", "5"] },
        { q: "What is the powerhouse of the cell?", a: "Mitochondria", options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"] },
        { q: "What type of blood cells fight infection?", a: "White blood cells", options: ["Red blood cells", "White blood cells", "Platelets", "Plasma"] },
        { q: "What is the largest organ in the human body?", a: "Skin", options: ["Liver", "Brain", "Skin", "Heart"] },
        { q: "How many bones are in the adult human body?", a: "206", options: ["195", "206", "215", "220"] },
        { q: "What gas do plants absorb from the atmosphere?", a: "Carbon dioxide", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"] },
        { q: "What is the basic unit of life?", a: "Cell", options: ["Atom", "Molecule", "Cell", "Tissue"] },
        { q: "What organ pumps blood throughout the body?", a: "Heart", options: ["Lungs", "Liver", "Heart", "Kidneys"] },
        { q: "What is the study of plants called?", a: "Botany", options: ["Zoology", "Botany", "Ecology", "Anatomy"] },
        { q: "What part of the cell contains genetic material?", a: "Nucleus", options: ["Cytoplasm", "Membrane", "Nucleus", "Mitochondria"] },
        { q: "What is the green pigment in plants?", a: "Chlorophyll", options: ["Chlorophyll", "Carotene", "Melanin", "Hemoglobin"] },
        { q: "How many pairs of chromosomes do humans have?", a: "23", options: ["22", "23", "24", "46"] },
        { q: "What process do plants use to make food?", a: "Photosynthesis", options: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"] },
        { q: "What is the largest artery in the body?", a: "Aorta", options: ["Pulmonary", "Carotid", "Aorta", "Femoral"] },
        { q: "What is the chemical symbol for water?", a: "H2O", options: ["H2O", "CO2", "O2", "NaCl"] }
      ],

      mid: [
        { q: "What is the process of cell division called?", a: "Mitosis", options: ["Meiosis", "Mitosis", "Fusion", "Fission"] },
        { q: "What enzyme breaks down starch in the mouth?", a: "Amylase", options: ["Pepsin", "Lipase", "Amylase", "Trypsin"] },
        { q: "What is the scientific name for red blood cells?", a: "Erythrocytes", options: ["Leukocytes", "Erythrocytes", "Thrombocytes", "Lymphocytes"] },
        { q: "Where does protein digestion begin?", a: "Stomach", options: ["Mouth", "Stomach", "Small intestine", "Large intestine"] },
        { q: "What is the pH of neutral water?", a: "7", options: ["0", "7", "10", "14"] },
        { q: "What connects muscles to bones?", a: "Tendons", options: ["Ligaments", "Tendons", "Cartilage", "Nerves"] },
        { q: "What type of blood vessel carries blood to the heart?", a: "Veins", options: ["Arteries", "Veins", "Capillaries", "Lymph"] },
        { q: "What is the control center of the cell?", a: "Nucleus", options: ["Ribosome", "Nucleus", "Golgi body", "ER"] },
        { q: "What hormone regulates blood sugar?", a: "Insulin", options: ["Glucagon", "Insulin", "Adrenaline", "Cortisol"] },
        { q: "What is the longest bone in the human body?", a: "Femur", options: ["Tibia", "Humerus", "Femur", "Fibula"] },
        { q: "What percentage of human body is water?", a: "60", options: ["50", "60", "70", "80"] },
        { q: "What is the functional unit of the kidney?", a: "Nephron", options: ["Neuron", "Nephron", "Alveoli", "Villus"] },
        { q: "What type of immunity is inherited?", a: "Innate", options: ["Acquired", "Innate", "Passive", "Active"] },
        { q: "What is the genetic material in cells?", a: "DNA", options: ["RNA", "DNA", "Protein", "Lipid"] },
        { q: "What organ produces bile?", a: "Liver", options: ["Pancreas", "Liver", "Gallbladder", "Stomach"] }
      ],

      hard: [
        { q: "What is the scientific name for the collarbone?", a: "Clavicle", options: ["Scapula", "Sternum", "Clavicle", "Humerus"] },
        { q: "What is the site of cellular respiration?", a: "Mitochondria", options: ["Nucleus", "Ribosome", "Mitochondria", "Lysosome"] },
        { q: "What is the functional unit of the nervous system?", a: "Neuron", options: ["Neuron", "Nephron", "Axon", "Synapse"] },
        { q: "What bonds hold DNA strands together?", a: "Hydrogen bonds", options: ["Ionic bonds", "Covalent bonds", "Hydrogen bonds", "Peptide bonds"] },
        { q: "What is the term for programmed cell death?", a: "Apoptosis", options: ["Necrosis", "Apoptosis", "Mitosis", "Lysis"] },
        { q: "What tissue connects bones at joints?", a: "Ligaments", options: ["Tendons", "Ligaments", "Cartilage", "Muscles"] },
        { q: "What part of the brain controls balance?", a: "Cerebellum", options: ["Cerebrum", "Cerebellum", "Medulla", "Hypothalamus"] },
        { q: "What is the outer layer of skin called?", a: "Epidermis", options: ["Dermis", "Epidermis", "Hypodermis", "Keratin"] },
        { q: "What is the waste product of protein metabolism?", a: "Urea", options: ["CO2", "Ammonia", "Urea", "Uric acid"] },
        { q: "What gland is called the master gland?", a: "Pituitary", options: ["Thyroid", "Adrenal", "Pituitary", "Pineal"] },
        { q: "What is the clumping of blood called?", a: "Agglutination", options: ["Coagulation", "Hemolysis", "Agglutination", "Thrombosis"] },
        { q: "What are light-sensitive cells in the retina?", a: "Rods and cones", options: ["Rods and cones", "Ganglion cells", "Bipolar cells", "Photoreceptors"] },
        { q: "What is the study of tissues called?", a: "Histology", options: ["Cytology", "Histology", "Pathology", "Anatomy"] },
        { q: "What protein gives hair its structure?", a: "Keratin", options: ["Collagen", "Elastin", "Keratin", "Actin"] },
        { q: "What is the genetic disorder causing sickle cells?", a: "Sickle cell anemia", options: ["Hemophilia", "Thalassemia", "Sickle cell anemia", "Leukemia"] }
      ],

      hell: [
        { q: "What is the Krebs cycle also known as?", a: "Citric acid cycle", options: ["Calvin cycle", "Citric acid cycle", "Glycolysis", "ETC"] },
        { q: "What structure regulates cell membrane permeability?", a: "Phospholipid bilayer", options: ["Glycocalyx", "Phospholipid bilayer", "Cytoskeleton", "Channel proteins"] },
        { q: "What is the term for sister chromatids separating?", a: "Anaphase", options: ["Metaphase", "Anaphase", "Telophase", "Prophase"] },
        { q: "What is the sequence of three RNA nucleotides?", a: "Codon", options: ["Codon", "Anticodon", "Intron", "Exon"] },
        { q: "What organelle is involved in autophagy?", a: "Lysosome", options: ["Peroxisome", "Lysosome", "Ribosome", "Proteasome"] },
        { q: "What is the movement of molecules against gradient?", a: "Active transport", options: ["Diffusion", "Osmosis", "Active transport", "Facilitated diffusion"] },
        { q: "What enzyme unwinds DNA during replication?", a: "Helicase", options: ["Ligase", "Polymerase", "Helicase", "Primase"] },
        { q: "What is the resting membrane potential of neurons?", a: "-70mV", options: ["-40mV", "-70mV", "-90mV", "0mV"] },
        { q: "What is the plural of mitochondrion?", a: "Mitochondria", options: ["Mitochondria", "Mitochondrions", "Mitochondries", "Mitochondras"] },
        { q: "What phase follows G2 in the cell cycle?", a: "Mitosis", options: ["S phase", "G1", "Mitosis", "Cytokinesis"] },
        { q: "What is the electron carrier in photosynthesis?", a: "NADPH", options: ["NADH", "FADH2", "NADPH", "ATP"] },
        { q: "What connects the two sister chromatids?", a: "Centromere", options: ["Centriole", "Centromere", "Kinetochore", "Telomere"] },
        { q: "What is the fluid inside mitochondria called?", a: "Matrix", options: ["Stroma", "Cytosol", "Matrix", "Cristae"] },
        { q: "What process forms glucose from non-carbs?", a: "Gluconeogenesis", options: ["Glycolysis", "Gluconeogenesis", "Glycogenesis", "Glycogenolysis"] },
        { q: "What are programmed ribosomes on ER called?", a: "Rough ER", options: ["Smooth ER", "Rough ER", "Golgi apparatus", "Peroxisomes"] }
      ]
    };

    const rewards = {
      easy: { exp: 25, money: 500 },
      mid: { exp: 62, money: 1250 },
      hard: { exp: 100, money: 2500 },
      hell: { exp: 500, money: 10000 }
    };

    const timeLimits = {
      easy: 30 * 1000,
      mid: 45 * 1000,
      hard: 60 * 1000,
      hell: 40 * 1000
    };

    const emojis = { easy: "🟢", mid: "🟡", hard: "🟠", hell: "🔴" };

    if (!rewards[difficulty]) {
      return message.reply("❌ Invalid difficulty! Choose: easy, mid, hard, hell");
    }

    // Random question
    const questionPool = questions[difficulty];
    const randomQ = questionPool[Math.floor(Math.random() * questionPool.length)];

    const timeText = `⏳ Time limit: ${timeLimits[difficulty] / 1000}s`;

    let questionMsg = `${emojis[difficulty]} 𝗕𝗜𝗢𝗟𝗢𝗚𝗬 𝗤𝗨𝗘𝗦𝗧𝗜𝗢𝗡 ${emojis[difficulty]}\n\n`;
    questionMsg += `Difficulty: ${difficulty.toUpperCase()}\n`;
    questionMsg += `💰 Reward: $${rewards[difficulty].money.toLocaleString()} + ${rewards[difficulty].exp} EXP\n`;
    questionMsg += `${timeText}\n\n`;
    questionMsg += `❓ ${randomQ.q}\n\n`;

    randomQ.options.forEach((option, index) => {
      questionMsg += `${index + 1}. ${option}\n`;
    });

    questionMsg += "\nReply with the number (1-4):";

    await message.reply(questionMsg, (err, info) => {
      if (info) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          author: senderID,
          messageID: info.messageID,
          correctAnswer: randomQ.a,
          correctIndex: randomQ.options.indexOf(randomQ.a),
          reward: rewards[difficulty],
          difficulty: difficulty,
          timestamp: Date.now(),
          timeLimit: timeLimits[difficulty]
        });
      }
    });
  },

  onReply: async function ({ message, event, Reply, usersData, api }) {
    const userID = event.senderID;
    const answer = parseInt(event.body?.trim());

    if (userID !== Reply.author) return;

    global.GoatBot.onReply.delete(Reply.messageID);

    // Check time limit
    const timeTaken = (Date.now() - Reply.timestamp) / 1000;
    
    if (Date.now() - Reply.timestamp > Reply.timeLimit) {
      return message.reply("⏰ Time's up! Try again.");
    }

    if (!answer || answer < 1 || answer > 4) {
      return message.reply("❌ Invalid answer! Please pick 1-4.");
    }

    const user = await usersData.get(userID);

    // Get user info for name
    let userName = "User";
    try {
      const userInfo = await api.getUserInfo(userID);
      userName = userInfo[userID]?.name || "User";
    } catch (e) {
      userName = "User";
    }

    // Initialize stats
    if (!user.data) user.data = {};
    if (!user.data.bioStats) {
      user.data.bioStats = {
        totalQuestions: 0,
        correctAnswers: 0,
        totalEarned: 0
      };
    }

    const stats = user.data.bioStats;
    stats.totalQuestions += 1;

    if (answer - 1 === Reply.correctIndex) {
      // CORRECT
      stats.correctAnswers += 1;
      stats.totalEarned += Reply.reward.money;

      const totalExp = (user.exp || 0) + Reply.reward.exp;
      const totalMoney = (user.money || 0) + Reply.reward.money;
      
      const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

      let rank = "🌟";
      if (accuracy >= 95) rank = "🏆 Biology Master";
      else if (accuracy >= 85) rank = "⭐ Scientist";
      else if (accuracy >= 75) rank = "🚀 Scholar";
      else if (accuracy >= 60) rank = "💫 Student";
      else rank = "🌟 Learner";

      await usersData.set(userID, {
        ...user,
        exp: totalExp,
        money: totalMoney,
        data: user.data
      });

      message.reply(
        `✅ 𝗖𝗢𝗥𝗥𝗘𝗖𝗧! 🎉\n\n` +
        `💰 𝗠𝗼𝗻𝗲𝘆: +$${Reply.reward.money.toLocaleString()}\n` +
        `✨ 𝗘𝗫𝗣: +${Reply.reward.exp}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 𝗦𝗰𝗼𝗿𝗲: ${stats.correctAnswers}/${stats.totalQuestions} (${accuracy}%)\n` +
        `⚡ 𝗧𝗶𝗺𝗲: ${timeTaken.toFixed(1)}s\n` +
        `💵 𝗧𝗼𝘁𝗮𝗹 𝗘𝗮𝗿𝗻𝗲𝗱: $${stats.totalEarned.toLocaleString()}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 ${userName} ${rank}`
      );
    } else {
      // WRONG
      const accuracy = Math.round((stats.correctAnswers / stats.totalQuestions) * 100);

      await usersData.set(userID, {
        ...user,
        data: user.data
      });

      message.reply(
        `❌ 𝗪𝗥𝗢𝗡𝗚! 😔\n\n` +
        `💭 𝗬𝗼𝘂𝗿 𝗔𝗻𝘀𝘄𝗲𝗿: ${answer}\n` +
        `✅ 𝗖𝗼𝗿𝗿𝗲𝗰𝘁: ${Reply.correctAnswer}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📊 𝗦𝗰𝗼𝗿𝗲: ${stats.correctAnswers}/${stats.totalQuestions} (${accuracy}%)\n` +
        `⚡ 𝗧𝗶𝗺𝗲: ${timeTaken.toFixed(1)}s\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Keep studying! 📚`
      );
    }
  }
};
