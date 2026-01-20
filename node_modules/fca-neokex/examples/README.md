# NeoKEX-FCA Example Bot

A comprehensive test bot demonstrating all API functions of NeoKEX-FCA.

## Quick Start

```bash
# Make sure you have appstate.json in test/ directory
node examples/test-bot.js
```

## Available Commands

### 📌 Basic Commands
- `/help` - Show all available commands
- `/ping` - Test bot response time
- `/about` - Bot information and stats

### 👤 User Information
- `/me` - Get your user information
- `/user <name>` - Search for a user
- `/friends` - List your friends (first 10)
- `/userid <name>` - Get user ID by name

### 💬 Thread Commands
- `/info` - Get current thread information
- `/history [limit]` - Get message history (default: 5 messages)
- `/members` - List all thread members
- `/photo` - Get thread photo URL

### 🎨 Theme Commands
- `/themes` - List all available themes
- `/theme <name>` - Change thread theme by name or ID
- `/color <hex>` - Change thread color (e.g., `/color #0084ff`)
- `/aitheme <prompt>` - Generate AI theme (e.g., `/aitheme ocean sunset`)

### ✏️ Thread Settings
- `/name <new name>` - Change thread name
- `/emoji <emoji>` - Change thread emoji (e.g., `/emoji 🔥`)
- `/nickname @mention <nickname>` - Set someone's nickname

### 📎 Messaging Features
- `/typing` - Send typing indicator
- `/react <emoji>` - React to your command message
- `/unsend` - Unsend your command message
- `/poll <question> | <option1> | <option2>` - Create a poll

### 🔍 Search Commands
- `/search <query>` - Search for users
- `/searchthread <query>` - Search for threads

### 📊 Status & Testing
- `/status` - Bot status and uptime
- `/test` - Run quick API function tests

## Examples

```
/ping
→ 🏓 Pong! Response time: 123ms

/search John Doe
→ 🔍 Search results for "John Doe"...

/theme love
→ ✅ Theme changed to: love

/poll Best pizza? | Pepperoni | Hawaiian | Veggie
→ Creates a poll with 3 options

/test
→ Runs 4 quick API tests
```

## Features Tested

This bot demonstrates:
- ✅ Message listening (MQTT)
- ✅ User information retrieval
- ✅ Thread management
- ✅ Theme operations (GraphQL + MQTT)
- ✅ Search functionality
- ✅ Messaging features
- ✅ Thread customization
- ✅ Status monitoring

## API Functions Coverage

**Total Functions Tested: 25+**
- Authentication & Session
- Messaging (send, react, unsend)
- Thread Management (info, history, members)
- User Search & Info
- Theme Operations (list, change, AI generation)
- Thread Settings (name, emoji, nickname)
- Typing indicators
- Polls
- Search operations

## Notes

- All commands use `/` prefix
- Some commands require MQTT connection
- Theme changes require MQTT to be active
- Error handling included for all commands
- Responds with helpful error messages

## Troubleshooting

**Bot not responding?**
- Check MQTT connection status
- Verify appstate.json is valid
- Ensure bot has permission in the thread

**Commands failing?**
- Use `/status` to check bot health
- Use `/test` to verify API functions
- Check console for error messages

## Architecture

```
test-bot.js
├── Login with appstate
├── Initialize MQTT listener
├── Parse commands (prefix: /)
├── Route to command handlers
└── Error handling & logging
```

Built with NeoKEX-FCA v4.4.4 - 98.2% API success rate
