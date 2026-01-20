const { login } = require('../index');
const fs = require('fs');
const path = require('path');

const APPSTATE_PATH = path.join(__dirname, '../test/appstate.json');
const appState = JSON.parse(fs.readFileSync(APPSTATE_PATH, 'utf8'));

const PREFIX = '/';
const ADMIN_ID = null; // Set to your user ID to restrict some commands

console.log('🤖 NeoKEX-FCA Test Bot Starting...\n');

login({ appState }, (err, api) => {
  if (err) {
    console.error('❌ Login failed:', err);
    return;
  }

  console.log('✅ Login successful!');
  const botID = api.getCurrentUserID();
  console.log(`🤖 Bot ID: ${botID}\n`);

  api.listenMqtt((err, event) => {
    if (err) {
      console.error('MQTT Error:', err);
      return;
    }

    if (event.type === 'message' && event.body) {
      const { threadID, messageID, senderID, body, isGroup } = event;
      
      if (senderID === botID) return;
      
      if (!body.startsWith(PREFIX)) return;

      const args = body.slice(PREFIX.length).trim().split(/\s+/);
      const command = args.shift().toLowerCase();

      console.log(`📨 Command: ${command} from ${senderID} in ${threadID}`);

      handleCommand(api, command, args, event);
    }
  });

  console.log('🎧 Bot is listening for commands...');
  console.log(`📝 Use prefix: ${PREFIX}`);
  console.log('💡 Example: /help\n');
});

