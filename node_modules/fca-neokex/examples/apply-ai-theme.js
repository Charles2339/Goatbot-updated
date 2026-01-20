/**
 * AI Theme Generation and Application Example
 * 
 * Usage:
 *   node examples/apply-ai-theme.js "theme prompt" "thread_id"
 * 
 * Example:
 *   node examples/apply-ai-theme.js "vibrant purple pink ocean sunset" "123456789"
 * 
 * Note: AI theme generation requires Facebook account-level access.
 * If unavailable, use standard themes via api.getTheme() instead.
 */

const fs = require("fs");
const { login } = require("../index");

const APPSTATE_PATH = "appstate.json";
const AI_THEME_PROMPT = process.argv[2] || "vibrant purple pink ocean sunset";
// Replace with your actual thread ID (find it in messenger URL or use api.getThreadList())
const THREAD_ID = process.argv[3] || "YOUR_THREAD_ID_HERE";

if (THREAD_ID === "YOUR_THREAD_ID_HERE") {
  console.error("❌ Please provide a thread ID:");
  console.error('   node examples/apply-ai-theme.js "theme prompt" "thread_id"');
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
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log("✅ MQTT connection established\n");

  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log(`🎨 AI THEME GENERATION AND APPLICATION`);
    console.log("═══════════════════════════════════════════════════════\n");

    console.log(`📝 Prompt: "${AI_THEME_PROMPT}"`);
    
    console.log("\n🎨 Step 1: Generating AI theme...");
    const aiThemes = await api.createAITheme(AI_THEME_PROMPT);
    
    if (!aiThemes || aiThemes.length === 0) {
      console.error("❌ No themes generated!");
      process.exit(1);
    }
    
    console.log(`✅ AI theme generated!`);
    console.log(`   Theme ID: ${aiThemes[0].id}`);
    console.log(`   Name: ${aiThemes[0].accessibility_label || AI_THEME_PROMPT}`);
    
    console.log("\n⏳ Waiting 2 seconds before applying...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("\n🔄 Step 2: Applying theme to thread...");
    console.log(`   Thread ID: ${THREAD_ID}`);
    console.log(`   Theme ID: ${aiThemes[0].id}`);
    
    // Apply using callback to catch errors
    await new Promise((resolve, reject) => {
      api.setThreadThemeMqtt(THREAD_ID, aiThemes[0].id, (err) => {
        if (err) {
          console.error("❌ Error in setThreadThemeMqtt:", err);
          reject(err);
        } else {
          console.log("✅ MQTT publish completed");
          resolve();
        }
      });
    });
    
    console.log("\n⏳ Waiting 3 seconds for theme to sync...");
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log("\n📋 Step 3: Verifying theme was applied...");
    const themeInfo = await api.getThemeInfo(THREAD_ID);
    
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("📊 VERIFICATION RESULTS");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`Thread Name: ${themeInfo.threadName || 'Unnamed'}`);
    console.log(`Current Color: ${themeInfo.color || 'Default'}`);
    console.log(`Theme ID: ${themeInfo.theme_id || 'None'}`);
    console.log(`Expected Theme ID: ${aiThemes[0].id}`);
    console.log(`Match: ${themeInfo.theme_id === aiThemes[0].id ? '✅ YES' : '❌ NO'}`);
    
    if (themeInfo.theme_id === aiThemes[0].id) {
      console.log("\n🎉 SUCCESS! AI theme applied successfully!");
    } else {
      console.log("\n⚠️  Theme generated but not applied. Theme ID mismatch.");
      console.log("This might be a timing issue or MQTT delivery problem.");
    }
    
    console.log("═══════════════════════════════════════════════════════\n");
    
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Error occurred:", error.message || error);
    console.error("Stack:", error.stack);
    process.exit(1);
  }
});
