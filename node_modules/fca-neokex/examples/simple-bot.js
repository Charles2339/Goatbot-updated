/**
 * Simple NeoKEX-FCA Bot Example
 * 
 * A minimal bot demonstrating basic functionality:
 * - Auto-reply to mentions
 * - Command handling
 * - Basic info commands
 */

const { login } = require('../index');
const fs = require('fs');
const path = require('path');

const APPSTATE_PATH = path.join(__dirname, '../test/appstate.json');
const appState = JSON.parse(fs.readFileSync(APPSTATE_PATH, 'utf8'));

console.log('🤖 Simple Bot Starting...\n');

login({ appState }, (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err);
    return;
  }

  console.log('✅ Bot is online!');
  const botID = api.getCurrentUserID();
  
  api.listenMqtt((err, event) => {
    if (err) return console.error('Error:', err);
    
    if (event.type === 'message' && event.body) {
      const { threadID, senderID, body } = event;
      
      // Ignore own messages
      if (senderID === botID) return;
      
      // Auto-reply to mentions
      if (event.mentions && event.mentions[botID]) {
        api.sendMessage('👋 You mentioned me! Type "!help" for commands.', threadID);
        return;
      }
      
      // Command handling
      if (body.startsWith('!')) {
        handleCommand(api, body.substring(1).trim(), threadID, senderID);
      }
    }
  });
  
  console.log('✅ Listening for messages...\n');
});

async function handleCommand(api, cmd, threadID, senderID) {
  const [command, ...args] = cmd.split(' ');
  
  try {
    switch (command.toLowerCase()) {
      case 'help':
        await api.sendMessage(`🤖 Simple Bot Commands

!help - Show this menu
!ping - Check if bot is alive
!time - Current time
!info - Thread information
!me - Your user info
!theme <name> - Change theme

Example: !theme love`, threadID);
        break;
        
      case 'ping':
        await api.sendMessage('🏓 Pong! Bot is alive!', threadID);
        break;
        
      case 'time':
        await api.sendMessage(`⏰ ${new Date().toLocaleString()}`, threadID);
        break;
        
      case 'info':
        const info = await api.getThreadInfo(threadID);
        await api.sendMessage(`💬 Thread: ${info.threadName || 'Unnamed'}
👥 Members: ${info.participantIDs.length}
💬 Messages: ${info.messageCount || 'Unknown'}`, threadID);
        break;
        
      case 'me':
        const userInfo = await api.getUserInfo(senderID);
        const user = userInfo[senderID];
        await api.sendMessage(`👤 ${user.name}
🆔 ${senderID}`, threadID);
        break;
        
      case 'theme':
        if (args.length === 0) {
          await api.sendMessage('❌ Usage: !theme <name>', threadID);
          break;
        }
        await api.theme(args.join(' '), threadID);
        await api.sendMessage(`✅ Theme changed!`, threadID);
        break;
        
      default:
        await api.sendMessage(`❓ Unknown command. Type !help for help.`, threadID);
    }
  } catch (error) {
    console.error('Command error:', error);
    await api.sendMessage(`❌ Error: ${error.message}`, threadID);
  }
}

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});
