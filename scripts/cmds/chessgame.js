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
    description: "Visual chess with auto-storage cleanup",
    category: "game",
    guide: {
      en: "{pn} @user - Start game\n{pn} move [from] [to]\n{pn} board - View board"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const { threadID, senderID } = event;
    if (!global.chessGames) global.chessGames = {};

    const action = args[0]?.toLowerCase();

    // --- GAME ACTIONS ---
    if (action === "board" || action === "move" || !action) {
      const game = global.chessGames[threadID];
      
      // Start logic if no game and a mention exists
      if (!game) {
        let opponentID = event.messageReply?.senderID || Object.keys(event.mentions)[0];
        if (!opponentID) return message.reply("❌ Tag an opponent to start!");
        
        global.chessGames[threadID] = this.createNewGame(senderID, opponentID);
        return this.sendBoard(message, global.chessGames[threadID], "♟️ Game Started!");
      }

      // Move logic
      if (action === "move") {
        const currentPlayer = game.turn === "white" ? game.white : game.black;
        if (senderID !== currentPlayer) return message.reply("❌ It's not your turn!");

        const moveResult = this.makeMove(game, args[1], args[2]);
        if (!moveResult.success) return message.reply(`❌ ${moveResult.error}`);

        const winStatus = this.checkWin(game);
        if (winStatus.over) {
          const finalImg = await this.renderBoard(game);
          delete global.chessGames[threadID];
          return message.reply({ body: winStatus.message, attachment: fs.createReadStream(finalImg) }, 
            () => fs.unlinkSync(finalImg));
        }

        game.turn = game.turn === "white" ? "black" : "white";
        return this.sendBoard(message, game, `✅ Success! Next: ${game.turn}`);
      }

      // Just show board
      return this.sendBoard(message, game, `Current Turn: ${game.turn}`);
    }

    if (action === "resign") {
      delete global.chessGames[threadID];
      return message.reply("🏳️ Game ended by resignation.");
    }
  },

  sendBoard: async function (message, game, bodyText) {
    const imgPath = await this.renderBoard(game);
    return message.reply({
      body: bodyText,
      attachment: fs.createReadStream(imgPath)
    }, () => {
      // Storage Cleanup: Delete file after it is sent to the user
      try {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      } catch (err) {
        console.error("Cleanup error:", err);
      }
    });
  },

  renderBoard: async function (game) {
    const sz = 80; 
    const pad = 40;
    const canvasSize = sz * 8 + pad * 2;
    const canvas = createCanvas(canvasSize, canvasSize);
    const ctx = canvas.getContext("2d");

    // Background & Board
    ctx.fillStyle = "#312e2b";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        ctx.fillStyle = (r + f) % 2 === 0 ? "#ebecd0" : "#779556";
        ctx.fillRect(pad + f * sz, pad + r * sz, sz, sz);
      }
    }

    // Piece Mapping for your Wikimedia Assets
    const pieceMap = {
      'P': 'W_P', 'R': 'W_R', 'N': 'W_N', 'B': 'W_B', 'Q': 'W_Q', 'K': 'W_K',
      'p': 'B_p', 'r': 'B_r', 'n': 'B_n', 'b': 'B_b', 'q': 'B_q', 'k': 'B_k'
    };

    // Piece Drawing Logic
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const char = game.board[r][f];
        if (char !== ".") {
          const assetPath = path.join(__dirname, "chess_assets", `${pieceMap[char]}.png`);
          try {
            const img = await loadImage(assetPath);
            ctx.drawImage(img, pad + f * sz + 5, pad + r * sz + 5, sz - 10, sz - 10);
          } catch (e) {
            // Text fallback if image is missing
            ctx.fillStyle = char === char.toUpperCase() ? "#FFF" : "#000";
            ctx.font = "40px Arial";
            ctx.fillText(char, pad + f * sz + 25, pad + r * sz + 55);
          }
        }
      }
    }

    const imgPath = path.join(__dirname, `temp_chess_${Date.now()}.png`);
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
    if (!from || !to) return { success: false, error: "Use: move e2 e4" };
    const f = { x: from.charCodeAt(0) - 97, y: 8 - parseInt(from[1]) };
    const t = { x: to.charCodeAt(0) - 97, y: 8 - parseInt(to[1]) };

    if (f.x < 0 || f.x > 7 || f.y < 0 || f.y > 7 || t.x < 0 || t.x > 7 || t.y < 0 || t.y > 7) 
        return { success: false, error: "Out of bounds!" };

    const piece = game.board[f.y][f.x];
    if (piece === ".") return { success: false, error: "No piece there." };

    game.board[t.y][t.x] = piece;
    game.board[f.y][f.x] = ".";
    return { success: true };
  },

  checkWin: function (game) {
    let wk = false, bk = false;
    game.board.forEach(r => r.forEach(p => {
      if (p === "K") wk = true;
      if (p === "k") bk = true;
    }));
    if (!wk) return { over: true, message: "🏆 Black Wins!" };
    if (!bk) return { over: true, message: "🏆 White Wins!" };
    return { over: false };
  }
};
