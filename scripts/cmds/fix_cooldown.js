const fs = require('fs');
const path = require('path');

// Adjusted to your path: scripts/cmds
const cmdsPath = path.join(__dirname, 'scripts', 'cmds'); 

if (!fs.existsSync(cmdsPath)) {
    console.log("❌ Path not found: " + cmdsPath);
    process.exit();
}

const files = fs.readdirSync(cmdsPath).filter(file => file.endsWith('.js'));

files.forEach(file => {
    let filePath = path.join(cmdsPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Generate a random number between 5 and 10
    const randomTime = Math.floor(Math.random() * (10 - 5 + 1) + 5);

    if (content.includes('countDown:')) {
        content = content.replace(/countDown:\s*\d+/, `countDown: ${randomTime}`);
    } else if (content.includes('config: {')) {
        content = content.replace('config: {', `config: {\n    countDown: ${randomTime},`);
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file} -> Set to ${randomTime}s`);
});
console.log("🚀 All commands updated with randomized cooldowns!");