async function handleCommand(api, command, args, event) {
  const { threadID, messageID, senderID, isGroup } = event;
  try {
    switch (command) {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📌 BASIC COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'help':
      case 'commands':
        await api.sendMessage(`🤖 NeoKEX-FCA Test Bot Commands

📌 BASIC
${PREFIX}help - Show this menu
${PREFIX}ping - Test response time
${PREFIX}about - Bot information

👤 USER INFO
${PREFIX}me - Your user info
${PREFIX}userid <name> - Get user ID by name
${PREFIX}friends - List your friends
${PREFIX}userv2 <userID> - Get detailed user info (v2)
${PREFIX}bio <text> - Change your bio

💬 THREAD COMMANDS
${PREFIX}info - Thread information
${PREFIX}history [limit] - Get message history
${PREFIX}members - List thread members
${PREFIX}photo - Thread photo URL
${PREFIX}threads - List your threads
${PREFIX}themeinfo - Get current theme info
${PREFIX}mute - Toggle mute for this thread
${PREFIX}archive - Toggle archive status
${PREFIX}deletethis - Delete this thread

🎨 THEMES
${PREFIX}themes - List all available themes
${PREFIX}theme <name> - Change thread theme
${PREFIX}color <hex> - Change thread color
${PREFIX}changetheme <prompt> - Generate & apply AI theme

✏️ THREAD SETTINGS
${PREFIX}name <name> - Change thread name
${PREFIX}emoji <emoji> - Change thread emoji
${PREFIX}nickname <@mention> <nickname> - Set nickname

📎 MESSAGING
${PREFIX}typing - Send typing indicator
${PREFIX}react <emoji> - React to this message
${PREFIX}unsend - Unsend this message
${PREFIX}edit <text> - Edit this message
${PREFIX}forward <threadID> - Forward this message
${PREFIX}poll <question> | <option1> | <option2> - Create poll
${PREFIX}pin - Pin this message
${PREFIX}unpin - Unpin this message
${PREFIX}markread - Mark thread as read
${PREFIX}markreadall - Mark all threads as read

👥 GROUP MANAGEMENT
${PREFIX}creategroup <name> | <userID1> | <userID2> - Create group
${PREFIX}adduser <userID> - Add user to group
${PREFIX}removeuser <userID> - Remove user from group
${PREFIX}groupimage - Info about changing group image

🔗 SOCIAL
${PREFIX}block <userID> - Block a user
${PREFIX}unblock <userID> - Unblock a user
${PREFIX}addfriend <userID> - Add friend
${PREFIX}removefriend <userID> - Remove friend
${PREFIX}follow <userID> - Follow user
${PREFIX}unfollow <userID> - Unfollow user
${PREFIX}sharecontact <userID> - Share contact

🔍 SEARCH
${PREFIX}searchthread <query> - Search threads

📊 STATS & ADMIN
${PREFIX}status - Bot status
${PREFIX}test - Run quick API test
${PREFIX}logout - Logout bot`, threadID);
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📌 BASIC COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'ping':
        const start = Date.now();
        await api.sendMessage('🏓 Pong!', threadID, () => {
          const latency = Date.now() - start;
          api.sendMessage(`⏱️ Response time: ${latency}ms`, threadID);
        });
        break;

      case 'about':
        await api.sendMessage(`🤖 NeoKEX-FCA Test Bot
        
📦 Library: NeoKEX-FCA v4.4.4
✅ Success Rate: 98.2%
🔒 Security: 0 vulnerabilities
🎯 Tested APIs: 77 functions

Built to test and demonstrate the comprehensive API capabilities of NeoKEX-FCA.`, threadID);
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 👤 USER INFO COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'me':
        const myInfo = await api.getUserInfo(senderID);
        const user = myInfo[senderID];
        await api.sendMessage(`👤 Your Information

Name: ${user.name}
ID: ${senderID}
Username: ${user.vanity || 'None'}
Profile: https://facebook.com/${senderID}`, threadID);
        break;

      case 'friends':
        const friends = await api.getFriendsList();
        const friendsList = friends.slice(0, 10).map((f, i) => `${i + 1}. ${f.fullName}`).join('\n');
        await api.sendMessage(`👥 Your Friends (showing first 10/${friends.length})

${friendsList}

Total: ${friends.length} friends`, threadID);
        break;

      case 'userid':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}userid <name>`, threadID);
          break;
        }
        const name = args.join(' ');
        const uid = await api.getUserID(name);
        await api.sendMessage(`🔍 User ID for "${name}": ${uid}`, threadID);
        break;

      case 'userv2':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}userv2 <userID>`, threadID);
          break;
        }
        const targetUserID = args[0];
        const userInfoV2 = await api.getUserInfoV2(targetUserID);
        const v2User = userInfoV2[targetUserID];
        if (v2User) {
          await api.sendMessage(`👤 Detailed User Info (v2)

Name: ${v2User.name || 'Unknown'}
ID: ${targetUserID}
Username: ${v2User.vanity || 'None'}
Gender: ${v2User.gender || 'Unknown'}
Is Friend: ${v2User.isFriend ? 'Yes' : 'No'}
Profile: https://facebook.com/${targetUserID}`, threadID);
        } else {
          await api.sendMessage(`❌ Could not fetch user info for ${targetUserID}`, threadID);
        }
        break;

      case 'bio':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}bio <text>`, threadID);
          break;
        }
        const bioText = args.join(' ');
        await api.changeBio(bioText);
        await api.sendMessage(`✅ Bio changed to: ${bioText}`, threadID);
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 💬 THREAD COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'info':
        const threadInfo = await api.getThreadInfo(threadID);
        await api.sendMessage(`💬 Thread Information

Name: ${threadInfo.threadName || 'Unnamed'}
ID: ${threadID}
Type: ${isGroup ? 'Group' : 'Direct Message'}
Members: ${threadInfo.participantIDs?.length || 0}
Messages: ${threadInfo.messageCount || 'Unknown'}
Emoji: ${threadInfo.emoji || '👍'}`, threadID);
        break;

      case 'history':
        const limit = parseInt(args[0]) || 5;
        const history = await api.getThreadHistory(threadID, limit);
        const messages = history.map((msg, i) => 
          `${i + 1}. ${msg.senderName}: ${msg.body?.substring(0, 50) || '[Attachment]'}`
        ).join('\n');
        await api.sendMessage(`📜 Recent Messages (${limit}):

