const fs = require("fs");
const { login } = require("../index");

const credentials = { appState: JSON.parse(fs.readFileSync("appstate.json", "utf8")) };

login(credentials, async (err, api) => {
  if (err) return console.error(err);

  const threadID = "YOUR_THREAD_ID";

  api.listenMqtt((err) => {
    if (err) console.error(err);
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log("Getting all available themes...");
  const themes = await api.getTheme(threadID);
  console.log(`Found ${themes.length} themes!`);
  themes.slice(0, 5).forEach(theme => {
    console.log(`- ${theme.name} (ID: ${theme.id})`);
  });

  console.log("\nGetting current thread theme...");
  const currentTheme = await api.getThemeInfo(threadID);
  console.log(`Thread: ${currentTheme.threadName}`);
  console.log(`Color: ${currentTheme.color}`);
  console.log(`Emoji: ${currentTheme.emoji}`);

  console.log("\nApplying a standard theme...");
  const blueTheme = themes.find(t => t.name.includes("Blue") || t.id === "1440238847056619");
  if (blueTheme) {
    await api.setThreadThemeMqtt(threadID, blueTheme.id);
    console.log(`Applied theme: ${blueTheme.name}`);
  }

  console.log("\nTrying AI theme generation...");
  try {
    const aiThemes = await api.createAITheme("ocean sunset vibes");
    console.log("AI theme generated!");
    await api.setThreadThemeMqtt(threadID, aiThemes[0].id);
    console.log("AI theme applied!");
  } catch (e) {
    if (e.code === 'FEATURE_UNAVAILABLE') {
      console.log("AI themes not available for this account.");
      console.log("You can still use all standard themes!");
    } else {
      console.error("Error:", e.message);
    }
  }

  process.exit(0);
});
