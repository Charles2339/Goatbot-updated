/**
 * Check Current Thread Theme Example
 * 
 * Usage:
 *   node examples/check-current-theme.js "thread_id"
 * 
 * Example:
 *   node examples/check-current-theme.js "123456789"
 */

const fs = require("fs");
const { login } = require("../index");

const APPSTATE_PATH = "appstate.json";
// Replace with your actual thread ID (find it in messenger URL or use api.getThreadList())
const THREAD_ID = process.argv[2] || "YOUR_THREAD_ID_HERE";

if (THREAD_ID === "YOUR_THREAD_ID_HERE") {
  console.error("❌ Please provide a thread ID:");
  console.error('   node examples/check-current-theme.js "thread_id"');
  process.exit(1);
}

if (!fs.existsSync(APPSTATE_PATH)) {
  console.error("❌ appstate.json is required.");
  process.exit(1);
}

const credentials = { appState: JSON.parse(fs.readFileSync(APPSTATE_PATH, "utf8")) };

console.log("🔐 Logging in...");

login(credentials, {
  online: true,
  updatePresence: true,
  selfListen: false
}, async (err, api) => {
  if (err) {
    console.error("❌ LOGIN ERROR:", err);
    process.exit(1);
  }

  console.log(`✅ Logged in as: ${api.getCurrentUserID()}`);
  
  console.log("🔌 Starting MQTT listener...");
  api.listenMqtt((err, event) => {
    if (err) console.error("MQTT Error:", err);
  });
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log("✅ MQTT connection established\n");

  try {
    console.log("📋 Checking current theme for thread:", THREAD_ID);
    const themeInfo = await api.getThemeInfo(THREAD_ID);
    
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("🎨 CURRENT THREAD THEME INFO");
    console.log("═══════════════════════════════════════════════════════");
    console.log(JSON.stringify(themeInfo, null, 2));
    console.log("═══════════════════════════════════════════════════════\n");
    
    console.log("Thread Name:", themeInfo.threadName || 'Unnamed');
    console.log("Current Color:", themeInfo.color || 'Default');
    console.log("Current Emoji:", themeInfo.emoji || 'None');
    console.log("Theme ID:", themeInfo.theme_id || 'None/Default');
    
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Error:", error.message || error);
    process.exit(1);
  }
});