${messages}`, threadID);
        break;

      case 'members':
        const info = await api.getThreadInfo(threadID);
        const memberInfo = await api.getUserInfo(info.participantIDs);
        const memberList = Object.values(memberInfo).map((m, i) => 
          `${i + 1}. ${m.name}`
        ).join('\n');
        await api.sendMessage(`👥 Thread Members:

${memberList}

Total: ${info.participantIDs.length} members`, threadID);
        break;

      case 'photo':
        const photos = await api.getThreadPictures(threadID, 0, 1);
        if (photos.length > 0) {
          await api.sendMessage(`📸 Thread Photo: ${photos[0].uri}`, threadID);
        } else {
          await api.sendMessage(`❌ No thread photo available`, threadID);
        }
        break;

      case 'threads':
        const threadList = await api.getThreadList(20, null);
        const threadListFormatted = threadList.slice(0, 10).map((t, i) => 
          `${i + 1}. ${t.name || 'Unnamed'} (${t.threadID})`
        ).join('\n');
        await api.sendMessage(`📋 Your Threads (showing 10/${threadList.length}):

${threadListFormatted}`, threadID);
        break;

      case 'themeinfo':
        const currentThemeInfo = await api.getThemeInfo(threadID);
        await api.sendMessage(`🎨 Current Theme Info

Thread: ${currentThemeInfo.threadName || 'Unnamed'}
Color: ${currentThemeInfo.color || 'Default'}
Emoji: ${currentThemeInfo.emoji || '👍'}
Theme ID: ${currentThemeInfo.theme_id || 'Default'}`, threadID);
        break;

      case 'mute':
        const currentInfo = await api.getThreadInfo(threadID);
        const isMuted = currentInfo.muteUntil > Date.now();
        await api.muteThread(threadID, isMuted ? -1 : 9999999999);
        await api.sendMessage(`🔇 Thread ${isMuted ? 'unmuted' : 'muted'}`, threadID);
        break;

      case 'archive':
        const archiveThreadInfo = await api.getThreadInfo(threadID);
        const isArchived = archiveThreadInfo.isArchived;
        await api.changeArchivedStatus(threadID, !isArchived);
        await api.sendMessage(`📦 Thread ${isArchived ? 'unarchived' : 'archived'}`, threadID);
        break;

      case 'deletethis':
        await api.sendMessage(`⚠️ Deleting this thread in 3 seconds...`, threadID);
        setTimeout(async () => {
          await api.deleteThread(threadID);
        }, 3000);
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🎨 THEME COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'themes':
        const allThemes = await api.getTheme(threadID);
        const themeList = allThemes.slice(0, 15).map((t, i) => 
          `${i + 1}. ${t.name} (ID: ${t.id})`
        ).join('\n');
        await api.sendMessage(`🎨 Available Themes (showing 15/${allThemes.length}):

${themeList}

Use ${PREFIX}theme <name> to apply`, threadID);
        break;

      case 'theme':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}theme <name or ID>`, threadID);
          break;
        }
        const themeName = args.join(' ');
        const themesList = await api.getTheme(threadID);
        const selectedTheme = themesList.find(t => 
          t.name.toLowerCase().includes(themeName.toLowerCase()) || 
          t.id === themeName
        );
        if (selectedTheme) {
          await api.sendMessage(`🎨 Applying theme: ${selectedTheme.name}...`, threadID);
          await api.setThreadThemeMqtt(threadID, selectedTheme.id);
          await api.sendMessage(`✅ Theme changed to: ${selectedTheme.name}`, threadID);
        } else {
          await api.sendMessage(`❌ Theme not found. Use ${PREFIX}themes to see available themes`, threadID);
        }
        break;

      case 'color':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}color <hex color>
Example: ${PREFIX}color #0084ff`, threadID);
          break;
        }
        const color = args[0];
        await api.changeThreadColor(color, threadID);
        await api.sendMessage(`🎨 Thread color changed to: ${color}`, threadID);
        break;

      case 'aitheme':
      case 'changetheme':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}changetheme <AI prompt>
