+cmd install autodl.js const axios = require("axios");
const fs = require("fs");
const path = require("path");

const a = {
  y: /(youtube\.com|youtu\.be)/i,
  s: /(spotify\.com|spotify\.link)/i,
  i: /(imgur\.com|i\.imgur\.com)/i,
  p: /(pinterest\.com|pin\.it)/i,
  b: /(imgbb\.com|ibb\.co)/i
};

function b(u) {
  return {
    y: a.y.test(u),
    s: a.s.test(u),
    i: a.i.test(u) || a.p.test(u) || a.b.test(u)
  };
}

async function c(u, api, t, m) {
  api.setMessageReaction("⏳", m, () => {}, true);

  let r;
  try {
    r = await axios.get(
      `https://downvid.onrender.com/api/download?url=${encodeURIComponent(u)}`,
      { timeout: 60000 }
    );
  } catch {
    api.setMessageReaction("❌", m, () => {}, true);
    return;
  }

  const d = r?.data;
  if (!d || d.status !== "success") {
    api.setMessageReaction("❌", m, () => {}, true);
    return;
  }

  const e = d?.data?.data || {};
  const v = d.video || e.nowm || null;
  const a2 = d.audio || null;
  const i2 = d.image || e.image || null;

  const f = b(u);
  let g = [];
  let h = "✅ Downloaded\n\n";

  if (f.s) {
    if (!a2) return api.setMessageReaction("❌", m, () => {}, true);
    g.push({ u: a2, t: "a" });
    h = "✅ Spotify Audio 🎧\n\n";
  }

  else if (f.y) {
    if (!v) return api.setMessageReaction("❌", m, () => {}, true);
    g.push({ u: v, t: "v" });
    h = "✅ YouTube Video 🎬\n\n";
  }

  else if (f.i) {
    if (!i2 && !v) return api.setMessageReaction("❌", m, () => {}, true);
    g.push({ u: i2 || v, t: "i" });
    h = "✅ Image 🖼️\n\n";
  }

  else {
    if (v) g.push({ u: v, t: "v" });
    else if (a2) g.push({ u: a2, t: "a" });
    else if (i2) g.push({ u: i2, t: "i" });
    else return api.setMessageReaction("❌", m, () => {}, true);
  }

  const k = path.join(__dirname, "cache");
  if (!fs.existsSync(k)) fs.mkdirSync(k, { recursive: true });

  const l = [];
  const n = [];

  try {
    for (const o of g) {
      const ext = o.t === "a" ? "mp3" : o.t === "i" ? "jpg" : "mp4";
      const p = path.join(k, `autodl_${Date.now()}_${Math.random()}.${ext}`);

      const q = await axios.get(o.u, {
        responseType: "arraybuffer",
        timeout: 120000
      });

      fs.writeFileSync(p, q.data);
      l.push(fs.createReadStream(p));
      n.push(p);
    }

    await api.sendMessage(
      {
        body: `${h}📌 ${e.title || "Media"}`,
        attachment: l
      },
      t,
      () => n.forEach(x => { try { fs.unlinkSync(x); } catch {} }),
      m
    );

    api.setMessageReaction("✅", m, () => {}, true);
  } catch {
    n.forEach(x => { try { fs.unlinkSync(x); } catch {} });
    api.setMessageReaction("❌", m, () => {}, true);
  }
}

module.exports = {
  config: {
    name: "autodl",
    version: "1.2",
    author: "Charles MK",
    category: "media",
    guide: "{pn} <url> or paste video link"
  },

  onStart: async function d({ api, event, args }) {
    const u = args.join(" ").match(/https?:\/\/\S+/i)?.[0];
    if (!u) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return;
    }
    await c(u, api, event.threadID, event.messageID);
  },

  onChat: async function e({ api, event }) {
    const u = event.body?.match(/https?:\/\/\S+/i)?.[0];
    if (!u) return;
    await c(u, api, event.threadID, event.messageID);
  }
};
