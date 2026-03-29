var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}
__name(json, "json");
function genCode() {
  let code = "";
  for (let i = 0; i < 4; i++) code += Math.floor(Math.random() * 10);
  return code;
}
__name(genCode, "genCode");
var GameRoom = class {
  static {
    __name(this, "GameRoom");
  }
  constructor(state, env) {
    this.state = state;
    this.game = null;
  }
  async loadGame() {
    if (!this.game) {
      this.game = await this.state.storage.get("game") || null;
    }
    return this.game;
  }
  async saveGame() {
    await this.state.storage.put("game", this.game);
    this.state.storage.setAlarm(Date.now() + 864e5);
  }
  async alarm() {
    await this.state.storage.deleteAll();
    this.game = null;
  }
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }
    try {
      if (method === "POST" && path === "/init") {
        const body = await request.json();
        this.game = body.game;
        await this.saveGame();
        return json({ ok: true, code: this.game.code, game: this.game });
      }
      if (method === "GET" && path === "/state") {
        const game = await this.loadGame();
        if (!game) return json({ ok: false, error: "Game not found" }, 404);
        return json({ ok: true, game });
      }
      if (method === "PUT" && path === "/join") {
        const game = await this.loadGame();
        if (!game) return json({ ok: false, error: "Game not found" }, 404);
        const body = await request.json();
        const devId = body.deviceId || "";
        const joinRole = body.role || "joiner"; // "joiner" or "viewer"
        // Allow existing devices to reconnect after refresh even when finished
        if (game.status === "finished") {
          if (devId && game.devices && game.devices[devId]) {
            return json({ ok: true, game });
          }
          return json({ ok: false, error: "Game already finished" }, 400);
        }
        // Register device if not already registered
        if (!game.devices) game.devices = {};
        if (devId && !game.devices[devId]) {
          const existingCount = Object.keys(game.devices).length;
          game.devices[devId] = { role: joinRole, index: existingCount };
        } else if (devId && game.devices[devId] && body.role) {
          // Update role if explicitly provided (e.g. switched from joiner to viewer)
          game.devices[devId].role = joinRole;
        }
        game.lastUpdate = Date.now();
        await this.saveGame();
        return json({ ok: true, game });
      }
      if (method === "PUT" && path === "/claim") {
        const game = await this.loadGame();
        if (!game) return json({ ok: false, error: "Game not found" }, 404);
        const body = await request.json();
        const devId = body.deviceId || "joiner";
        (body.players || []).forEach((p) => {
          if (game.players.includes(p)) game.claimed[p] = devId;
        });
        game.lastUpdate = Date.now();
        await this.saveGame();
        return json({ ok: true, game });
      }
      if (method === "PUT" && path === "/start") {
        const game = await this.loadGame();
        if (!game) return json({ ok: false, error: "Game not found" }, 404);
        game.status = "playing";
        game.currentHole = 0;
        // Build per-device confirmed map
        const confirmedInit = {};
        Object.keys(game.devices || {}).forEach(devId => { confirmedInit[devId] = false; });
        game.holes[1] = { scores: {}, putts: {}, ups: {}, upOrder: [], water: {}, ob: {}, confirmed: confirmedInit };
        game.lastUpdate = Date.now();
        await this.saveGame();
        return json({ ok: true, game });
      }
      if (method === "PUT" && path === "/score") {
        const game = await this.loadGame();
        if (!game) return json({ ok: false, error: "Game not found" }, 404);
        const body = await request.json();
        const hole = body.hole || game.currentHole;
        if (!game.holes[hole]) {
          const confirmedInit = {};
          Object.keys(game.devices || {}).forEach(devId => { confirmedInit[devId] = false; });
          game.holes[hole] = { scores: {}, putts: {}, ups: {}, upOrder: [], water: {}, ob: {}, confirmed: confirmedInit };
        }
        const h = game.holes[hole];
        // Use deviceId to determine which players this device can modify
        const devId = body.deviceId || body.role || "";
        const allowedPlayers = game.players.filter((p) => game.claimed[p] === devId);
        if (body.scores) Object.keys(body.scores).forEach((p) => {
          if (allowedPlayers.includes(p)) h.scores[p] = body.scores[p];
        });
        if (body.putts) Object.keys(body.putts).forEach((p) => {
          if (allowedPlayers.includes(p)) h.putts[p] = body.putts[p];
        });
        if (body.ups) Object.keys(body.ups).forEach((p) => {
          if (allowedPlayers.includes(p)) h.ups[p] = body.ups[p];
        });
        if (body.upOrder) h.upOrder = body.upOrder;
        if (body.water) Object.keys(body.water).forEach((p) => {
          if (allowedPlayers.includes(p)) h.water[p] = body.water[p];
        });
        if (body.ob) Object.keys(body.ob).forEach((p) => {
          if (allowedPlayers.includes(p)) h.ob[p] = body.ob[p];
        });
        // Confirm per-device
        if (body.confirmed !== undefined && devId) {
          if (!h.confirmed) h.confirmed = {};
          h.confirmed[devId] = body.confirmed;
        }
        // Only creator pushes totalMoney
        const devInfo = (game.devices || {})[devId];
        if (devInfo && devInfo.role === 'creator') {
          if (body.totalMoney) game.totalMoney = body.totalMoney;
          if (body.moneyDetails) game.moneyDetails = body.moneyDetails;
          if (body.totalSpent) game.totalSpent = body.totalSpent;
        }
        game.lastUpdate = Date.now();
        await this.saveGame();
        return json({ ok: true, game });
      }
      if (method === "PUT" && path === "/next") {
        const game = await this.loadGame();
        if (!game) return json({ ok: false, error: "Game not found" }, 404);
        const body = await request.json();
        if (body.totalMoney) game.totalMoney = body.totalMoney;
        if (body.moneyDetails) game.moneyDetails = body.moneyDetails;
        if (body.allScores) game.allScores = body.allScores;
        if (body.allUps) game.allUps = body.allUps;
        if (body.allUpOrders) game.allUpOrders = body.allUpOrders;
        if (body.allPutts) game.allPutts = body.allPutts;
        if (body.allWater) game.allWater = body.allWater;
        if (body.allOb) game.allOb = body.allOb;
        if (body.totalSpent) game.totalSpent = body.totalSpent;
        if (body.completedHoles) game.completedHoles = body.completedHoles;
        if (body.prizePool !== undefined) game.prizePool = body.prizePool;
        const nextHole = body.nextHole || game.currentHole + 1;
        game.currentHole = nextHole;
        const nextHoleNum = body.nextHoleNum || nextHole;
        if (!game.holes[nextHoleNum]) {
          const confirmedInit = {};
          Object.keys(game.devices || {}).forEach(devId => { confirmedInit[devId] = false; });
          game.holes[nextHoleNum] = { scores: {}, putts: {}, ups: {}, upOrder: [], water: {}, ob: {}, confirmed: confirmedInit };
        }
        if (body.finished) game.status = "finished";
        game.lastUpdate = Date.now();
        await this.saveGame();
        return json({ ok: true, game });
      }
      if (method === "PUT" && path === "/edit") {
        const game = await this.loadGame();
        if (!game) return json({ ok: false, error: "Game not found" }, 404);
        const body = await request.json();
        if (body.allScores) game.allScores = body.allScores;
        if (body.allUps) game.allUps = body.allUps;
        if (body.allUpOrders) game.allUpOrders = body.allUpOrders;
        if (body.allPutts) game.allPutts = body.allPutts;
        if (body.allWater) game.allWater = body.allWater;
        if (body.allOb) game.allOb = body.allOb;
        if (body.totalMoney) game.totalMoney = body.totalMoney;
        if (body.moneyDetails) game.moneyDetails = body.moneyDetails;
        if (body.totalSpent) game.totalSpent = body.totalSpent;
        if (body.completedHoles) game.completedHoles = body.completedHoles;
        if (body.prizePool !== undefined) game.prizePool = body.prizePool;
        // Edit log + edited hole marker for cross-device sync
        if (body.editLog) game.editLog = body.editLog;
        if (body.editedHole) game.editedHole = body.editedHole;
        // 更新被编辑洞的 holes 数据
        if (body.editedHole && body.editedHoleData) {
          if (!game.holes[body.editedHole]) {
            const confirmedInit = {};
            Object.keys(game.devices || {}).forEach(devId => { confirmedInit[devId] = false; });
            game.holes[body.editedHole] = { scores: {}, putts: {}, ups: {}, upOrder: [], water: {}, ob: {}, confirmed: confirmedInit };
          }
          const h = game.holes[body.editedHole];
          if (body.editedHoleData.scores) h.scores = { ...h.scores, ...body.editedHoleData.scores };
          if (body.editedHoleData.putts) h.putts = { ...h.putts, ...body.editedHoleData.putts };
          if (body.editedHoleData.ups) h.ups = { ...h.ups, ...body.editedHoleData.ups };
          if (body.editedHoleData.upOrder) h.upOrder = body.editedHoleData.upOrder;
        }
        game.lastUpdate = Date.now();
        await this.saveGame();
        return json({ ok: true, game });
      }
      return json({ ok: false, error: "Not found" }, 404);
    } catch (err) {
      return json({ ok: false, error: err.message }, 500);
    }
  }
};
var worker_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    try {
      if (method === "POST" && path === "/api/game/create") {
        const body = await request.json();
        const code = genCode();
        const game = {
          code,
          status: "lobby",
          createdAt: Date.now(),
          course: body.course || {},
          gameMode: body.gameMode || "matchPlay",
          stake: body.stake || 0,
          jumboMode: body.jumboMode || false,
          players: body.players || [],
          playerNames: body.playerNames || body.players || [],
          pars: body.pars || {},
          handicaps: body.handicaps || {},
          advanceMode: body.advanceMode || "off",
          advancePlayers: body.advancePlayers || {},
          claimed: {},
          devices: {},
          creatorDevice: body.deviceId || "",
          currentHole: 1,
          holes: {},
          holesList: body.holesList || [],
          totalMoney: {},
          moneyDetails: {},
          completedHoles: [],
          allScores: {},
          allUps: {},
          allUpOrders: {},
          allPutts: {},
          allWater: {},
          allOb: {},
          totalSpent: {},
          lastUpdate: Date.now()
        };
        body.players.forEach((p) => {
          game.claimed[p] = body.deviceId || "creator";
        });
        game.devices[body.deviceId || "creator"] = { role: "creator", index: 0 };
        const id = env.GAME_ROOMS.idFromName(code);
        const stub = env.GAME_ROOMS.get(id);
        return stub.fetch(new Request("https://do/init", {
          method: "POST",
          body: JSON.stringify({ game })
        }));
      }
      const gameMatch = path.match(/^\/api\/game\/(\d{4})(\/.*)?$/);
      if (gameMatch) {
        const code = gameMatch[1];
        const subPath = gameMatch[2] || "";
        const id = env.GAME_ROOMS.idFromName(code);
        const stub = env.GAME_ROOMS.get(id);
        let doPath = "/state";
        if (subPath === "/join") doPath = "/join";
        else if (subPath === "/claim") doPath = "/claim";
        else if (subPath === "/start") doPath = "/start";
        else if (subPath === "/score") doPath = "/score";
        else if (subPath === "/next") doPath = "/next";
        else if (subPath === "/edit") doPath = "/edit";
        return stub.fetch(new Request(`https://do${doPath}`, {
          method,
          headers: request.headers,
          body: method !== "GET" ? request.body : void 0
        }));
      }
      // ===== Feedback API =====
      if (method === "POST" && path === "/api/feedback") {
        const body = await request.json();
        const id = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const entry = {
          id,
          rating: body.rating || 0,
          categories: body.categories || [],
          comment: body.comment || "",
          course: body.course || "",
          lang: body.lang || "en",
          ts: body.ts || new Date().toISOString(),
          ua: body.ua || "",
        };
        // Store in KV — key = id, value = JSON, expire in 365 days
        await env.FEEDBACK.put(id, JSON.stringify(entry), { expirationTtl: 86400 * 365 });
        // Also maintain an index list (last 500 feedback ids)
        let index = [];
        try {
          const raw = await env.FEEDBACK.get("_index");
          if (raw) index = JSON.parse(raw);
        } catch {}
        index.unshift(id);
        if (index.length > 500) index = index.slice(0, 500);
        await env.FEEDBACK.put("_index", JSON.stringify(index));
        return json({ ok: true, id });
      }
      if (method === "GET" && path === "/api/feedback") {
        const key = url.searchParams.get("key");
        if (key !== "kk130forever") {
          return json({ ok: false, error: "Unauthorized" }, 401);
        }
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
        let index = [];
        try {
          const raw = await env.FEEDBACK.get("_index");
          if (raw) index = JSON.parse(raw);
        } catch {}
        const ids = index.slice(0, limit);
        const entries = [];
        for (const id of ids) {
          const raw = await env.FEEDBACK.get(id);
          if (raw) entries.push(JSON.parse(raw));
        }
        return json({ ok: true, count: entries.length, total: index.length, entries });
      }
      if (method === "GET" && path === "/api/feedback/view") {
        const key = url.searchParams.get("key");
        if (key !== "kk130forever") {
          return new Response("Unauthorized", { status: 401 });
        }
        // Return a simple HTML dashboard
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);
        let index = [];
        try {
          const raw = await env.FEEDBACK.get("_index");
          if (raw) index = JSON.parse(raw);
        } catch {}
        const ids = index.slice(0, limit);
        const entries = [];
        for (const id of ids) {
          const raw = await env.FEEDBACK.get(id);
          if (raw) entries.push(JSON.parse(raw));
        }
        const stars = (n) => "⭐".repeat(n) + "☆".repeat(5 - n);
        const esc = (s) => String(s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const rows = entries.map((e, i) => `
          <div class="card">
            <div class="card-head">
              <span class="card-time">${esc(e.ts?.slice(0, 16).replace("T", " "))}</span>
            </div>
            <div class="card-stars">${stars(e.rating)}</div>
            ${e.course ? `<div class="card-course">⛳ ${esc(e.course)}</div>` : ""}
            ${(e.categories || []).length ? `<div class="card-cats">${(e.categories || []).map(c => `<span class="cat">${esc(c)}</span>`).join("")}</div>` : ""}
            ${e.comment ? `<div class="card-comment">${esc(e.comment)}</div>` : ""}
          </div>`).join("");
        const avgRating = entries.length ? (entries.reduce((s, e) => s + (e.rating || 0), 0) / entries.length).toFixed(1) : "-";
        const dist = [1,2,3,4,5].map(s => entries.filter(e => e.rating === s).length);
        const maxDist = Math.max(...dist, 1);
        const distBars = [5,4,3,2,1].map(s => `<div class="bar-row"><span class="bar-label">${s}⭐</span><div class="bar-track"><div class="bar-fill" style="width:${(dist[s-1]/maxDist*100).toFixed(0)}%"></div></div><span class="bar-count">${dist[s-1]}</span></div>`).join("");
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
          <title>HandinCap Feedback</title>
          <style>
            *{box-sizing:border-box}
            body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;padding:12px;background:#f3f4f6;color:#111827}
            .header{background:linear-gradient(135deg,#166534,#15803d);color:white;padding:20px 16px;border-radius:12px;margin-bottom:12px}
            .header h1{margin:0;font-size:20px}
            .header p{margin:4px 0 0;font-size:13px;color:#bbf7d0}
            .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}
            .stat{background:white;padding:12px;border-radius:10px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.08)}
            .stat b{display:block;font-size:26px;color:#166534;margin-top:2px}
            .stat span{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px}
            .dist{background:white;padding:14px;border-radius:10px;margin-bottom:12px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
            .dist h3{margin:0 0 10px;font-size:14px;color:#374151}
            .bar-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
            .bar-label{font-size:12px;width:32px;text-align:right;flex-shrink:0}
            .bar-track{flex:1;height:14px;background:#f3f4f6;border-radius:7px;overflow:hidden}
            .bar-fill{height:100%;background:linear-gradient(90deg,#059669,#10b981);border-radius:7px;min-width:2px;transition:width .3s}
            .bar-count{font-size:12px;color:#6b7280;width:24px;flex-shrink:0}
            .card{background:white;border-radius:12px;padding:14px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
            .card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
            .card-time{font-size:12px;color:#9ca3af}
            .card-stars{font-size:20px;margin-bottom:6px;letter-spacing:2px}
            .card-course{font-size:13px;color:#166534;margin-bottom:6px}
            .card-cats{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
            .cat{font-size:12px;background:#ecfdf5;color:#065f46;padding:4px 10px;border-radius:99px;white-space:nowrap}
            .card-comment{font-size:14px;color:#374151;background:#f9fafb;padding:10px 12px;border-radius:8px;line-height:1.5;white-space:pre-wrap;word-break:break-word}
            .empty{text-align:center;padding:60px 20px;color:#9ca3af;font-size:15px}
            @media(min-width:768px){
              body{max-width:700px;margin:0 auto;padding:20px}
              .stats{grid-template-columns:repeat(3,1fr)}
            }
          </style></head>
          <body>
            <div class="header"><h1>💬 HandinCap Feedback</h1><p>Dashboard · ${entries.length} of ${index.length} entries</p></div>
            <div class="stats">
              <div class="stat"><span>Total</span><b>${index.length}</b></div>
              <div class="stat"><span>Avg Rating</span><b>${avgRating} ⭐</b></div>
              <div class="stat"><span>Showing</span><b>${entries.length}</b></div>
            </div>
            ${entries.length ? `<div class="dist"><h3>Rating Distribution</h3>${distBars}</div>` : ""}
            ${rows || '<div class="empty">No feedback yet 📭</div>'}
          </body></html>`;
        return new Response(html, { headers: { "Content-Type": "text/html;charset=utf-8" } });
      }

      return json({ ok: false, error: "Not found", path }, 404);
    } catch (err) {
      return json({ ok: false, error: err.message }, 500);
    }
  }
};
export {
  GameRoom,
  worker_default as default
};
//# sourceMappingURL=worker.js.map