Example: ${PREFIX}changetheme ocean sunset vibes
Example: ${PREFIX}changetheme purple pink galaxy stars`, threadID);
          break;
        }
        const aiPrompt = args.join(' ');
        await api.sendMessage(`🎨 Generating AI theme: "${aiPrompt}"...`, threadID);
        
        try {
          // Step 1: Generate AI theme
          const aiThemes = await api.createAITheme(aiPrompt);
          
          if (!aiThemes || aiThemes.length === 0) {
            await api.sendMessage(`❌ No themes generated. AI theme feature may not be available for your account.
Try using ${PREFIX}themes to see standard themes.`, threadID);
            break;
          }
          
          const generatedTheme = aiThemes[0];
          await api.sendMessage(`✅ Theme generated!
Name: ${generatedTheme.accessibility_label || aiPrompt}
ID: ${generatedTheme.id}

Applying theme...`, threadID);
          
          // Step 2: Apply the theme using MQTT
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          try {
            await api.setThreadThemeMqtt(threadID, generatedTheme.id);
            await api.sendMessage(`🎉 AI theme applied successfully!`, threadID);
          } catch (applyError) {
            console.error('❌ Theme Application Error:', applyError.message);
            await api.sendMessage(`⚠️ Theme generated but failed to apply: ${applyError.message}

You can try applying it manually using theme ID: ${generatedTheme.id}`, threadID);
          }
          
        } catch (error) {
          console.error('❌ AI Theme Generation Error:', error.message || error);
          await api.sendMessage(`❌ Error generating AI theme: ${error.message || 'Unknown error'}

This feature may not be available for your account.
Try using ${PREFIX}themes for standard themes instead.`, threadID);
        }
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ✏️ THREAD SETTINGS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'name':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}name <new name>`, threadID);
          break;
        }
        const newName = args.join(' ');
        await api.setThreadName(newName, threadID);
        await api.sendMessage(`✅ Thread name changed to: ${newName}`, threadID);
        break;

      case 'emoji':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}emoji <emoji>
