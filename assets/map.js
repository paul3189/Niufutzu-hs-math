/* 高中數學｜工具地圖引擎
 * 依 TOOLMAP 資料自動排版心智圖（SVG）、明細抽屜、關鍵字全域搜尋。
 * 樹的形狀固定為三層：根 → 分支 → 葉。左右各半，欄位對齊。
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var FS_ROOT = 20, FS_BR = 16, FS_LF = 14;
  var ROW = 34, GAP = 20, PADX = 14;
  var BP = 860;                        // 小於這個寬度自動改用清單模式
  var VIEW_KEY = "hsmath.view";        // 'auto' | 'map' | 'list'

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/\n/g, " ");
  }
  function viewPref() {
    try { return localStorage.getItem(VIEW_KEY) || "auto"; } catch (e) { return "auto"; }
  }
  function setViewPref(v) { try { localStorage.setItem(VIEW_KEY, v); } catch (e) {} }
  function viewMode() {
    var p = viewPref();
    if (p === "map" || p === "list") return p;
    return window.innerWidth < BP ? "list" : "map";
  }

  /* 主題色：有載入 theme-cow.css 就用牛夫子的深酒紅，沒有就沿用原本的深灰。
   * SVG 的 fill 不吃 CSS 變數，所以在畫之前先把變數的值讀出來。 */
  function themeVar(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }
  function rootFill() { return themeVar("--cow-wine-d", "#1f2937"); }
  function rootStroke() { return themeVar("--cow-wine", "#111827"); }

  /* 這一份網站有沒有包含章節頁？見 data/site.js。沒有載入 site.js 就當作「有」（＝完整版）。 */
  function hasChapters() {
    return !(window.SITE && window.SITE.chapters === false);
  }

  /* 長公式自動換列：實作在 assets/mathfit.js，這裡只是轉呼叫。
     沒載入 mathfit.js 時就維持原本「可以左右拉」的行為，不會壞掉。 */
  function fitMath(root) {
    if (window.MathFit) window.MathFit.fit(root);
  }

  /* 估算文字寬度：CJK 視為 1 em，半形視為 0.55 em */
  function textW(s, fs) {
    var w = 0;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      w += (c > 0x2e80) ? 1 : 0.56;
    }
    return w * fs;
  }
  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function shade(hex, amt) {  // amt<1 變深、>1 變亮（往白）
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    function m(v) {
      var x = amt <= 1 ? v * amt : v + (255 - v) * (amt - 1);
      return Math.max(0, Math.min(255, Math.round(x)));
    }
    return "rgb(" + m(r) + "," + m(g) + "," + m(b) + ")";
  }

  /* ── 心智圖繪製 ──
   * root = { label, children:[ { label, color, data?, children:[{label, data?}] } ] }
   * onPick(node) 於點擊節點時呼叫
   */
  function drawMindmap(mountId, root, onPick) {
    var mount = document.getElementById(mountId);
    if (!mount) return;
    mount.innerHTML = "";

    var brs = root.children || [];
    // 依「葉數」左右平衡分配
    var leafOf = function (b) { return Math.max(1, (b.children || []).length); };
    var total = brs.reduce(function (s, b) { return s + leafOf(b); }, 0);
    var right = [], left = [], acc = 0;
    brs.forEach(function (b) {
      if (acc < total / 2) { right.push(b); acc += leafOf(b); }
      else left.push(b);
    });

    // 量測寬度
    var rootW = textW(root.label, FS_ROOT) + 34;
    var maxBrW = 0, maxLfW = 0;
    brs.forEach(function (b) {
      maxBrW = Math.max(maxBrW, textW(b.label, FS_BR) + PADX * 2);
      (b.children || []).forEach(function (l) {
        maxLfW = Math.max(maxLfW, textW(l.label, FS_LF) + PADX * 2);
      });
    });

    var COL1 = rootW / 2 + 66;              // 分支欄的「內側」x 偏移
    var COL2 = COL1 + maxBrW + 74;          // 葉欄的「內側」x 偏移
    var halfW = COL2 + maxLfW + 30;
    var W = halfW * 2;

    // 垂直排版
    function stack(list) {
      var y = 0, out = [];
      list.forEach(function (b) {
        var kids = b.children || [], h = Math.max(1, kids.length) * ROW;
        var item = { b: b, y: y + h / 2, kids: [] };
        kids.forEach(function (k, i) { item.kids.push({ k: k, y: y + (i + 0.5) * ROW }); });
        out.push(item);
        y += h + GAP;
      });
      return { items: out, h: Math.max(0, y - GAP) };
    }
    var R = stack(right), L = stack(left);
    var H = Math.max(R.h, L.h, 120) + 80;
    var cy = H / 2;
    var offR = cy - R.h / 2, offL = cy - L.h / 2;

    var svg = el("svg", { width: W, height: H, viewBox: "0 0 " + W + " " + H });
    var cx = W / 2;

    function box(g, x, y, w, h, fill, stroke, rx) {
      g.appendChild(el("rect", { x: x, y: y - h / 2, width: w, height: h, rx: rx, fill: fill, stroke: stroke, "stroke-width": 1.5 }));
    }
    function label(g, x, y, s, fs, fill, anchor, weight) {
      var t = el("text", { x: x, y: y + fs * 0.35, "font-size": fs, fill: fill, "text-anchor": anchor || "middle" });
      if (weight) t.setAttribute("font-weight", weight);
      t.textContent = s;
      g.appendChild(t);
    }
    function link(x1, y1, x2, y2, color, w) {
      var mx = (x1 + x2) / 2;
      svg.appendChild(el("path", {
        d: "M" + x1 + "," + y1 + " C" + mx + "," + y1 + " " + mx + "," + y2 + " " + x2 + "," + y2,
        stroke: color, "stroke-width": w, class: "mm-link", "stroke-linecap": "round", opacity: .75
      }));
    }

    function side(pack, off, dir) {  // dir = +1 右、-1 左
      pack.items.forEach(function (it) {
        var b = it.b, by = it.y + off;
        var bw = textW(b.label, FS_BR) + PADX * 2;
        var bx = dir > 0 ? cx + COL1 : cx - COL1 - bw;
        var col = b.color || "#2563eb";

        link(cx + dir * (rootW / 2), cy, dir > 0 ? bx : bx + bw, by, col, 3);

        var g = el("g", { class: "mm-node" });
        box(g, bx, by, bw, 30, shade(col, 1.86), col, 9);
        label(g, bx + bw / 2, by, b.label, FS_BR, shade(col, .68), "middle", 700);
        if (onPick) g.addEventListener("click", function () { onPick(b); });
        svg.appendChild(g);

        it.kids.forEach(function (kk) {
          var ky = kk.y + off, k = kk.k;
          var kw = textW(k.label, FS_LF) + PADX * 2;
          var kx = dir > 0 ? cx + COL2 : cx - COL2 - kw;
          link(dir > 0 ? bx + bw : bx, by, dir > 0 ? kx : kx + kw, ky, col, 1.8);
          var gk = el("g", { class: "mm-node leaf" });
          box(gk, kx, ky, kw, 26, "#ffffff", shade(col, 1.55), 7);
          label(gk, kx + kw / 2, ky, k.label, FS_LF, "#374151", "middle");
          if (onPick) gk.addEventListener("click", function () { onPick(k); });
          svg.appendChild(gk);
        });
      });
    }
    side(R, offR, 1);
    side(L, offL, -1);

    // 根節點（最後畫，蓋在線上方）
    var gr = el("g", { class: "mm-node" });
    box(gr, cx - rootW / 2, cy, rootW, 46, rootFill(), rootStroke(), 14);
    label(gr, cx, cy, root.label, FS_ROOT, "#ffffff", "middle", 800);
    svg.appendChild(gr);

    mount.appendChild(svg);
    return svg;
  }

  /* ── 明細抽屜 ── */
  function ensureDrawer() {
    var d = document.getElementById("mmDrawer");
    if (d) return d;
    d = document.createElement("div");
    d.id = "mmDrawer";
    d.className = "mm-drawer";
    d.innerHTML = '<div class="dw-head"><h3 id="dwTitle"></h3>' +
      '<button class="dw-x" id="dwX">✕</button></div><div class="dw-body" id="dwBody"></div>';
    document.body.appendChild(d);
    d.querySelector("#dwX").addEventListener("click", function () { d.classList.remove("open"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") d.classList.remove("open"); });
    return d;
  }

  function sec(labCls, labTxt, html, cls) {
    if (!html) return "";
    return '<div class="dw-sec"><div class="dw-lab ' + labCls + '">' + labTxt + '</div>' +
      '<div class="' + (cls || "dw-txt") + '">' + html + "</div></div>";
  }

  /* 串聯路徑 "領域id/主題id[/工具名]" → 找到目標；找不到回傳 null */
  function resolveSee(p) {
    var parts = String(p).split("/");
    var all = (window.TOOLMAP && TOOLMAP.domains) || [];
    for (var i = 0; i < all.length; i++) if (all[i].id === parts[0]) {
      var d = all[i], ts = d.topics || [];
      for (var j = 0; j < ts.length; j++) if (ts[j].id === parts[1]) {
        var t = ts[j];
        if (parts.length < 3) return { dom: d, topic: t };
        var xs = t.tools || [];
        for (var k = 0; k < xs.length; k++) if (xs[k].n === parts[2]) return { dom: d, topic: t, tool: xs[k] };
        return { dom: d, topic: t };
      }
      return null;
    }
    return null;
  }
  function seeHtml(list) {
    if (!list || !list.length) return "";
    return '<ul class="dw-see">' + list.map(function (p) {
      var r = resolveSee(p);
      if (!r) return "";
      var label = r.dom.icon + " " + r.dom.n + " ▸ " + r.topic.n + (r.tool ? " ▸ " + r.tool.n : "");
      return '<li><a href="#" data-see="' + esc(p) + '">' + esc(label) + "</a></li>";
    }).join("") + "</ul>";
  }
  function cueHtml(list) {
    if (!list || !list.length) return "";
    return '<ul class="dw-cue">' + list.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>";
  }

  /* ── 考點代碼：把工具接到練習本與直覺道場（data/kp.js、kp-tools.js、kp-practice.js 有載入才會出現）──
   * pathOf(tool)：用物件身分找回「領域/主題/工具名」；主題層抽屜（openTool 收到的是臨時物件）用 _path 帶進來 */
  function pathOf(tool) {
    if (tool._path) return tool._path;
    var all = (window.TOOLMAP && TOOLMAP.domains) || [];
    for (var i = 0; i < all.length; i++) {
      var ts = all[i].topics || [];
      for (var j = 0; j < ts.length; j++) {
        var xs = ts[j].tools || [];
        for (var k = 0; k < xs.length; k++) if (xs[k] === tool) return all[i].id + "/" + ts[j].id + "/" + xs[k].n;
      }
    }
    return null;
  }
  function kpsOf(tool) {
    var p = pathOf(tool); if (!p) return [];
    var T = window.KP_TOOLS || {}, TT = window.KP_TOPICS || {};
    return (T[p] || TT[p] || []).slice();
  }
  function chapterName(chId) {   // "g11a-ch01" → 「高二上 第一章 三角函數」（handouts 的章序與 curriculum.js 不同，優先用練習本自己的章名表）
    var N = window.KP_PRACTICE_NAMES; if (N && N[chId]) return N[chId];
    var C = window.CURRICULUM; if (!C) return chId;
    var m = chId.match(/^(g\d\d[ab])-ch(\d+)$/); if (!m) return chId;
    for (var i = 0; i < C.semesters.length; i++) if (C.semesters[i].id === m[1]) {
      var ch = C.semesters[i].chapters[parseInt(m[2], 10) - 1];
      return ch ? C.semesters[i].name + " " + ch.num + " " + ch.title : chId;
    }
    return chId;
  }
  function practiceBase() {
    var s = window.SITE || {};
    return s.handouts === false ? ((window.KP && KP.practiceSite) || "") : "";
  }
  function trainHtml(kps) {
    if (!kps.length || !window.KP) return "";
    var names = kps.map(function (k) { var c = KP.byId(k); return c ? k + " " + c.n : k; });
    var html = '<div class="dw-kp">考點：' + esc(names.join("；")) + "</div>";
    /* 練習本：找出掛了同一個考點的題型卡片，最多 6 個，L1/L2 的產生器卡片優先 */
    var PR = window.KP_PRACTICE || {}, TI = window.KP_PRACTICE_TITLES || {}, hits = [];
    Object.keys(PR).forEach(function (ch) {
      Object.keys(PR[ch]).forEach(function (key) {
        var list = PR[ch][key] || [];
        for (var i = 0; i < kps.length; i++) if (list.indexOf(kps[i]) >= 0) {
          hits.push({ ch: ch, key: key, primary: list[0] === kps[0], gen: /^L[0123]\./.test(key) });
          break;
        }
      });
    });
    hits.sort(function (a, b) { return (b.primary - a.primary) || (b.gen - a.gen); });
    var base = practiceBase();
    var items = hits.slice(0, 6).map(function (h) {
      var anchor = h.gen ? "#c-" + h.key : "#" + h.key;      // 產生器卡片 id="c-級.型"；固定題 id="L4-3"
      var label = (TI[h.ch] && TI[h.ch][h.key]) || h.key;
      return '<li><a href="' + esc(base + "handouts/" + h.ch + "/practice.html" + anchor) + '">📝 ' + esc(chapterName(h.ch)) + "・" + esc(label) + "</a></li>";
    });
    if (hits.length > 6) items.push('<li class="dw-more">…還有 ' + (hits.length - 6) + " 個題型</li>");
    html += '<ul class="dw-train">' + items.join("") +
      '<li><a href="reflex.html?kp=' + esc(kps.join(",")) + '">⚔️ 到直覺道場練這個考點的反射</a></li></ul>';
    return html;
  }

  /* tool = {n,f,w,l,t,x,ref,refName, cue:[看到什麼就想到什麼], see:[串聯路徑], img, imgCap}
   * 所有欄位都要經過 esc()：數學敘述裡的 "<"（如 $0<a<1$）若直接塞進 innerHTML，
   * 會被瀏覽器當成 HTML 標籤起始而吃掉後面的內容。
   */
  function openTool(tool, path) {
    var d = ensureDrawer();
    d.querySelector("#dwTitle").innerHTML =
      esc(tool.n) + (path ? '<div class="h-p" style="font-weight:400">' + esc(path) + "</div>" : "");
    var html =
      sec("lab-f", "公式／敘述", tool.f ? "$$" + esc(tool.f) + "$$" : "", "dw-formula") +
      (tool.img ? '<div class="dw-sec dw-img"><img src="' + esc(tool.img) + '" alt="' + esc(tool.imgCap || tool.n) + '">' +
        (tool.imgCap ? '<div class="dw-cap">' + esc(tool.imgCap) + "</div>" : "") + "</div>" : "") +
      sec("lab-w", "什麼時候用", esc(tool.w)) +
      sec("lab-c", "看到這句話就想到", cueHtml(tool.cue), "dw-txt") +
      sec("lab-l", "限制／前提", esc(tool.l)) +
      sec("lab-t", "常見錯誤", esc(tool.t)) +
      sec("lab-x", "延伸連結", esc(tool.x)) +
      sec("lab-s", "串聯：同一件事在別的地方長什麼樣", seeHtml(tool.see), "dw-txt") +
      sec("lab-p", "練這個", trainHtml(kpsOf(tool)), "dw-txt") +
      // 只發佈心智圖、沒有上傳章節頁時（data/site.js 的 chapters:false），這個連結會指向不存在的檔案，所以直接不顯示
      (tool.ref && hasChapters() ? '<div class="dw-sec dw-ref"><a href="' + tool.ref + '">📘 前往章節：' + esc(tool.refName || "詳細講解") + " →</a></div>" : "");
    var body = d.querySelector("#dwBody");
    body.innerHTML = html || '<p class="dw-txt">（此節點為分類，點它下面的葉節點看工具細節）</p>';
    // 串聯連結：目標是工具就在抽屜裡直接換頁，是主題就跳到該領域的分支圖
    body.querySelectorAll("a[data-see]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var r = resolveSee(a.getAttribute("data-see"));
        if (!r) return;
        if (r.tool) openTool(r.tool, r.dom.n + " ▸ " + r.topic.n);
        else location.href = "branch.html#d=" + r.dom.id + "&t=" + r.topic.id;
      });
    });
    if (window.renderMathInElement) {
      renderMathInElement(body, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
        throwOnError: false
      });
    }
    fitMath(body);
    d.classList.add("open");
    // 字型載入完成後寬度可能再變一次，補量一次；已經塞得下的不會被動到
    requestAnimationFrame(function () { fitMath(body); });
  }

  /* ── 網址參數 ──
   * 同時支援 ?d=xxx 與 #d=xxx。用 # 是為了讓「直接雙擊 HTML 檔（file://）」也能正確帶參數，
   * 部分瀏覽器在 file:// 下會忽略 query string。
   */
  function param(name) {
    var q = new URLSearchParams(location.search).get(name);
    if (q) return q;
    var h = location.hash.replace(/^#/, "");
    return new URLSearchParams(h).get(name);
  }

  /* ── 版本：完整版 / 學測版 ──
   * 學測版不是另一份資料，而是把完整版依 data/scope.js 的排除清單過濾出來，
   * 所以兩版永遠同步。
   */
  var ED_KEY = "hsmath.edition";
  function edition() {
    try { return localStorage.getItem(ED_KEY) === "gsat" ? "gsat" : "full"; }
    catch (e) { return "full"; }
  }
  function setEdition(v) { try { localStorage.setItem(ED_KEY, v); } catch (e) {} }

  function scopeIds(key) {
    var S = window.SCOPE || {};
    return ((S[key] || [])).map(function (x) { return x.id; });
  }
  function copyWith(obj, key, val) {
    var o = {}, k;
    for (k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) o[k] = obj[k];
    o[key] = val;
    return o;
  }

  /* 目前版本下可用的領域清單（所有渲染函式都用它，不要直接用 TOOLMAP.domains） */
  function domains() {
    var all = (window.TOOLMAP && TOOLMAP.domains) || [];
    if (edition() !== "gsat" || !window.SCOPE) return all;
    var exD = scopeIds("domains"), exT = scopeIds("topics"), exX = scopeIds("tools");
    var out = [];
    all.forEach(function (d) {
      if (exD.indexOf(d.id) > -1) return;
      var topics = [];
      (d.topics || []).forEach(function (t) {
        if (exT.indexOf(d.id + "/" + t.id) > -1) return;
        var tools = (t.tools || []).filter(function (x) {
          return exX.indexOf(d.id + "/" + t.id + "/" + x.n) === -1;
        });
        if (!tools.length) return;
        topics.push(copyWith(t, "tools", tools));
      });
      if (!topics.length) return;
      var nd = copyWith(d, "topics", topics);
      // 名稱／導語覆寫（例如「數列・級數・極限」在學測版要改成「數列與級數」）
      ((window.SCOPE.rename) || []).forEach(function (r) {
        if (r.id !== d.id) return;
        if (r.n) nd.n = r.n;
        if (r.ask) nd.ask = r.ask;
        if (r.icon) nd.icon = r.icon;
      });
      out.push(nd);
    });
    return out;
  }

  /* 學測版實際拿掉了哪些東西（給說明橫幅用） */
  function excludedInfo() {
    var S = window.SCOPE;
    if (!S) return [];
    var all = (window.TOOLMAP && TOOLMAP.domains) || [];
    function domName(id) {
      for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i].icon + " " + all[i].n;
      return id;
    }
    function topicName(path) {
      var p = path.split("/");
      for (var i = 0; i < all.length; i++) if (all[i].id === p[0]) {
        var ts = all[i].topics || [];
        for (var j = 0; j < ts.length; j++) if (ts[j].id === p[1])
          return all[i].icon + " " + all[i].n + " ▸ " + ts[j].n;
      }
      return path;
    }
    var out = [];
    (S.domains || []).forEach(function (x) { out.push({ label: "【整個領域】" + domName(x.id), why: x.why }); });
    (S.topics || []).forEach(function (x) { out.push({ label: "【主題】" + topicName(x.id), why: x.why }); });
    (S.tools || []).forEach(function (x) {
      var p = x.id.split("/");
      out.push({ label: "【單一工具】" + topicName(p[0] + "/" + p[1]) + " ▸ " + p[2], why: x.why });
    });
    (S.rename || []).forEach(function (x) {
      out.push({ label: "【改名】" + domName(x.id) + " → " + x.n, why: x.why });
    });
    return out;
  }

  /* ── 資料工具 ── */
  function domainById(id) {
    var ds = domains();
    for (var i = 0; i < ds.length; i++) if (ds[i].id === id) return ds[i];
    return null;
  }
  function allTools() {
    var out = [];
    domains().forEach(function (d) {
      (d.topics || []).forEach(function (t) {
        (t.tools || []).forEach(function (tool) {
          out.push({ tool: tool, topic: t, dom: d });
        });
      });
    });
    return out;
  }

  var Map = {
    drawMindmap: drawMindmap,
    openTool: openTool,
    domainById: domainById,
    allTools: allTools,
    param: param,
    edition: edition,
    domains: domains,
    excludedInfo: excludedInfo,

    /* 版本切換按鈕（放在 topbar） */
    mountEditionSwitch: function (elId) {
      var el = document.getElementById(elId);
      if (!el) return;
      var ed = edition();
      el.innerHTML = '<span class="ed-sw">' +
        '<button data-v="full"' + (ed === "full" ? ' class="on"' : "") + ">完整版</button>" +
        '<button data-v="gsat"' + (ed === "gsat" ? ' class="on"' : "") + ">學測版</button></span>";
      el.querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.getAttribute("data-v") === edition()) return;
          setEdition(b.getAttribute("data-v"));
          location.reload();
        });
      });
    },

    /* 學測版的說明橫幅 */
    renderEditionBanner: function (mountId) {
      var mount = document.getElementById(mountId);
      if (!mount) return;
      if (edition() !== "gsat") { mount.innerHTML = ""; return; }
      var items = excludedInfo();
      var unc = ((window.SCOPE || {}).uncertain) || [];
      var cfm = ((window.SCOPE || {}).confirmed) || [];
      mount.innerHTML = '<div class="ed-banner">' +
        '<div class="ed-title">🎓 目前是「學測版」：只顯示 108 課綱<b>必修數學</b>（高一上下＋高二上下數A）的內容</div>' +
        "<details><summary>已隱藏 " + items.length + " 項高三選修內容（點開看完整清單）</summary><ul>" +
        items.map(function (x) {
          return "<li><b>" + esc(x.label) + "</b><br><span>" + esc(x.why) + "</span></li>";
        }).join("") + "</ul>" +
        (unc.length ? "<p class='ed-unc'>⚠️ 我不確定、<b>預設保留</b>的項目：" +
          unc.map(function (u) { return "<br>・<b>" + esc(u.what) + "</b>　" + esc(u.note); }).join("") + "</p>" : "") +
        (cfm.length ? "<p class='ed-unc'>✅ 已依 108 課綱條文<b>確認保留</b>的項目：" +
          cfm.map(function (u) { return "<br>・<b>" + esc(u.what) + "</b>　" + esc(u.note); }).join("") + "</p>" : "") +
        "<p class='ed-unc'>範圍認定可在 <code>data/scope.js</code> 調整，改完兩個版本都會立刻反映。</p>" +
        "</details></div>";
    },

    viewMode: viewMode,

    /* ── 圖表／清單 切換控制 ──
     * render(mode) 會在初次載入、按鈕切換、以及視窗寬度跨越斷點時被呼叫。
     */
    viewController: function (btnId, render) {
      var last = null;
      function apply() {
        var m = viewMode();
        if (m === last) return;
        last = m;
        render(m);
        var b = document.getElementById(btnId);
        if (b) b.textContent = m === "map" ? "☰ 改用清單模式" : "🌳 改用圖表模式";
      }
      var b = document.getElementById(btnId);
      if (b) b.addEventListener("click", function () {
        setViewPref(viewMode() === "map" ? "list" : "map");
        last = null; apply();
      });
      // matchMedia 比 resize 可靠（某些環境改變視窗寬度不會派送 resize 事件）
      if (window.matchMedia) {
        var mq = window.matchMedia("(max-width: " + (BP - 1) + "px)");
        if (mq.addEventListener) mq.addEventListener("change", apply);
        else if (mq.addListener) mq.addListener(apply);
      }
      var timer;
      window.addEventListener("resize", function () {
        clearTimeout(timer); timer = setTimeout(apply, 220);
      });
      window.addEventListener("orientationchange", function () { setTimeout(apply, 260); });
      apply();
    },

    /* 總圖：根 → 領域 → 主題 */
    renderMaster: function (mountId) {
      var doms = domains();
      var root = {
        label: "高中數學",
        children: doms.map(function (d) {
          return {
            label: d.icon + " " + d.n, color: d.color, _d: d,
            children: (d.topics || []).map(function (t) {
              return { label: t.n, _d: d, _t: t };
            })
          };
        })
      };
      drawMindmap(mountId, root, function (node) {
        if (node._t) location.href = "branch.html#d=" + node._d.id + "&t=" + node._t.id;
        else if (node._d) location.href = "branch.html#d=" + node._d.id;
      });
    },

    /* 分支圖：領域 → 主題 → 工具 */
    renderBranch: function (mountId, dom) {
      var root = {
        label: dom.icon + " " + dom.n,
        children: (dom.topics || []).map(function (t) {
          return {
            label: t.n, color: dom.color, _t: t,
            children: (t.tools || []).map(function (tool) {
              return { label: tool.n, _t: t, _tool: tool };
            })
          };
        })
      };
      drawMindmap(mountId, root, function (node) {
        if (node._tool) openTool(node._tool, dom.n + " ▸ " + node._t.n);
        else if (node._t) {
          openTool({
            n: node._t.n,
            w: (node._t.kw || []).map(function (k) { return "「" + k + "」"; }).join("、"),
            l: node._t.flow || "",
            cue: node._t.cue, see: node._t.see, img: node._t.img, imgCap: node._t.imgCap,
            _path: dom.id + "/" + node._t.id,
            ref: node._t.ref, refName: node._t.refName
          }, dom.n);
        }
      });
    },

    /* 總圖的清單版（窄螢幕用） */
    renderMasterList: function (mountId) {
      var mount = document.getElementById(mountId);
      if (!mount) return;
      var doms = domains();
      mount.innerHTML = '<div class="lv">' + doms.map(function (d) {
        return '<details class="lv-item" style="border-left-color:' + d.color + '">' +
          '<summary><span style="color:' + d.color + '">' + d.icon + " " + esc(d.n) + "</span>" +
          '<span class="lv-n">' + d.topics.length + " 主題</span></summary>" +
          '<div class="lv-body"><p class="lv-ask">' + esc(d.ask) + "</p>" +
          d.topics.map(function (t) {
            return '<a class="lv-chip" href="branch.html#d=' + d.id + "&t=" + t.id + '">' +
              esc(t.n) + "</a>";
          }).join("") +
          '<a class="lv-go" style="color:' + d.color + '" href="branch.html#d=' + d.id +
          '">看這個領域的完整工具 →</a></div></details>';
      }).join("") + "</div>";
    },

    /* 分支圖的清單版（窄螢幕用） */
    renderBranchList: function (mountId, dom) {
      var mount = document.getElementById(mountId);
      if (!mount) return;
      mount.innerHTML = '<div class="lv">' + (dom.topics || []).map(function (t, ti) {
        return '<details class="lv-item"' + (ti === 0 ? " open" : "") +
          ' style="border-left-color:' + dom.color + '">' +
          '<summary><span style="color:' + dom.color + '">▍' + esc(t.n) + "</span>" +
          '<span class="lv-n">' + t.tools.length + " 個工具</span></summary>" +
          '<div class="lv-body">' +
          (t.flow ? '<p class="lv-ask">💡 ' + esc(t.flow) + "</p>" : "") +
          t.tools.map(function (tool, xi) {
            return '<button class="lv-tool" data-t="' + ti + '" data-x="' + xi + '">' +
              "<b>" + esc(tool.n) + "</b>" +
              (tool.w ? "<span>👉 " + esc(tool.w) + "</span>" : "") + "</button>";
          }).join("") + "</div></details>";
      }).join("") + "</div>";
      mount.querySelectorAll(".lv-tool").forEach(function (b) {
        b.addEventListener("click", function () {
          var t = dom.topics[+b.dataset.t];
          openTool(t.tools[+b.dataset.x], dom.n + " ▸ " + t.n);
        });
      });
    },

    /* 全域關鍵字搜尋 */
    bindSearch: function (inputId, listId) {
      var inp = document.getElementById(inputId), list = document.getElementById(listId);
      if (!inp || !list) return;
      var data = allTools();
      function run() {
        var q = inp.value.trim();
        list.innerHTML = "";
        if (!q) { list.innerHTML = ""; return; }
        var keys = q.split(/[\s,，、]+/).filter(Boolean);
        var hits = data.filter(function (r) {
          var hay = [r.tool.n, r.tool.w, r.tool.f, r.tool.l, r.tool.t, r.topic.n,
            (r.topic.kw || []).join(" "), (r.tool.cue || []).join(" "), (r.topic.cue || []).join(" "), r.dom.n].join(" ");
          return keys.every(function (k) { return hay.indexOf(k) > -1; });
        }).slice(0, 40);
        if (!hits.length) {
          list.innerHTML = '<p class="kw-hint">找不到符合的工具。試試更短的關鍵字，例如「最大」「距離」「垂直」「至少」。</p>';
          return;
        }
        hits.forEach(function (r) {
          var div = document.createElement("div");
          div.className = "hit";
          div.style.borderLeftColor = r.dom.color;
          div.innerHTML = '<div class="h-t">' + esc(r.tool.n) + "</div>" +
            '<div class="h-p">' + esc(r.dom.icon + " " + r.dom.n + " ▸ " + r.topic.n) + "</div>" +
            (r.tool.w ? '<div class="h-w">👉 ' + esc(r.tool.w) + "</div>" : "");
          div.addEventListener("click", function () { openTool(r.tool, r.dom.n + " ▸ " + r.topic.n); });
          list.appendChild(div);
        });
      }
      inp.addEventListener("input", run);
      run();
    },

    /* 領域卡片（總圖下方圖例） */
    renderDomainCards: function (mountId) {
      var mount = document.getElementById(mountId);
      if (!mount) return;
      var grid = document.createElement("div");
      grid.className = "dom-grid";
      domains().forEach(function (d) {
        var a = document.createElement("a");
        a.className = "dom-card";
        a.href = "branch.html#d=" + d.id;
        a.style.borderLeftColor = d.color;
        a.innerHTML = '<span class="dc-t" style="color:' + d.color + '">' + esc(d.icon + " " + d.n) + "</span>" +
          '<span class="dc-a">' + esc(d.ask) + "</span>" +
          '<span class="dc-k">🔑 ' + esc((d.topics || []).map(function (t) { return t.n; }).join("・")) + "</span>";
        grid.appendChild(a);
      });
      mount.appendChild(grid);
    },

    /* 分支頁的工具總表 */
    renderToolTable: function (mountId, dom) {
      var mount = document.getElementById(mountId);
      if (!mount) return;
      (dom.topics || []).forEach(function (t) {
        var h = document.createElement("h3");
        h.className = "topic-h";
        h.innerHTML = '<span style="color:' + dom.color + '">▍' + esc(t.n) + "</span>" +
          '<span class="th-kw">關鍵字：' + esc((t.kw || []).join("、")) + "</span>" +
          (t.ref && hasChapters() ? ' <a class="th-kw" href="' + t.ref + '" style="color:var(--blue)">📘 章節</a>' : "");
        mount.appendChild(h);
        if (t.flow) {
          var p = document.createElement("div");
          p.className = "callout idea";
          p.innerHTML = "<b>思路：</b>" + esc(t.flow);
          mount.appendChild(p);
        }
        var wrap = document.createElement("div");
        wrap.className = "tbl-scroll";
        var rows = (t.tools || []).map(function (x) {
          return "<tr><td class='t-n' data-l='工具'>" + esc(x.n) +
            "</td><td data-l='公式'>" + (x.f ? "$" + esc(x.f) + "$" : "—") +
            "</td><td data-l='什麼時候用'>" + (esc(x.w) || "—") +
            "</td><td class='t-l' data-l='限制／前提'>" + (esc(x.l) || "—") +
            "</td><td data-l='常見錯誤'>" + (esc(x.t) || "—") + "</td></tr>";
        }).join("");
        wrap.innerHTML = "<table class='tools'><thead><tr><th>工具</th><th>公式</th><th>什麼時候用</th>" +
          "<th>限制／前提</th><th>常見錯誤</th></tr></thead><tbody>" + rows + "</tbody></table>";
        mount.appendChild(wrap);
      });
      if (window.renderMathInElement) {
        renderMathInElement(mount, {
          delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
          throwOnError: false
        });
        fitMath(mount);
      }
    },

    /* 讓其他頁面（考古題、跨章流程圖…）也能用同一套自動換列 */
    fitMath: fitMath
  };

  window.MathMap = Map;
})();
