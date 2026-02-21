const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "chessgame",
    aliases: ["chess", "playchess"],
    version: "3.5.0",
    author: "CharlesMK",
    countDown: 5,
    role: 0,
    description: "Visual chess with high-quality assets and auto-storage cleanup",
    category: "game",
    guide: {
      en: "{pn} @user - Start a game\n{pn} move [from] [to] - e.g., move e2 e4\n{pn} board - View the current board\n{pn} resign - End the game"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const { threadID, senderID } = event;
    if (!global.chessGames) global.chessGames = {};

    const action = args[0]?.toLowerCase();

    // --- MAIN GAME HANDLER ---
    if (action === "board" || action === "move" || !action) {
      const game = global.chessGames[threadID];
      
      // Initialize new game if one doesn't exist and a player is mentioned/replied to
      if (!game) {
        let opponentID = event.messageReply?.senderID || Object.keys(event.mentions)[0];
        if (!opponentID) return message.reply("❌ Tag an opponent or reply to their message to start a game!");
        
        global.chessGames[threadID] = this.createNewGame(senderID, opponentID);
        return this.sendBoard(message, global.chessGames[threadID], "♟️ 𝗖𝗛𝗘𝗦𝗦 𝗠𝗔𝗧𝗖𝗛 𝗕𝗘𝗚𝗨𝗡!\nWhite moves first.");
      }

      // Handle Move Action
      if (action === "move") {
        const currentPlayer = game.turn === "white" ? game.white : game.black;
        if (senderID !== currentPlayer) return message.reply("❌ It's not your turn!");

        const moveResult = this.makeMove(game, args[1], args[2]);
        if (!moveResult.success) return message.reply(`❌ ${moveResult.error}`);

        // Check Win Condition (King Capture)
        const winStatus = this.checkWin(game);
        if (winStatus.over) {
          const finalImg = await this.renderBoard(game);
          delete global.chessGames[threadID];
          return message.reply({ 
            body: `🏁 𝗚𝗔𝗠𝗘 𝗢𝗩𝗘𝗥!\n${winStatus.message}`, 
            attachment: fs.createReadStream(finalImg) 
          }, () => { if (fs.existsSync(finalImg)) fs.unlinkSync(finalImg); });
        }

        // Switch turns
        game.turn = game.turn === "white" ? "black" : "white";
        return this.sendBoard(message, game, `✅ Move successful! Next turn: **${game.turn}**`);
      }

      // Default: Show the current board
      return this.sendBoard(message, game, `💬 Current Turn: **${game.turn}**`);
    }

    // Handle Resignation
    if (action === "resign") {
      if (!global.chessGames[threadID]) return message.reply("❌ No active game to resign from.");
      delete global.chessGames[threadID];
      return message.reply("🏳️ 𝗚𝗮𝗺𝗲 𝗘𝗻𝗱𝗲𝗱. The match has been closed.");
    }
  },

  // Helper to send board and trigger automatic file deletion
  sendBoard: async function (message, game, bodyText) {
    const imgPath = await this.renderBoard(game);
    return message.reply({
      body: bodyText,
      attachment: fs.createReadStream(imgPath)
    }, () => {
      // AUTO-CLEANUP: Deletes the file immediately after sending to free server space
      try {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      } catch (err) {
        console.error("Storage Cleanup Error:", err);
      }
    });
  },

  renderBoard: async function (game) {
    const sz = 80; // Size of each square
    const pad = 40; // Padding for coordinates
    const canvasSize = sz * 8 + pad * 2;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext("2d");

    // Draw Background
    ctx.fillStyle = "#312e2b";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw Squares
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        ctx.fillStyle = (r + f) % 2 === 0 ? "#ebecd0" : "#779556";
        ctx.fillRect(pad + f * sz, pad + r * sz, sz, sz);
      }
    }

    // Mapping pieces to your PNG file names
    const pieceMap = {
      'P': 'W_P', 'R': 'W_R', 'N': 'W_N', 'B': 'W_B', 'Q': 'W_Q', 'K': 'W_K',
      'p': 'B_p', 'r': 'B_r', 'n': 'B_n', 'b': 'B_b', 'q': 'B_q', 'k': 'B_k'
    };

    // Draw Pieces using your downloaded PNG assets
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const char = game.board[r][f];
        if (char !== ".") {
          const assetPath = path.join(__dirname, "chess_assets", `${pieceMap[char]}.png`);
          try {
            const img = await loadImage(assetPath);
            // Draw piece with a 5px margin to fit inside squares nicely
            ctx.drawImage(img, pad + f * sz + 5, pad + r * sz + 5, sz - 10, sz - 10);
          } catch (e) {
            // Fallback to text if PNG is missing
            ctx.fillStyle = char === char.toUpperCase() ? "#FFF" : "#000";
            ctx.font = "bold 40px Arial";
            ctx.textAlign = "center";
            ctx.fillText(char, pad + f * sz + sz/2, pad + r * sz + sz/2 + 15);
          }
        }
      }
    }

    // Draw Coordinate Labels (1-8 and a-h)
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    const letters = "abcdefgh";
    for (let i = 0; i < 8; i++) {
      ctx.fillText(letters[i], pad + i * sz + sz/2, pad + sz * 8 + 25); // Files
      ctx.fillText(8 - i, 20, pad + i * sz + sz/2 + 7); // Ranks
    }

    const imgPath = path.join(__dirname, `chess_tmp_${Date.now()}.png`);
    fs.writeFileSync(imgPath, canvas.toBuffer());
    return imgPath;
  },

  createNewGame: function (white, black) {
    return {
      white, black, turn: "white",
      board: [
        ["r", "n", "b", "q", "k", "b", "n", "r"],
        ["p", "p", "p", "p", "p", "p", "p", "p"],
        [".", ".", ".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", ".", ".", ".", "."],
        [".", ".", ".", ".", ".", ".", ".", "."],
        ["P", "P", "P", "P", "P", "P", "P", "P"],
        ["R", "N", "B", "Q", "K", "B", "N", "R"]
      ]
    };
  },

  makeMove: function (game, from, to) {
    if (!from || !to) return { success: false, error: "Usage: move [e2] [e4]" };
    const f = { x: from.charCodeAt(0) - 97, y: 8 - parseInt(from[1]) };
    const t = { x: to.charCodeAt(0) - 97, y: 8 - parseInt(to[1]) };

    // Basic validation
    if (f.x < 0 || f.x > 7 || f.y < 0 || f.y > 7 || t.x < 0 || t.x > 7 || t.y < 0 || t.y > 7) 
        return { success: false, error: "Square is out of bounds!" };

    const piece = game.board[f.y][f.x];
    if (piece === ".") return { success: false, error: "Starting square is empty." };

    // Execute move
    game.board[t.y][t.x] = piece;
    game.board[f.y][f.x] = ".";
    return { success: true };
  },

  checkWin: function (game) {
    let whiteKing = false, blackKing = false;
    game.board.forEach(row => row.forEach(p => {
      if (p === "K") whiteKing = true;
      if (p === "k") blackKing = true;
    }));
    if (!whiteKing) return { over: true, message: "🏆 𝗕𝗹𝗮𝗰𝗸 𝗪𝗶𝗻𝘀! White king has been captured." };
    if (!blackKing) return { over: true, message: "🏆 𝗪𝗵𝗶𝘁𝗲 𝗪𝗶𝗻𝘀! Black king has been captured." };
    return { over: false };
  }
};