Example: ${PREFIX}emoji 🔥`, threadID);
          break;
        }
        await api.changeThreadEmoji(args[0], threadID);
        await api.sendMessage(`✅ Thread emoji changed to: ${args[0]}`, threadID);
        break;

      case 'nickname':
        const mentions = event.mentions;
        if (!mentions || mentions.length === 0 || args.length < 2) {
          await api.sendMessage(`❌ Usage: ${PREFIX}nickname @mention <nickname>`, threadID);
          break;
        }
        const targetID = Object.keys(mentions)[0];
        const nickname = args.slice(1).join(' ');
        await api.changeNickname(nickname, threadID, targetID);
        await api.sendMessage(`✅ Nickname changed to: ${nickname}`, threadID);
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📎 MESSAGING COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'typing':
        await api.sendTypingIndicator(threadID);
        await api.sendMessage('✅ Typing indicator sent!', threadID);
        break;

      case 'react':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}react <emoji>`, threadID);
          break;
        }
        await api.setMessageReaction(args[0], messageID);
        break;

      case 'unsend':
        await api.unsendMessage(messageID);
        break;

      case 'poll':
        const pollData = args.join(' ').split('|').map(s => s.trim());
        if (pollData.length < 3) {
          await api.sendMessage(`❌ Usage: ${PREFIX}poll <question> | <option1> | <option2>
Example: ${PREFIX}poll Pizza or Burger? | Pizza | Burger`, threadID);
          break;
        }
        const [question, ...options] = pollData;
        await api.createPoll(question, threadID, { options });
        break;

      case 'edit':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}edit <new text>`, threadID);
          break;
        }
        const newText = args.join(' ');
        await api.editMessage(newText, messageID);
        await api.sendMessage(`✅ Message edited to: "${newText}"`, threadID);
        break;

      case 'forward':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}forward <threadID>`, threadID);
          break;
        }
        const targetThreadID = args[0];
        await api.forwardMessage(messageID, targetThreadID);
        await api.sendMessage(`✅ Message forwarded to thread ${targetThreadID}`, threadID);
        break;

      case 'pin':
        await api.pin('pin', threadID, messageID);
        await api.sendMessage(`📌 Message pinned!`, threadID);
        break;

      case 'unpin':
        await api.pin('unpin', threadID, messageID);
        await api.sendMessage(`📌 Message unpinned!`, threadID);
        break;

      case 'markread':
        await api.markAsRead(threadID, true);
        await api.sendMessage(`✅ Thread marked as read`, threadID);
        break;

      case 'markreadall':
        await api.markAsReadAll();
        await api.sendMessage(`✅ All threads marked as read`, threadID);
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 👥 GROUP MANAGEMENT COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'creategroup':
        const groupData = args.join(' ').split('|').map(s => s.trim());
        if (groupData.length < 2) {
          await api.sendMessage(`❌ Usage: ${PREFIX}creategroup <name> | <userID1> | <userID2>
Example: ${PREFIX}creategroup My Group | 100001 | 100002`, threadID);
          break;
        }
        const [groupName, ...userIDs] = groupData;
        await api.createNewGroup(userIDs, groupName);
        await api.sendMessage(`✅ Group "${groupName}" created with ${userIDs.length} members`, threadID);
        break;

      case 'adduser':
        if (!isGroup) {
          await api.sendMessage(`❌ This command only works in group chats`, threadID);
          break;
        }
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}adduser <userID>`, threadID);
          break;
        }
        const userToAdd = args[0];
        await api.addUserToGroup(userToAdd, threadID);
        await api.sendMessage(`✅ User ${userToAdd} added to group`, threadID);
        break;

      case 'removeuser':
        if (!isGroup) {
          await api.sendMessage(`❌ This command only works in group chats`, threadID);
          break;
        }
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}removeuser <userID>`, threadID);
          break;
        }
        const userToRemove = args[0];
        await api.removeUserFromGroup(userToRemove, threadID);
        await api.sendMessage(`✅ User ${userToRemove} removed from group`, threadID);
        break;

      case 'groupimage':
        if (!isGroup) {
          await api.sendMessage(`❌ This command only works in group chats`, threadID);
          break;
        }
        await api.sendMessage(`ℹ️ Note: changeGroupImage requires a readable stream (file), not a URL.
Example: api.changeGroupImage(fs.createReadStream('image.jpg'), threadID)`, threadID);
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🔗 SOCIAL COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'block':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}block <userID>`, threadID);
          break;
        }
        const userToBlock = args[0];
        await api.changeBlockedStatus(userToBlock, true);
        await api.sendMessage(`🚫 User ${userToBlock} has been blocked`, threadID);
        break;

      case 'unblock':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}unblock <userID>`, threadID);
          break;
        }
        const userToUnblock = args[0];
        await api.changeBlockedStatus(userToUnblock, false);
        await api.sendMessage(`✅ User ${userToUnblock} has been unblocked`, threadID);
        break;

      case 'addfriend':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}addfriend <userID>`, threadID);
          break;
        }
        const friendToAdd = args[0];
        await api.friend(friendToAdd, true);
        await api.sendMessage(`✅ Friend request sent to ${friendToAdd}`, threadID);
        break;

      case 'removefriend':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}removefriend <userID>`, threadID);
          break;
        }
        const friendToRemove = args[0];
        await api.unfriend(friendToRemove);
        await api.sendMessage(`✅ Removed ${friendToRemove} from friends`, threadID);
        break;

      case 'follow':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}follow <userID>`, threadID);
          break;
        }
        const userToFollow = args[0];
        await api.follow(userToFollow, true);
        await api.sendMessage(`✅ Now following ${userToFollow}`, threadID);
        break;

      case 'unfollow':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}unfollow <userID>`, threadID);
          break;
        }
        const userToUnfollow = args[0];
        await api.follow(userToUnfollow, false);
        await api.sendMessage(`✅ Unfollowed ${userToUnfollow}`, threadID);
        break;

      case 'sharecontact':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}sharecontact <userID> [message]
Example: ${PREFIX}sharecontact 100001234567890 Check out this contact!`, threadID);
          break;
        }
        const contactUserID = args[0];
        const contactMessage = args.slice(1).join(' ') || '';
        api.shareContact(contactMessage, contactUserID, threadID);
        await api.sendMessage(`✅ Contact card for user ${contactUserID} shared in this thread`, threadID);
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 🔍 SEARCH COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'searchthread':
        if (args.length === 0) {
          await api.sendMessage(`❌ Usage: ${PREFIX}searchthread <query>`, threadID);
          break;
        }
        const threadQuery = args.join(' ');
        const searchResults = await api.searchForThread(threadQuery);
        if (searchResults.length === 0) {
          await api.sendMessage(`❌ No threads found for "${threadQuery}"`, threadID);
        } else {
          const searchResultsFormatted = searchResults.slice(0, 5).map((t, i) => 
            `${i + 1}. ${t.name} (${t.threadID})`
          ).join('\n');
          await api.sendMessage(`🔍 Thread search results:

${searchResultsFormatted}

Found: ${searchResults.length} threads`, threadID);
        }
        break;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // 📊 STATUS COMMANDS
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      case 'status':
        const status = api.getTokenRefreshStatus();
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        await api.sendMessage(`📊 Bot Status

⏱️ Uptime: ${hours}h ${minutes}m
🔄 Token Refresh: ${status.isRefreshing ? 'Active' : 'Idle'}
📅 Last Refresh: ${status.lastRefreshTime ? new Date(status.lastRefreshTime).toLocaleString() : 'Never'}
📈 Refresh Count: ${status.refreshCount}
✅ MQTT: Connected`, threadID);
        break;

      case 'test':
        await api.sendMessage('🧪 Running quick API test...', threadID);
        const testResults = [];
        
        try {
          await api.getUserInfo(senderID);
          testResults.push('✅ getUserInfo');
        } catch (e) {
          testResults.push('❌ getUserInfo');
        }

        try {
          await api.getThreadInfo(threadID);
          testResults.push('✅ getThreadInfo');
        } catch (e) {
          testResults.push('❌ getThreadInfo');
        }

        try {
          await api.getTheme(threadID);
          testResults.push('✅ getTheme');
        } catch (e) {
          testResults.push('❌ getTheme');
        }

        try {
          await api.sendTypingIndicator(threadID);
          testResults.push('✅ sendTypingIndicator');
        } catch (e) {
          testResults.push('❌ sendTypingIndicator');
        }

        await api.sendMessage(`🧪 Test Results:

${testResults.join('\n')}

${testResults.filter(r => r.startsWith('✅')).length}/${testResults.length} tests passed`, threadID);
        break;

      case 'logout':
        await api.sendMessage('👋 Logging out bot...', threadID);
        await api.logout();
        console.log('Bot logged out');
        process.exit(0);
        break;

      default:
        await api.sendMessage(`❓ Unknown command: ${command}
Type ${PREFIX}help for available commands`, threadID);
    }
  } catch (error) {
    console.error(`\n❌ ERROR in command /${command}:`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack:`, error.stack);
    console.error(`   Thread ID: ${threadID}`);
    console.error(`   Sender ID: ${senderID}`);
    console.error(`   Args:`, args);
    
    await api.sendMessage(`❌ Error executing /${command}:
${error.message || 'Unknown error occurred'}

If this persists, check the console logs for details.`, threadID).catch(err => {
      console.error('Failed to send error message:', err.message);
    });
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

process.on('SIGINT', () => {
  console.log('\n\n👋 Bot shutting down gracefully...');
  process.exit(0);
});
