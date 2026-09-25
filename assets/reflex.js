/* 牛夫子直覺道場 — 遊戲引擎
 * 限時反射作答 → 打怪 → 結算弱點診斷（題型別＋考點處方＋章節別）。
 * 純 vanilla JS，紀錄存 localStorage；錯題本（間隔複習）本機一定有，登入後與雲端合併。
 * 雲端（帳號、排行榜、錯題本同步）全部透過 assets/reflex-cloud.js 的 window.ReflexCloud，沒有它也照常可玩。
 */
(function () {
  "use strict";

  var STORE = "hsmath.reflex.v1";
  var TOTAL = 10;          /* 一場的題數 */
  var MAX_HP = 5;          /* 玩家生命 */

  /* 難度：秒數愈短，分數倍率愈高（傷害不受難度影響，各難度節奏一致） */
  var DIFFS = [
    { id: "s20", sec: 20, name: "見習", mul: 1.0, tagline: "想清楚再按",
      note: "容許你在心裡走一遍推導。先確認觀念是對的。" },
    { id: "s15", sec: 15, name: "熟手", mul: 1.3, tagline: "還來得及驗算",
      note: "想得到但要繞一下的題目，這裡開始會卡。" },
    { id: "s10", sec: 10, name: "應試", mul: 1.7, tagline: "選擇題的真實節奏",
      note: "學測一題平均就是這個秒數，含讀題與畫記。" },
    { id: "s5",  sec: 5,  name: "高手", mul: 2.2, tagline: "只夠做一個動作",
      note: "沒空推導，只能直接取用記住的結果。" },
    { id: "s3",  sec: 3,  name: "大師", mul: 2.8, tagline: "只能靠反射",
      note: "來不及思考，答案必須自己浮出來。" }
  ];

  var MONSTERS = {
    slime:     { name: "根號史萊姆", img: "assets/monsters/slime.png", hp: 62,
                 quip: "動作一慢就被黏住" },
    butterfly: { name: "弧度幻蝶",   img: "assets/monsters/butterfly.png", hp: 84,
                 quip: "翅膀一拍就換一個象限" },
    turtle:    { name: "磐石定理龜", img: "assets/monsters/turtle.png", hp: 110,
                 quip: "公式不熟就打不動牠" }
  };
  var ORDER = ["slime", "butterfly", "turtle"];

  var SCOPES = [
    { id: "all",     name: "高中全範圍", desc: "必修＋選修甲，六個學期全開" },
    { id: "gsat",    name: "學測範圍",   desc: "只考必修：高一上下＋高二上下數A" },
    { id: "chapter", name: "指定章節",   desc: "單一章節猛練，適合段考前" }
  ];

  /* 網址 ?kp=T-03,G-05 → 依考點出題（別的頁面錯題導過來用）。
   * 代碼見 data/kp.js；沒載入 kp.js 時只檢查格式、名稱顯示代碼本身。 */
  function kpName(id) {
    var o = window.KP && window.KP.byId ? window.KP.byId(id) : null;
    return o ? o.n : "";
  }
  var URL_KPS = (function () {
    var m = /[?&]kp=([^&#]*)/.exec(location.search || "");
    if (!m) return [];
    var out = [];
    decodeURIComponent(m[1].replace(/\+/g, " ")).split(/[,，\s]+/).forEach(function (s) {
      s = s.trim().toUpperCase();
      if (!/^[A-Z]-\d{2}$/.test(s) || out.indexOf(s) >= 0) return;
      if (window.KP && window.KP.isValid && !window.KP.isValid(s)) return;
      out.push(s);
    });
    return out;
  })();
  if (URL_KPS.length) {
    SCOPES.push({ id: "kp", name: "指定考點",
      desc: URL_KPS.map(function (k) { return k + " " + kpName(k); }).join("、") });
  }

  /* ────────── 紀錄 ────────── */
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }
  function save(d) { try { localStorage.setItem(STORE, JSON.stringify(d)); } catch (e) {} }

  /* ────────── 錯題本＋間隔複習 ──────────
   * 本機 localStorage（WB_STORE）一定有；登入後與雲端 ReflexCloud.wrongList() 合併、兩邊都寫回。
   * 一筆：{ id, key, cat, ch, kp, q, choices, ans(index), tip, stage, due(當天 0 點 ms), hist:[{t, ok}], done, ts }
   * 題目整題存下來（產生器的題也一樣），複習時原題照抄。
   * 間隔：答錯／超時 → stage 0、明天；複習過關 → stage+1、今天 + INTERVALS[新 stage] 天（1→3、2→7、3→14），
   *       stage 到 4 就畢業（done）。所以一題從錯到畢業是：明天 → 3 天 → 7 天 → 14 天 → 畢業。
   * 下面這幾個純函式也掛在 window.ReflexWB，給 node 測試用。 */
  var WB_STORE = "hsmath.reflex.wb";
  var INTERVALS = [1, 3, 7, 14];
  var REVIEW_MAX = 20;       /* 一次複習最多幾題（原題數；答對會再加類似題） */

  function dayStart(t) { var d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
  function addDays(t, n) { var d = new Date(t); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n).getTime(); }
  /* 到期＝due 在明天 0 點之前（due 平常就是某天 0 點；別處寫進來的非 0 點時間也照「那一天」算） */
  function isDue(w, now) { return !!w && !w.done && typeof w.due === "number" && w.due < addDays(now, 1); }
  function tsOf(w) {
    var t = w && w.ts;
    if (typeof t === "number") return t;
    if (t && typeof t.toMillis === "function") return t.toMillis();
    if (t && typeof t.seconds === "number") return t.seconds * 1000;
    return 0;
  }
  function localSafeId(key) {
    if (window.ReflexCloud && window.ReflexCloud.safeId) return window.ReflexCloud.safeId(key);
    var s = String(key || "").replace(/[\/#?\[\]]/g, "_");
    if (s.length <= 120) return s;
    var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return s.slice(0, 90) + "~" + h.toString(36);
  }
  /* 答錯／超時的題 → 新的一筆 */
  function newEntry(it, now) {
    return {
      id: localSafeId(it.key), key: it.key, cat: it.cat, ch: it.ch || "", kp: it.kp || "",
      q: it.q, choices: (it.choices || []).slice(), ans: it.ans, tip: it.tip || "",
      stage: 0, due: addDays(now, 1), hist: [{ t: now, ok: false }], done: false, ts: now
    };
  }
  /* 作答一次後的新狀態（不改原物件）。pass=true 表示複習過關 */
  function advance(w, pass, now) {
    var x = {};
    Object.keys(w).forEach(function (k) { x[k] = w[k]; });
    x.hist = (w.hist || []).concat([{ t: now, ok: !!pass }]);
    x.ts = now;
    if (pass) {
      x.stage = (w.stage || 0) + 1;
      if (x.stage >= INTERVALS.length) { x.done = true; x.due = null; }
      else { x.done = false; x.due = addDays(now, INTERVALS[x.stage]); }
    } else {
      x.stage = 0; x.done = false; x.due = addDays(now, INTERVALS[0]);
    }
    return x;
  }
  /* 同一題兩個版本：最近一次作答（ts 新）的贏——沒登入的裝置上剛答錯被打回 0，登入合併時不該被舊的高 stage 蓋掉；
   * 完全平手留 a（呼叫端把雲端那份放 a，免得白寫一次） */
  function pickNewer(a, b) {
    if (!a) return b;
    if (!b) return a;
    return tsOf(b) > tsOf(a) ? b : a;
  }
  /* local：{id: 一筆}；remote：雲端陣列。回傳 { map:合併後（ts 一律轉成數字）, toCloud:要寫回雲端的 } */
  function mergeWB(local, remote) {
    var map = {}, rem = {}, toCloud = [];
    (remote || []).forEach(function (w) { if (w && (w.id || w.key)) rem[w.id || localSafeId(w.key)] = w; });
    var ids = {};
    Object.keys(local || {}).forEach(function (k) { ids[k] = 1; });
    Object.keys(rem).forEach(function (k) { ids[k] = 1; });
    Object.keys(ids).forEach(function (id) {
      var r = rem[id], l = local ? local[id] : null;
      var win = pickNewer(r, l);           /* 完全平手時留雲端那份，免得白寫一次 */
      var out = {};
      Object.keys(win).forEach(function (k) { out[k] = win[k]; });
      out.id = id; out.ts = tsOf(win);
      map[id] = out;
      if (!r || win !== r) toCloud.push(out);
    });
    return { map: map, toCloud: toCloud };
  }
  window.ReflexWB = { INTERVALS: INTERVALS, dayStart: dayStart, addDays: addDays, isDue: isDue,
    newEntry: newEntry, advance: advance, pickNewer: pickNewer, mergeWB: mergeWB, tsOf: tsOf };

  function wbLoad() {
    try { var o = JSON.parse(localStorage.getItem(WB_STORE)); return o && typeof o === "object" ? o : {}; } catch (e) { return {}; }
  }
  function wbSave(m) { try { localStorage.setItem(WB_STORE, JSON.stringify(m)); } catch (e) {} }
  function wbDue(now) {
    var m = wbLoad();
    return Object.keys(m).map(function (k) { return m[k]; }).filter(function (w) { return isDue(w, now); });
  }
  /* 寫一筆（本機＋登入時雲端）。雲端失敗不影響本機，下次登入合併時會補上 */
  function wbPut(w) {
    var m = wbLoad(); m[w.id] = w; wbSave(m);
    var C = window.ReflexCloud;
    if (C && C.user && C.user() && C.wrongAdd) {
      C.wrongAdd([JSON.parse(JSON.stringify(w))]).catch(function (e) {
        if (window.console) console.warn("[reflex] 錯題上傳失敗：", e && e.message);
      });
    }
  }
  /* 一般場答錯／超時：沒有就新增，有就打回 stage 0 */
  function wbRecordWrong(it) {
    if (!it || !it.key) return;
    var now = Date.now();
    var id = localSafeId(it.key), old = wbLoad()[id];
    var w = old ? advance(old, false, now) : newEntry(it, now);
    if (old) { w.choices = (it.choices || []).slice(); w.ans = it.ans; w.q = it.q; w.tip = it.tip || w.tip || ""; }
    wbPut(w);
  }

  /* ────────── 音效（WebAudio，無外部檔案） ────────── */
  var AC = null, muted = false;
  function beep(freq, dur, type, vol) {
    if (muted) return;
    try {
      if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.06, AC.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + dur);
      o.connect(g); g.connect(AC.destination);
      o.start(); o.stop(AC.currentTime + dur);
    } catch (e) {}
  }
  var SFX = {
    hit:  function () { beep(660, 0.10, "triangle", 0.07); setTimeout(function () { beep(990, 0.09, "triangle", 0.05); }, 60); },
    miss: function () { beep(180, 0.24, "sawtooth", 0.05); },
    kill: function () { [523, 659, 784, 1046].forEach(function (f, i) { setTimeout(function () { beep(f, 0.12, "square", 0.05); }, i * 80); }); },
    tick: function () { beep(1200, 0.03, "sine", 0.03); },
    over: function () { [440, 350, 260].forEach(function (f, i) { setTimeout(function () { beep(f, 0.25, "sine", 0.06); }, i * 180); }); }
  };

  /* ────────── 共用 ────────── */
  function $(id) { return document.getElementById(id); }
  function rm(el) {
    if (window.renderMathInElement) {
      renderMathInElement(el, {
        delimiters: [{ left: "$$", right: "$$", display: true }, { left: "$", right: "$", display: false }],
        throwOnError: false
      });
    }
  }
  function show(id) {
    ["scrMenu", "scrPlay", "scrEnd"].forEach(function (s) { $(s).classList.toggle("hide", s !== id); });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function catOf(id) {
    return REFLEX_BANK.cats.filter(function (c) { return c.id === id; })[0] ||
      { id: id, icon: "❓", name: id, timeMul: 1 };          /* 錯題本裡的舊題型已被移除時的保底 */
  }
  function diffOf(id) {
    return DIFFS.filter(function (d) { return d.id === id; })[0] || DIFFS[2];
  }

  /* ────────── 選擇狀態 ────────── */
  var G = null;
  var sel = { diff: "s10", cats: null, scope: URL_KPS.length ? "kp" : "gsat", chs: [], kps: URL_KPS };

  function currentSet() {
    return REFLEX_BANK.scopeSet(sel.scope, sel.scope === "kp" ? sel.kps : sel.chs);
  }
  /* 使用者勾選的題型 ∩ 此範圍真的有題目的題型；交集為空時就全開 */
  function effectiveCats(avail) {
    var use = (sel.cats || []).filter(function (c) { return avail.indexOf(c) >= 0; });
    return use.length ? use : avail.slice();
  }
  function scopeLabel() {
    if (sel.scope === "all") return "高中全範圍";
    if (sel.scope === "gsat") return "學測範圍";
    if (sel.scope === "kp") {
      var ks = sel.kps;
      if (ks.length === 1) return "考點 " + ks[0] + " " + kpName(ks[0]);
      return "考點 " + ks.slice(0, 3).join("、") + (ks.length > 3 ? " 等 " + ks.length + " 個" : "");
    }
    var n = sel.chs.length;
    if (!n) return "尚未選章節";
    if (n === 1) return REFLEX_BANK.labelOf(sel.chs[0]);
    var names = sel.chs.slice(0, 2).map(function (id) {
      return REFLEX_BANK.labelOf(id).split(" ").slice(-1)[0];
    });
    return n + " 章：" + names.join("、") + (n > 2 ? " 等" : "");
  }

  /* ══════════ 選單 ══════════ */
  function buildMenu() {
    var cats = REFLEX_BANK.cats;
    var chapterList = REFLEX_BANK.chapters();
    if (!sel.cats) sel.cats = cats.map(function (c) { return c.id; });

    var set = currentSet();
    var avail = REFLEX_BANK.availableCats(set);
    /* sel.cats 保存「使用者想練的題型」，不因為換範圍而被永久刪掉；
     * 實際能出的是它與此範圍可用題型的交集，範圍放寬時原本的勾選會自己回來。 */
    var use = effectiveCats(avail);

    /* ── 難度 ── */
    var dw = $("diffCards");
    dw.innerHTML = "";
    DIFFS.forEach(function (d) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rx-diff" + (sel.diff === d.id ? " on" : "");
      b.innerHTML =
        '<div class="d-sec">' + d.sec + '<small>秒</small></div>' +
        '<div class="d-name">' + d.name + '</div>' +
        '<div class="d-tag">' + d.tagline + '</div>' +
        '<div class="d-note">' + d.note + '</div>' +
        '<div class="d-mul">分數 ×' + d.mul.toFixed(1) + '</div>';
      b.addEventListener("click", function () { sel.diff = d.id; buildMenu(); });
      dw.appendChild(b);
    });

    /* ── 範圍 ── */
    var sw = $("scopeCards");
    sw.innerHTML = "";
    SCOPES.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rx-scope" + (sel.scope === s.id ? " on" : "");
      b.innerHTML = '<div class="s-name">' + s.name + '</div><div class="s-desc">' + s.desc + '</div>';
      b.addEventListener("click", function () { sel.scope = s.id; buildMenu(); });
      sw.appendChild(b);
    });

    var pickWrap = $("chapterPick");
    pickWrap.classList.toggle("hide", sel.scope !== "chapter");
    if (sel.scope === "chapter") {
      /* 章節複選：點一下加入／移除，整學期一鍵切換 */
      var sems = [];
      chapterList.forEach(function (c) {
        var s = sems.filter(function (x) { return x.name === c.sem; })[0];
        if (!s) { s = { name: c.sem, items: [] }; sems.push(s); }
        s.items.push(c);
      });
      var html = '<div class="pick-head">已選 <b>' + sel.chs.length + '</b> 章' +
        '<span class="pick-acts"><button type="button" data-act="all">全選</button>' +
        '<button type="button" data-act="none">清除</button></span></div>';
      sems.forEach(function (s, si) {
        var allOn = s.items.every(function (c) { return sel.chs.indexOf(c.id) >= 0; });
        html += '<div class="pick-sem"><button type="button" class="ps-name' + (allOn ? " on" : "") +
          '" data-sem="' + si + '">' + s.name + '</button><div class="ps-chips">' +
          s.items.map(function (c) {
            return '<button type="button" class="ps-chip' + (sel.chs.indexOf(c.id) >= 0 ? " on" : "") +
              '" data-id="' + c.id + '" title="' + c.n + ' 種題源">' + c.label + '</button>';
          }).join("") + '</div></div>';
      });
      pickWrap.innerHTML = html;

      pickWrap.querySelectorAll(".ps-chip").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = b.getAttribute("data-id");
          var i = sel.chs.indexOf(id);
          if (i >= 0) sel.chs.splice(i, 1); else sel.chs.push(id);
          buildMenu();
        });
      });
      pickWrap.querySelectorAll(".ps-name").forEach(function (b) {
        b.addEventListener("click", function () {
          var s = sems[+b.getAttribute("data-sem")];
          var allOn = s.items.every(function (c) { return sel.chs.indexOf(c.id) >= 0; });
          s.items.forEach(function (c) {
            var i = sel.chs.indexOf(c.id);
            if (allOn && i >= 0) sel.chs.splice(i, 1);
            else if (!allOn && i < 0) sel.chs.push(c.id);
          });
          buildMenu();
        });
      });
      pickWrap.querySelectorAll(".pick-acts button").forEach(function (b) {
        b.addEventListener("click", function () {
          sel.chs = b.getAttribute("data-act") === "all"
            ? chapterList.map(function (c) { return c.id; }) : [];
          buildMenu();
        });
      });
    }

    /* ── 題型 ── */
    var cw = $("catChips");
    cw.innerHTML = "";
    cats.forEach(function (c) {
      var ok = avail.indexOf(c.id) >= 0;
      var on = use.indexOf(c.id) >= 0;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "rx-chip" + (on ? " on" : "") + (ok ? "" : " dead");
      b.disabled = !ok;
      b.innerHTML = '<span class="c-ic">' + c.icon + '</span><span class="c-nm">' + c.name +
        '</span><span class="c-ds">' + (ok ? c.desc : "此範圍沒有這類題目") + '</span>';
      b.addEventListener("click", function () {
        var i = sel.cats.indexOf(c.id);
        if (i >= 0) { if (use.length > 1) sel.cats.splice(i, 1); }
        else sel.cats.push(c.id);
        buildMenu();
      });
      cw.appendChild(b);
    });

    /* ── 目前設定摘要 ── */
    var srcCount = 0;
    if (set && set.byKp) {
      REFLEX_BANK.kpList().forEach(function (o) { if (set.has(o.id)) srcCount += o.rows + o.gens; });
    } else {
      chapterList.forEach(function (c) { if (!set || set.has(c.id)) srcCount += c.n; });
    }
    var d = diffOf(sel.diff);
    var empty = (sel.scope === "chapter" && !sel.chs.length) || (sel.scope === "kp" && !avail.length);
    $("btnStart").disabled = empty;
    $("btnStart").classList.toggle("off", empty);
    $("setupLine").innerHTML = empty
      ? '<span class="warn-src">' + (sel.scope === "kp" ? "⚠ 這幾個考點道場還沒有題目" : "⚠ 請至少選一個章節") + '</span>'
      : '<b>' + d.sec + ' 秒</b>（' + d.name + '）　▸　<b>' + scopeLabel() + '</b>　▸　' +
        use.length + ' 種題型　▸　題源 ' + srcCount + ' 個' +
        (srcCount < 4 ? '<span class="warn-src">　⚠ 範圍很窄，10 題內會重複出現</span>' : "");

    /* ── 個人紀錄 ── */
    var db = load();
    var rows = DIFFS.map(function (dd) {
      var b = (db.best || {})[dd.id];
      return '<tr><td>' + dd.sec + ' 秒｜' + dd.name + '</td>' +
        '<td>' + (b ? b.score : "—") + '</td>' +
        '<td>' + (b ? b.acc + "%" : "—") + '</td>' +
        '<td>' + (b ? b.combo : "—") + '</td>' +
        '<td>' + (b ? b.avg + " 秒" : "—") + '</td>' +
        '<td class="rec-scope">' + (b && b.scope ? b.scope : "—") + '</td></tr>';
    }).join("");
    $("records").innerHTML =
      '<table class="rx-rec"><tr><th>難度</th><th>最高分</th><th>正確率</th><th>最高連擊</th><th>平均反應</th><th>當時範圍</th></tr>' +
      rows + '</table>';

    /* ── 長期熟練度 ── */
    var st = db.stats || {};
    var any = cats.some(function (c) { return st[c.id] && st[c.id].n >= 3; });
    $("lifetime").innerHTML = !any ? "" :
      '<div class="rx-life"><b>你的長期熟練度（累積所有場次）</b>' +
      cats.map(function (c) {
        var s = st[c.id];
        if (!s || !s.n) return "";
        var acc = Math.round(100 * s.ok / s.n);
        return '<div class="lf"><span class="lf-n">' + c.icon + ' ' + c.name + '</span>' +
          '<span class="lf-bar"><i style="width:' + acc + '%"></i></span>' +
          '<span class="lf-v">' + acc + '%．平均 ' + (s.ms / s.n / 1000).toFixed(1) + ' 秒．' + s.n + ' 題</span></div>';
      }).join("") + '</div>';

    /* ── 怪物陣容 ── */
    if (!$("lineup").childElementCount) {
      $("lineup").innerHTML = ORDER.map(function (k, i) {
        var m = MONSTERS[k];
        return '<div class="lu"><img src="' + m.img + '" alt="' + m.name + '">' +
          '<div class="lu-n">' + m.name + '</div>' +
          '<div class="lu-h">HP ' + m.hp + '</div>' +
          '<div class="lu-q">' + m.quip + '</div></div>' +
          (i < ORDER.length - 1 ? '<div class="lu-ar">▸</div>' : "");
      }).join("");
    }

    rm(cw);
    renderReviewBox();
  }

  /* ══════════ 今日複習（選單頂端） ══════════ */
  function fmtDay(t) { var d = new Date(t); return (d.getMonth() + 1) + "/" + d.getDate(); }
  function renderReviewBox() {
    var box = $("reviewBox");
    if (!box) return;
    var m = wbLoad(), now = Date.now();
    var all = Object.keys(m).map(function (k) { return m[k]; });
    var live = all.filter(function (w) { return !w.done; });
    var due = live.filter(function (w) { return isDue(w, now); });
    var grad = all.length - live.length;
    var signed = cloudOn && C && C.user();
    var sync = signed ? "☁️ 已登入：錯題本會跟雲端同步，換裝置也接得上。"
      : "錯題本存在這台裝置" + (cloudOn ? "；登入後會跟雲端合併。" : "。");
    if (wbSyncMsg) sync = wbSyncMsg;
    if (!all.length) {
      box.innerHTML = '<div class="rx-rv empty"><div class="rv-main"><b>📓 錯題本還是空的</b>' +
        '<span>答錯或超時的題會自動收進來，隔天起出現在「今日複習」：原題＋同考點類似題都對才算過關，' +
        '再依 1 → 3 → 7 → 14 天拉長間隔，四次過關就畢業。</span></div></div>';
      return;
    }
    var next = live.filter(function (w) { return !isDue(w, now); })
      .map(function (w) { return w.due; }).sort(function (a, b) { return a - b; })[0];
    var info = '錯題本 ' + live.length + ' 題在複習中' + (grad ? '．已畢業 ' + grad + ' 題' : "") +
      (next ? '．下一批 ' + fmtDay(next) + ' 到期' : "");
    box.innerHTML = '<div class="rx-rv' + (due.length ? " due" : "") + '">' +
      '<div class="rv-main"><b>' + (due.length ? "📅 今日複習 " + due.length + " 題" : "📅 今天沒有要複習的題目 ✔") + '</b>' +
      '<span>' + info + '</span><span class="rv-sync">' + esc(sync) + '</span></div>' +
      (due.length ? '<button type="button" id="btnReview">開始複習 ▶' +
        (due.length > REVIEW_MAX ? '<small>這次先 ' + REVIEW_MAX + ' 題</small>' : "") + '</button>' : "") +
      '</div>';
    if ($("btnReview")) $("btnReview").addEventListener("click", startReview);
  }

  /* ══════════ 雲端：帳號與排行榜（移植國中版） ══════════
   * 全部透過 window.ReflexCloud；它不存在或 ready=false 時這一段什麼都不畫。 */
  var C = window.ReflexCloud || null;
  var cloudOn = false;
  var boardSel = { kind: "week", diff: null };
  var boardCache = {};
  var wbSyncMsg = "";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderAccount() {
    var box = $("cloudAccount");
    if (!box || !cloudOn) return;
    var u = C.user(), nick = C.nick();
    var html = '<div class="rx-sec">👤 帳號 <small>登入後成績會上榜、錯題本跨裝置同步；排行榜只顯示暱稱，不會出現 Email</small></div>';
    if (!u) {
      var remembered = C.rememberedEmail();
      html += '<div class="rx-cloud">' +
        '<div class="cl-row"><input type="email" id="clEmail" placeholder="你的 Email" value="' + esc(remembered) + '" autocomplete="email">' +
        '<button type="button" id="clSend">寄登入連結給我</button>' +
        (C.mode() === "mock" ? '<button type="button" id="clMock">（測試）直接登入</button>' : "") + '</div>' +
        '<div class="cl-note" id="clMsg">不用設密碼：輸入 Email 會收到一封信，點信裡的連結就登入了（用同一台裝置開信最順）。<b>只要收這一次信</b>——之後在這台裝置、這個瀏覽器會一直保持登入。</div></div>';
      box.innerHTML = html;
      $("clSend").addEventListener("click", sendLink);
      $("clEmail").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); sendLink(); } });
      if ($("clMock")) $("clMock").addEventListener("click", function () { C.mockLogin(); });
      return;
    }
    html += '<div class="rx-cloud">' +
      '<div class="cl-row"><span class="cl-who">✅ 已登入　<span class="cl-mail">' + esc(u.email) + '</span></span>' +
      '<button type="button" class="cl-out" id="clOut">登出</button></div>' +
      '<div class="cl-row"><label for="clNick">暱稱</label>' +
      '<input type="text" id="clNick" maxlength="12" placeholder="排行榜上顯示的名字（1～12 字）" value="' + esc(nick) + '">' +
      '<button type="button" id="clNickSave">' + (nick ? "改暱稱" : "設定暱稱") + '</button></div>' +
      '<div class="cl-note" id="clMsg">這台裝置會一直保持登入，下次來不必再收信；按「登出」或換 Email 才需要重新登入。</div></div>';
    box.innerHTML = html;
    $("clOut").addEventListener("click", function () { C.signOut(); });
    $("clNickSave").addEventListener("click", saveNick);
    $("clNick").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); saveNick(); } });
  }
  function sendLink() {
    var email = ($("clEmail").value || "").trim().toLowerCase();
    if (!C.validEmail(email)) { $("clMsg").textContent = "Email 格式不對，再看一下。"; return; }
    $("clSend").disabled = true;
    $("clMsg").textContent = "寄送中…";
    C.sendLink(email).then(function () {
      $("clMsg").innerHTML = "📨 已寄到 <b>" + esc(email) + "</b>。打開那封信、點裡面的連結就會回到這裡並登入。沒收到請看垃圾信匣。";
    }).catch(function (e) {
      $("clSend").disabled = false;
      $("clMsg").textContent = "寄送失敗：" + friendly(e);
    });
  }
  function saveNick() {
    var n = C.cleanNick($("clNick").value);
    if (!n) { $("clMsg").textContent = "暱稱不能是空的（1～12 字）。"; return; }
    $("clNickSave").disabled = true;
    C.setNick(n).then(function () {
      boardCache = {};
      renderAccount(); renderBoard();
    }).catch(function (e) { $("clNickSave").disabled = false; $("clMsg").textContent = "儲存失敗：" + friendly(e); });
  }
  function friendly(e) {
    var m = (e && e.code) || (e && e.message) || String(e);
    if (/unauthorized-domain/.test(m)) return "這個網域還沒加進 Firebase 的「已授權網域」。";
    if (/invalid-email/.test(m)) return "Email 格式不對。";
    if (/too-many-requests/.test(m)) return "寄太頻繁了，等一下再試。";
    if (/permission-denied/.test(m)) return "沒有權限（安全規則擋下來了）。";
    if (/not signed in/.test(m)) return "還沒登入。";
    if (/network|unavailable/.test(m)) return "網路連不上。";
    return m;
  }

  function renderBoard() {
    var box = $("cloudBoard");
    if (!box || !cloudOn) return;
    if (!boardSel.diff) boardSel.diff = sel.diff;
    var html = '<div class="rx-sec">🏆 排行榜 <small>每個難度一個榜；本週榜每週一重新開始，總榜是歷史最高分</small></div>' +
      '<div class="rx-cloud"><div class="bd-tabs">' +
      '<span class="bd-kind"><button type="button" data-k="week"' + (boardSel.kind === "week" ? ' class="on"' : "") + '>本週榜</button>' +
      '<button type="button" data-k="all"' + (boardSel.kind === "all" ? ' class="on"' : "") + '>總榜</button></span>' +
      '<span class="bd-diff">' + DIFFS.map(function (d) {
        return '<button type="button" data-d="' + d.id + '"' + (boardSel.diff === d.id ? ' class="on"' : "") + '>' + d.sec + ' 秒<small>' + d.name + '</small></button>';
      }).join("") +
      '<button type="button" data-d="sum"' + (boardSel.diff === "sum" ? ' class="on sum"' : ' class="sum"') +
      '>綜合<small>五個難度合計</small></button></span></div>' +
      '<div id="bdBody" class="bd-body">載入中…</div></div>';
    box.innerHTML = html;
    box.querySelectorAll(".bd-kind button").forEach(function (b) {
      b.addEventListener("click", function () { boardSel.kind = b.getAttribute("data-k"); renderBoard(); });
    });
    box.querySelectorAll(".bd-diff button").forEach(function (b) {
      b.addEventListener("click", function () { boardSel.diff = b.getAttribute("data-d"); renderBoard(); });
    });
    var key = boardSel.kind + "|" + boardSel.diff;
    var p = boardCache[key] || (boardCache[key] = C.board(boardSel.kind, boardSel.diff));
    p.then(function (r) {
      if (key !== boardSel.kind + "|" + boardSel.diff) return;
      paintBoard(r);
    }).catch(function (e) {
      delete boardCache[key];
      if ($("bdBody")) $("bdBody").innerHTML = '<div class="rx-none">排行榜載入失敗：' + esc(friendly(e)) + '</div>';
    });
  }
  function paintBoard(r) {
    var rows = r.rows || [];
    var me = r.myUid;
    var sum = !!r.sum;
    var playLabel = boardSel.kind === "week" ? "本週場次" : "總場次";
    var inTop = rows.some(function (x) { return x.uid === me; });
    var head = sum
      ? '<tr><th>名次</th><th>暱稱</th><th>總分</th><th>' + playLabel + '</th><th>上榜難度</th></tr>'
      : '<tr><th>名次</th><th>暱稱</th><th>分數</th><th>正確率</th><th>連擊</th><th>' + playLabel + '</th><th>範圍</th></tr>';
    var html = !rows.length ? '<div class="rx-none">這個榜還沒有人上榜——打一場就是第一名！</div>' :
      '<table class="bd-tbl' + (sum ? " sum" : "") + '">' + head +
      rows.map(function (x, i) {
        var medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1);
        var who = '<td>' + medal + '</td><td>' + esc(x.nick) +
          (x.uid === me ? '<span class="bd-me">我</span>' : "") + '</td><td class="bd-s">' + x.score + '</td>';
        var rest = sum
          ? '<td>' + (x.plays || 0) + '</td><td>' + x.levels + ' / ' + DIFFS.length + '</td>'
          : '<td>' + x.acc + '%</td><td>' + x.combo + '</td><td>' + (x.plays || "—") +
            '</td><td class="bd-sc">' + esc(x.scope) + '</td>';
        return '<tr' + (x.uid === me ? ' class="me"' : "") + '>' + who + rest + '</tr>';
      }).join("") + '</table>' +
      (sum ? '<div class="cl-note">綜合榜＝五個難度各自的最佳分數相加，所以每個難度都練過的人分數會比較高。</div>' : "");
    if (me && r.me && !inTop) html += '<div class="cl-note">你在這個榜的最佳是 <b>' + r.me.score + '</b> 分，還沒進前 ' + rows.length + ' 名，再衝！</div>';
    if (!me) html += '<div class="cl-note">登入並設定暱稱後，你的成績也會出現在這裡。</div>';
    if ($("bdBody")) $("bdBody").innerHTML = html;
  }

  /* 結算後上傳；回傳要塞進結算畫面的那一段 HTML（用 Promise）。失敗只顯示原因，本機紀錄早已存好 */
  function cloudSubmit(run) {
    if (!cloudOn) return Promise.resolve("");
    var u = C.user();
    if (!u) return Promise.resolve('<div class="rx-cloud end"><b>☁️ 這一場沒有上榜</b>：回選單用 Email 登入，之後的成績就會進排行榜。</div>');
    if (!C.nick()) return Promise.resolve('<div class="rx-cloud end"><b>☁️ 這一場沒有上榜</b>：暱稱還沒設定好，回選單看一下「👤 帳號」。</div>');
    return C.submit(run).then(function (r) {
      boardCache = {};
      renderBoard();                       /* 選單雖然還沒顯示，先把榜更新好 */
      function line(name, x) {
        var where = x.rank ? "第 <b>" + x.rank + "</b> 名" : "前 100 名之外";
        var plays = x.plays ? "　累計 " + x.plays + " 場" : "";
        return "<div>" + name + "：" + where +
          (x.improved ? '<span class="bd-new">刷新個人最佳！</span>' : "（個人最佳 " + x.best + " 分）") + plays + "</div>";
      }
      return '<div class="rx-cloud end"><b>☁️ 成績已上傳</b>' + line("本週榜", r.week) + line("總榜", r.all) + '</div>';
    }).catch(function (e) {
      return '<div class="rx-cloud end"><b>☁️ 上傳失敗</b>：' + esc(friendly(e)) + '（本機紀錄已存）</div>';
    });
  }

  /* 錯題本：登入後跟雲端合併一次（同一個帳號只做一次；換帳號或重新登入再做） */
  var wbSyncedUid = null;
  function wbSync() {
    var u = C.user();
    if (!u) { wbSyncedUid = null; wbSyncMsg = ""; renderReviewBox(); return; }
    if (wbSyncedUid === u.uid) return;
    wbSyncedUid = u.uid;
    C.wrongList().then(function (list) {
      var r = mergeWB(wbLoad(), list);
      wbSave(r.map);
      wbSyncMsg = "";
      renderReviewBox();
      var items = r.toCloud.map(function (w) { return JSON.parse(JSON.stringify(w)); });
      var chunks = [];
      for (var i = 0; i < items.length; i += 400) chunks.push(items.slice(i, i + 400));
      return chunks.reduce(function (p, ch) { return p.then(function () { return C.wrongAdd(ch); }); }, Promise.resolve());
    }).catch(function (e) {
      wbSyncedUid = null;
      wbSyncMsg = "⚠ 錯題本雲端同步失敗：" + friendly(e) + "（本機的錯題本照常可用）";
      renderReviewBox();
    });
  }

  function bootCloud() {
    if (!C || !C.ready) return;
    C.ready.then(function (ok) {
      cloudOn = ok;
      if (!ok) return;
      C.onAuth(function () { boardCache = {}; renderAccount(); renderBoard(); wbSync(); renderReviewBox(); });
      /* 從登入信的連結回來 */
      C.finishLink().then(function (r) {
        if (r === "need-email") {
          var email = prompt("請輸入你收到登入連結的那個 Email：");
          if (email) C.finishLink(email.trim().toLowerCase()).catch(function (e) { alert("登入失敗：" + friendly(e)); });
        }
      }).catch(function (e) { alert("登入失敗：" + friendly(e) + "\n連結可能已過期，請重新寄一封。"); });
    });
  }

  /* ══════════ 處方：錯在哪個考點，就指到地圖工具、練習本題型、道場考點練習 ══════════ */
  function enc(s) { return encodeURIComponent(s); }
  function toolLinks(kp) {
    var T = window.KP_TOOLS, out = [];
    if (!T) return out;
    var ks = Object.keys(T);
    for (var i = 0; i < ks.length && out.length < 3; i++) {
      var arr = T[ks[i]];
      if (!Array.isArray(arr) || arr[0] !== kp) continue;
      var parts = ks[i].split("/");
      if (parts.length < 3) continue;                 /* 只要工具（領域/主題/工具名），主題層級的不算 */
      var x = parts.slice(2).join("/");
      out.push({ href: "branch.html#d=" + enc(parts[0]) + "&t=" + enc(parts[1]) + "&x=" + enc(x), text: x });
    }
    return out;
  }
  function practiceLinks(kp) {
    var P = window.KP_PRACTICE, out = [];
    if (!P || typeof P !== "object") return out;
    var TT = window.KP_PRACTICE_TITLES || {}, NN = window.KP_PRACTICE_NAMES || {};
    var base = "handouts/";
    if (window.SITE && window.SITE.handouts === false) {
      var site = window.KP && window.KP.practiceSite;
      if (!site) return out;
      base = site.replace(/\/?$/, "/") + "handouts/";
    }
    var cand = [];
    Object.keys(P).forEach(function (ch) {
      var m = P[ch];
      if (!m || typeof m !== "object") return;
      Object.keys(m).forEach(function (key) {
        var arr = m[key];
        if (!Array.isArray(arr)) return;
        var pos = arr.indexOf(kp);
        if (pos < 0) return;
        var gen = /^L\d+\./.test(key);
        cand.push({ ch: ch, key: key, main: pos === 0 ? 1 : 0, gen: gen ? 1 : 0, pre: /^L0\./.test(key) ? 1 : 0, ord: cand.length });
      });
    });
    /* 主考點優先 → 產生器卡片優先 → 本章題型優先於別章的先備題（L0） → 原順序 */
    cand.sort(function (a, b) { return (b.main - a.main) || (b.gen - a.gen) || (a.pre - b.pre) || (a.ord - b.ord); });
    cand.slice(0, 3).forEach(function (c) {
      var title = (TT[c.ch] && TT[c.ch][c.key]) || c.key;
      out.push({
        href: base + c.ch + "/practice.html#" + (c.gen ? "c-" + c.key : c.key),
        text: (NN[c.ch] ? NN[c.ch] + "｜" : "") + title
      });
    });
    return out;
  }
  function kpHref(kp) {
    return "reflex.html?kp=" + enc(kp) + (C && C.mode && C.mode() === "mock" ? "&cloud=mock" : "");
  }
  function prescriptionHtml(perKp) {
    var ids = Object.keys(perKp || {}).filter(function (k) { return perKp[k].ok < perKp[k].n; });
    ids.sort(function (x, y) {
      return (perKp[x].ok / perKp[x].n) - (perKp[y].ok / perKp[y].n) || (x < y ? -1 : 1);
    });
    return ids.map(function (id) {
      var s = perKp[id];
      var tools = toolLinks(id), prac = practiceLinks(id);
      function row(label, list) {
        if (!list.length) return "";
        return '<div class="rxp-row"><span class="rxp-l">' + label + '</span><span class="rxp-links">' +
          list.map(function (l) {
            return '<a class="rxp-a" href="' + esc(l.href) + '" target="_blank" rel="noopener">' + esc(l.text) + '</a>';
          }).join("") + '</span></div>';
      }
      return '<div class="rxp" data-kp="' + esc(id) + '">' +
        '<div class="rxp-h"><span class="rxp-code">' + esc(id) + '</span>' +
        '<span class="rxp-n">' + esc(kpName(id) || "") + '</span>' +
        '<span class="rxp-v">錯 ' + (s.n - s.ok) + '／答 ' + s.n + '</span></div>' +
        row("🗺️ 工具地圖", tools) +
        row("📝 練習本", prac) +
        '<div class="rxp-row"><span class="rxp-l">⚔️ 道場</span><span class="rxp-links">' +
        '<a class="rxp-a go" href="' + esc(kpHref(id)) + '">再練這個考點 →</a></span></div>' +
        '</div>';
    }).join("");
  }
  /* 考點診斷區塊：有錯的開處方，全對的考點列成一行 */
  function kpSectionHtml(perKp) {
    var rx = prescriptionHtml(perKp);
    var good = Object.keys(perKp || {}).filter(function (k) { return perKp[k].ok >= perKp[k].n; }).sort();
    if (!rx && !good.length) return "";
    return '<h3 class="rx-h3">💊 考點處方 <small>錯在哪個考點，就去哪裡補</small></h3>' +
      (rx ? '<div class="rx-rx">' + rx + '</div>' : '<div class="rx-none">這一場碰到的考點全部答對 🎉</div>') +
      (good.length ? '<div class="rx-kpok">✔ 全對的考點：' + good.map(function (k) {
        return '<span title="' + esc(kpName(k)) + '">' + esc(k) + (kpName(k) ? " " + esc(kpName(k)) : "") + '</span>';
      }).join("、") + '</div>' : "");
  }
  function chDiagHtml(perCh) {
    var weak = Object.keys(perCh).filter(function (id) { return perCh[id].ok < perCh[id].n; });
    weak.sort(function (x, y) {
      return (perCh[x].ok / perCh[x].n) - (perCh[y].ok / perCh[y].n);
    });
    return !weak.length
      ? '<div class="rx-none">這一場涵蓋的章節全部答對，沒有需要回頭補的地方 🎉</div>'
      : weak.map(function (id) {
        var s = perCh[id];
        var page = REFLEX_BANK.pageOf(id);
        return '<div class="chd">' +
          '<span class="chd-n">' + REFLEX_BANK.labelOf(id) + '</span>' +
          '<span class="chd-v">' + s.ok + '/' + s.n + '　平均 ' + (s.ms / s.n / 1000).toFixed(1) + ' 秒</span>' +
          (page ? '<a class="chd-go" href="' + page + '">去複習這一章 →</a>'
                : '<a class="chd-go" href="map.html">' +
                  (window.SITE && window.SITE.chapters === false
                    ? "去工具地圖複習 →"          // 這一份沒有上傳章節頁
                    : "章節頁還沒建，去工具地圖 →") + "</a>") +
          '</div>';
      }).join("");
  }
  function wrongListHtml(wrongs, allOk) {
    return !wrongs.length
      ? '<div class="rx-none">' + allOk + '</div>'
      : wrongs.map(function (w) {
        var c = catOf(w.cat);
        return '<div class="wr"><div class="wr-c">' + c.icon + ' ' + c.name +
          (w.tag ? '<span class="wr-tag">' + w.tag + '</span>' : "") +
          (w.timeout ? '<span class="wr-to">超時</span>' : '<span class="wr-x">答錯</span>') +
          '<span class="wr-ch">' + REFLEX_BANK.labelOf(w.ch) + '</span></div>' +
          '<div class="wr-q">' + w.q + '</div>' +
          '<div class="wr-a">正解：' + w.ans + '</div>' +
          (w.tip ? '<div class="wr-t">' + w.tip + '</div>' : "") + '</div>';
      }).join("");
  }
  function roundPerKp(pk) {
    var out = {};
    Object.keys(pk || {}).forEach(function (k) { out[k] = { n: pk[k].n, ok: pk[k].ok, ms: Math.round(pk[k].ms) }; });
    return out;
  }

  /* ══════════ 開場 ══════════ */
  function startGame() {
    var d = diffOf(sel.diff);
    var set = currentSet();
    var use = effectiveCats(REFLEX_BANK.availableCats(set));
    if (!use.length) return;

    G = {
      review: false,
      d: d, cats: use, set: set, scope: scopeLabel(),
      i: 0, hp: MAX_HP, score: 0, combo: 0, maxCombo: 0,
      ok: 0, msSum: 0, kills: 0, wave: 0,
      per: {}, perCh: {}, perKp: {}, wrongs: [],
      used: {}, lastCat: null,
      mon: null, monHp: 0, monMax: 0,
      timerId: null, hidAt: 0, item: null, locked: true, waitNext: false
    };
    G.cats.forEach(function (c) { G.per[c] = { n: 0, ok: 0, ms: 0 }; });
    $("arena").classList.remove("rx-review");
    spawnMonster(true);
    show("scrPlay");
    $("hudDiff").textContent = d.sec + " 秒｜" + d.name + "　" + G.scope;
    nextQuestion();
  }

  function spawnMonster(first) {
    var m = MONSTERS[ORDER[G.wave % ORDER.length]];
    var scale = 1 + 0.3 * Math.floor(G.wave / ORDER.length);
    G.mon = m;
    G.monMax = Math.round(m.hp * scale);
    G.monHp = G.monMax;
    var img = $("monImg");
    img.src = m.img; img.alt = m.name;
    $("monName").textContent = m.name + (scale > 1 ? "（強化 ×" + scale.toFixed(1) + "）" : "");
    $("monQuip").textContent = m.quip;
    img.classList.remove("dead");
    if (!first) { img.classList.add("spawn"); setTimeout(function () { img.classList.remove("spawn"); }, 500); }
    paintMonHp();
  }
  function paintMonHp() {
    $("monHpFill").style.width = Math.max(0, G.monHp / G.monMax * 100) + "%";
    $("monHpTxt").textContent = Math.max(0, G.monHp) + " / " + G.monMax;
  }
  function paintHud() {
    var h = "";
    for (var i = 0; i < MAX_HP; i++) h += '<span class="hp' + (i < G.hp ? "" : " off") + '">❤</span>';
    $("hudHp").innerHTML = h;
    $("hudScore").textContent = G.score;
    $("hudCombo").innerHTML = G.combo >= 2 ? '<b>' + G.combo + '</b> 連擊' : "連擊 " + G.combo;
    $("hudCombo").classList.toggle("hot", G.combo >= 5);
    $("hudProg").textContent = G.i + " / " + TOTAL;
    $("hudProgFill").style.width = (G.i / TOTAL * 100) + "%";
  }

  /* ══════════ 出題 ══════════ */
  function pickItem() {
    var order = G.cats.slice();
    /* 盡量不要連續兩題同題型 */
    if (order.length > 1) {
      order = order.filter(function (c) { return c !== G.lastCat; });
      if (Math.random() < 0.25) order = G.cats.slice();
    }
    for (var attempt = 0; attempt < order.length + 2; attempt++) {
      var c = order[Math.floor(Math.random() * order.length)];
      var it = null;
      for (var t = 0; t < 18; t++) {
        it = REFLEX_BANK.make(c, G.set);
        if (!it) break;
        if (!G.used[it.key]) break;
      }
      if (it) { G.lastCat = c; G.used[it.key] = 1; return it; }
      order = order.filter(function (x) { return x !== c; });
      if (!order.length) order = G.cats.slice();
    }
    return null;
  }

  function nextQuestion() {
    if (G.i >= TOTAL || G.hp <= 0) { endGame(); return; }
    G.waitNext = false;
    $("fb").className = "rx-fb";
    $("fb").innerHTML = "";
    var it = pickItem();
    if (!it) { endGame(); return; }
    showItem(it, "");
    paintHud();
  }

  /* 把一題畫上去並開始計時（一般場與複習場共用）。tag：題型後面的小標籤（複習場的「原題／類似題」） */
  function showItem(it, tag) {
    G.item = it;
    var cat = catOf(it.cat);

    $("qCat").innerHTML = cat.icon + " " + cat.name + (tag ? '<span class="q-tag">' + tag + '</span>' : "") +
      '<span class="q-ch">' + REFLEX_BANK.labelOf(it.ch) + '</span>';
    $("qText").innerHTML = it.q;
    var cw = $("choices");
    cw.innerHTML = "";
    it.choices.forEach(function (ch, i) {
      var b = document.createElement("button");
      b.className = "rx-opt";
      b.type = "button";
      b.innerHTML = '<span class="k">' + (i + 1) + '</span><span class="v">' + ch + '</span>';
      b.addEventListener("click", function () { answer(i); });
      cw.appendChild(b);
    });
    rm($("qCat")); rm($("qText")); rm(cw);

    var sec = Math.round(G.d.sec * (cat.timeMul || 1) * 10) / 10;
    $("timerFill").style.width = "100%";
    $("timerNum").textContent = sec.toFixed(1);
    /* 緩衝 220ms 才開始計時並解鎖：讓眼睛先看到題目，也擋掉上一題殘留的連點 */
    setTimeout(function () { armTimer(sec); }, 220);
  }

  function armTimer(sec) {
    G.limit = sec * 1000;
    G.t0 = performance.now();
    G.locked = false;
    G.warned = false;
    $("timerWrap").classList.remove("warn", "danger");
    stopTimer();
    G.timerId = setInterval(tick, 40);
  }
  function stopTimer() {
    if (G && G.timerId) { clearInterval(G.timerId); G.timerId = null; }
  }
  function tick() {
    var left = Math.max(0, G.limit - (performance.now() - G.t0));
    var r = left / G.limit;
    $("timerFill").style.width = (r * 100) + "%";
    $("timerNum").textContent = (left / 1000).toFixed(1);
    $("timerWrap").classList.toggle("warn", r <= 0.5 && r > 0.25);
    $("timerWrap").classList.toggle("danger", r <= 0.25);
    if (r <= 0.25 && !G.warned) { G.warned = true; SFX.tick(); }
    if (left <= 0) answer(-1);
  }

  /* 切到別的分頁時把時鐘凍住：回來不該直接被判超時 */
  document.addEventListener("visibilitychange", function () {
    if (!G || G.locked) return;
    if (document.hidden) G.hidAt = performance.now();
    else if (G.hidAt) { G.t0 += performance.now() - G.hidAt; G.hidAt = 0; }
  });

  /* ══════════ 作答 ══════════ */
  function answer(idx) {
    if (G.locked) return;
    G.locked = true;
    stopTimer();
    var used = Math.min(performance.now() - G.t0, G.limit);
    var it = G.item;
    var ok = idx === it.ans;
    var timeout = idx === -1;

    G.i++;
    var p = G.per[it.cat] || (G.per[it.cat] = { n: 0, ok: 0, ms: 0 });
    p.n++; p.ms += used;
    var pc = G.perCh[it.ch] || (G.perCh[it.ch] = { n: 0, ok: 0, ms: 0 });
    pc.n++; pc.ms += used;
    /* 考點別（kp 見 data/kp.js）：結算頁依此開處方（地圖工具／練習本／道場考點練習） */
    var pk = it.kp ? (G.perKp[it.kp] || (G.perKp[it.kp] = { n: 0, ok: 0, ms: 0 })) : null;
    if (pk) { pk.n++; pk.ms += used; }
    G.msSum += used;
    if (ok) { p.ok++; pc.ok++; if (pk) pk.ok++; }

    $("choices").querySelectorAll(".rx-opt").forEach(function (b, i) {
      b.classList.add("done");
      if (i === it.ans) b.classList.add("right");
      else if (i === idx) b.classList.add("wrong");
    });

    if (G.review) { reviewAfter(ok, timeout, used); return; }

    if (ok) {
      G.ok++;
      G.combo++;
      if (G.combo > G.maxCombo) G.maxCombo = G.combo;
      var speed = 1 - used / G.limit;
      /* 傷害只看「多快」與「連幾題」，難度不加乘 → 各難度的節奏一致；難度改為加成分數 */
      var dmg = Math.round(10 + 12 * speed + Math.min(G.combo, 10));
      G.score += Math.round(dmg * 10 * G.d.mul);
      G.monHp -= dmg;
      SFX.hit();
      floatDmg("-" + dmg, "dmg");
      $("monImg").classList.add("hit");
      setTimeout(function () { $("monImg").classList.remove("hit"); }, 380);
      paintMonHp();
      var extra = speed > 0.7 ? '<span class="fb-bonus">⚡ 反射級！速度加成 +' + Math.round(12 * speed) + '</span>' : "";
      $("fb").className = "rx-fb ok show";
      $("fb").innerHTML = '<div class="fb-h">✔ 正解　<span class="fb-t">' + (used / 1000).toFixed(2) + ' 秒</span>' + extra + '</div>' +
        (it.tip ? '<div class="fb-tip">' + it.tip + '</div>' : "");
      rm($("fb"));
      if (G.monHp <= 0) { killMonster(); return; }
      paintHud();
      setTimeout(nextQuestion, speed > 0.5 ? 850 : 1250);
      return;
    }

    /* 答錯或超時 */
    G.combo = 0;
    G.hp--;
    SFX.miss();
    $("arena").classList.add("shake");
    setTimeout(function () { $("arena").classList.remove("shake"); }, 420);
    G.wrongs.push({ cat: it.cat, ch: it.ch, kp: it.kp, q: it.q, ans: it.choices[it.ans], tip: it.tip, timeout: timeout });
    wbRecordWrong(it);                     /* 立刻收進錯題本（明天起進今日複習） */
    $("fb").className = "rx-fb no show";
    $("fb").innerHTML = '<div class="fb-h">' + (timeout ? "⏱ 時間到" : "✘ 答錯") +
      '　<span class="fb-t">正解：' + it.choices[it.ans] + '</span></div>' +
      (it.tip ? '<div class="fb-tip">' + it.tip + '</div>' : "") +
      '<button class="fb-next" id="fbNext">繼續 ▶（Enter）</button>';
    rm($("fb"));
    paintHud();
    if (G.hp <= 0) {
      setTimeout(function () { SFX.over(); endGame(); }, 1400);
      return;
    }
    G.waitNext = true;
    $("fbNext").addEventListener("click", goNext);
    G.autoNext = setTimeout(goNext, 3200);
  }

  function goNext() {
    if (!G.waitNext) return;
    G.waitNext = false;
    clearTimeout(G.autoNext);
    if (G.review) reviewNext(); else nextQuestion();
  }

  function killMonster() {
    G.kills++;
    var bonus = Math.round((300 + 100 * G.wave) * G.d.mul);
    G.score += bonus;
    SFX.kill();
    $("monImg").classList.add("dead");
    floatDmg("擊倒！+" + bonus, "kill");
    paintMonHp();
    paintHud();
    setTimeout(function () {
      G.wave++;
      if (G.i >= TOTAL || G.hp <= 0) { endGame(); return; }
      spawnMonster(false);
      nextQuestion();
    }, 1100);
  }

  function floatDmg(txt, cls) {
    var s = document.createElement("span");
    s.className = "rx-float " + cls;
    s.textContent = txt;
    s.style.left = (35 + Math.random() * 30) + "%";
    $("monBox").appendChild(s);
    setTimeout(function () { s.remove(); }, 1000);
  }

  /* ══════════ 結算 ══════════ */
  function endGame() {
    if (G.review) { endReview(); return; }
    stopTimer();
    clearTimeout(G.autoNext);
    G.locked = true;
    var n = G.i || 1;
    var acc = Math.round(100 * G.ok / n);
    var avg = (G.msSum / n / 1000).toFixed(2);

    var db = load();
    db.best = db.best || {};
    var b = db.best[G.d.id];
    if (!b || G.score > b.score) {
      db.best[G.d.id] = { score: G.score, acc: acc, combo: G.maxCombo, avg: avg, scope: G.scope, ts: Date.now() };
    }
    db.stats = db.stats || {};
    Object.keys(G.per).forEach(function (c) {
      var s = db.stats[c] || { n: 0, ok: 0, ms: 0 };
      s.n += G.per[c].n; s.ok += G.per[c].ok; s.ms += G.per[c].ms;
      db.stats[c] = s;
    });
    save(db);

    var rank, cow, word;
    if (G.hp <= 0) { rank = "被打倒了"; cow = "cow_zzz.png"; word = "血量歸零。先把難度調低一級，把「想得出來」練成「不用想」。"; }
    else if (acc >= 90 && G.d.sec <= 3) { rank = "反射大師"; cow = "cow_scholar.png"; word = "3 秒內 9 成正確——這些觀念已經內化成本能了。"; }
    else if (acc >= 90) { rank = "身手俐落"; cow = "cow_scholar.png"; word = "正確率很漂亮，下一步是把難度往上推一級，逼出真正的反射。"; }
    else if (acc >= 70) { rank = "漸入佳境"; cow = "cow_teach.png"; word = "會的部分已經穩了，弱點就在下面那張表——針對它練最省時間。"; }
    else { rank = "還在思考"; cow = "cow_question.png"; word = "現在多半是「算得出來但來不及」，那代表還在推導、還沒變成記憶。"; }

    /* 題型診斷 */
    var diag = REFLEX_BANK.cats.filter(function (c) { return G.per[c.id] && G.per[c.id].n > 0; })
      .map(function (c) {
        var s = G.per[c.id];
        var a = Math.round(100 * s.ok / s.n);
        var lv = a >= 80 ? "good" : a >= 50 ? "mid" : "bad";
        return '<div class="dg ' + lv + '">' +
          '<div class="dg-n">' + c.icon + ' ' + c.name + '</div>' +
          '<div class="dg-bar"><i style="width:' + a + '%"></i></div>' +
          '<div class="dg-v">' + s.ok + '/' + s.n + '（' + a + '%）．平均 ' +
          (s.ms / s.n / 1000).toFixed(1) + ' 秒' + (a >= 80 ? "．已經很穩" : "") + '</div></div>';
      }).join("");

    var wbNote = G.wrongs.length
      ? '<div class="rx-wbnote">📓 這一場的 ' + G.wrongs.length + ' 題錯題已收進錯題本，明天起出現在選單最上面的「今日複習」。</div>'
      : "";

    $("endBody").innerHTML =
      '<div class="rx-end-head">' +
        '<img class="end-cow" src="assets/mascot/web/' + cow + '" alt="牛夫子">' +
        '<div><div class="end-rank">' + rank + '　<span class="end-cond">' +
          G.d.sec + ' 秒｜' + G.scope + '</span></div>' +
        '<div class="end-score">' + G.score + ' 分</div>' +
        '<div class="end-word">' + word + '</div></div>' +
      '</div>' +
      '<div class="rx-stats">' +
        '<div><b>' + acc + '%</b><span>正確率（' + G.ok + '/' + G.i + '）</span></div>' +
        '<div><b>' + avg + ' 秒</b><span>平均反應</span></div>' +
        '<div><b>' + G.maxCombo + '</b><span>最高連擊</span></div>' +
        '<div><b>' + G.kills + '</b><span>擊倒怪物</span></div>' +
        '<div><b>' + G.hp + ' / ' + MAX_HP + '</b><span>剩餘生命</span></div>' +
      '</div>' +
      '<h3 class="rx-h3">🔍 題型診斷</h3><div class="rx-diag">' + diag + '</div>' +
      kpSectionHtml(G.perKp) +
      '<h3 class="rx-h3">📚 該回去補的章節</h3><div class="rx-chdiag">' + chDiagHtml(G.perCh) + '</div>' +
      '<h3 class="rx-h3">📓 錯題回顧</h3>' + wbNote +
      '<div class="rx-wrongs">' + wrongListHtml(G.wrongs, "這一場全對，沒有錯題可以檢討 🎉") + '</div>';

    rm($("endBody"));
    $("btnAgain").textContent = "🔁 再來一場";
    show("scrEnd");

    /* 雲端上傳（有登入才會真的傳）；結果補在分數下面。失敗只顯示原因，本機紀錄上面已經存好 */
    var slot = document.createElement("div");
    slot.id = "cloudResult";
    var head = $("endBody").querySelector(".rx-end-head");
    head.parentNode.insertBefore(slot, head.nextSibling);
    cloudSubmit({ diff: G.d.id, score: G.score, acc: acc, combo: G.maxCombo, avg: avg, scope: G.scope,
                  perKp: roundPerKp(G.perKp) })
      .then(function (html) { slot.innerHTML = html; });
  }

  /* ══════════ 今日複習（間隔複習場） ══════════
   * 每一題：先出原題（存下來的 q／choices 照抄）→ 答對再出同考點類似題 → 兩題都對＝過關。
   * 不打怪、不上榜、不扣心；時間依選單目前選的難度。 */
  function startReview() {
    var now = Date.now();
    var due = wbDue(now);
    if (!due.length) { renderReviewBox(); return; }
    due.sort(function (a, b) { return (a.due - b.due) || (tsOf(a) - tsOf(b)); });
    var queue = due.slice(0, REVIEW_MAX);
    var d = diffOf(sel.diff);
    G = {
      review: true, d: d, scope: "今日複習",
      queue: queue, qi: 0, phase: "orig", cur: null, simItem: null,
      pass: 0, fail: 0, grad: 0, results: [],
      i: 0, ok: 0, msSum: 0, per: {}, perCh: {}, perKp: {}, wrongs: [],
      timerId: null, hidAt: 0, item: null, locked: true, waitNext: false
    };
    $("arena").classList.add("rx-review");
    show("scrPlay");
    $("hudDiff").textContent = "📅 今日複習｜" + d.sec + " 秒｜" + d.name;
    reviewNext();
  }

  /* 同考點類似題：先同題型、同考點；出不來就同考點別的題型；再不行就同章。避開跟原題一模一樣的 key */
  function makeSimilar(w) {
    var B = REFLEX_BANK;
    function tryMake(cat, set) {
      var it = null;
      for (var t = 0; t < 15; t++) {
        it = B.make(cat, set);
        if (!it) return null;
        if (it.key !== w.key) return it;
      }
      return null;
    }
    function tryScope(set) {
      if (!set) return null;
      var it = B.cats.some(function (c) { return c.id === w.cat; }) ? tryMake(w.cat, set) : null;
      if (it) return it;
      var others = B.availableCats(set).filter(function (c) { return c !== w.cat; });
      for (var i = 0; i < others.length; i++) { it = tryMake(others[i], set); if (it) return it; }
      return null;
    }
    try {
      return (w.kp ? tryScope(B.scopeSet("kp", [w.kp])) : null) ||
             (w.ch ? tryScope(B.scopeSet("chapter", [w.ch])) : null);
    } catch (e) { return null; }
  }

  function itemFromEntry(w) {
    return { cat: w.cat, ch: w.ch, kp: w.kp, q: w.q, choices: w.choices || [], ans: w.ans, tip: w.tip, key: w.key };
  }

  function paintReviewHud() {
    var n = G.queue.length, k = Math.min(G.qi + 1, n);
    $("hudProg").textContent = "第 " + k + " / " + n + " 題";
    $("hudProgFill").style.width = (G.qi / n * 100) + "%";
  }

  function reviewNext() {
    G.waitNext = false;
    $("fb").className = "rx-fb";
    $("fb").innerHTML = "";
    if (G.phase === "sim" && G.simItem) {
      paintReviewHud();
      showItem(G.simItem, "類似題");
      return;
    }
    if (G.qi >= G.queue.length) { endReview(); return; }
    G.phase = "orig";
    G.cur = G.queue[G.qi];
    paintReviewHud();
    showItem(itemFromEntry(G.cur), "原題");
  }

  /* 一題（原題＋類似題）的最後結果寫回錯題本 */
  function reviewFinish(pass) {
    var w = advance(G.cur, pass, Date.now());
    wbPut(w);
    G.results.push({ w: w, pass: pass });
    if (pass) { G.pass++; if (w.done) G.grad++; } else G.fail++;
    G.qi++;
    G.phase = "orig";
    G.simItem = null;
  }

  function reviewAfter(ok, timeout, used) {
    var it = G.item;
    var tipHtml = it.tip ? '<div class="fb-tip">' + it.tip + '</div>' : "";
    if (ok) {
      G.ok++;
      SFX.hit();
      var head;
      if (G.phase === "orig") {
        var sim = makeSimilar(G.cur);
        if (sim) {
          G.phase = "sim"; G.simItem = sim;
          head = "✔ 原題答對！下一題是同考點的類似題，也對才算過關";
        } else {
          reviewFinish(true);
          head = "✔ 過關（這個考點道場暫時出不了類似題，原題答對就算）";
        }
      } else {
        reviewFinish(true);
        var w = G.results[G.results.length - 1].w;
        head = w.done ? "🎓 過關，而且這題畢業了！" : "✔ 過關！下次 " + fmtDay(w.due) + " 再見";
      }
      $("fb").className = "rx-fb ok show";
      $("fb").innerHTML = '<div class="fb-h">' + head + '　<span class="fb-t">' + (used / 1000).toFixed(2) + ' 秒</span></div>' + tipHtml;
      rm($("fb"));
      paintReviewHud();
      G.autoNext = setTimeout(function () { G.waitNext = true; goNext(); }, 1400);
      return;
    }
    /* 答錯或超時：這題打回 stage 0、明天再來 */
    SFX.miss();
    $("arena").classList.add("shake");
    setTimeout(function () { $("arena").classList.remove("shake"); }, 420);
    G.wrongs.push({ cat: it.cat, ch: it.ch, kp: it.kp, q: it.q, ans: it.choices[it.ans], tip: it.tip,
                    timeout: timeout, tag: G.phase === "sim" ? "類似題" : "原題" });
    reviewFinish(false);
    $("fb").className = "rx-fb no show";
    $("fb").innerHTML = '<div class="fb-h">' + (timeout ? "⏱ 時間到" : "✘ 答錯") +
      '　<span class="fb-t">正解：' + it.choices[it.ans] + '</span></div>' + tipHtml +
      '<div class="fb-tip rv-reset">這題明天會再出現（間隔重新從 1 天算）。</div>' +
      '<button class="fb-next" id="fbNext">繼續 ▶（Enter）</button>';
    rm($("fb"));
    paintReviewHud();
    G.waitNext = true;
    $("fbNext").addEventListener("click", goNext);
  }

  function endReview() {
    stopTimer();
    clearTimeout(G.autoNext);
    G.locked = true;
    G.waitNext = false;
    var left = wbDue(Date.now()).length;                  /* 還沒輪到或這次沒做完的 */
    var pend = G.fail + (G.queue.length - G.qi);
    var n = G.i || 1;
    var acc = Math.round(100 * G.ok / n);
    var cow = G.fail === 0 && G.pass ? "cow_scholar.png" : G.pass >= G.fail ? "cow_teach.png" : "cow_question.png";
    var word = !G.pass && !G.fail ? "這次還沒做完任何一題，錯題都還留在今日複習裡。"
      : G.fail === 0 ? "全部過關！記憶是靠「快忘記時再想起來一次」變牢的，間隔到了它們會再回來。"
      : "沒過的題明天會再出現。先看下面的處方，把那個考點補起來再回來。";

    $("endBody").innerHTML =
      '<div class="rx-end-head">' +
        '<img class="end-cow" src="assets/mascot/web/' + cow + '" alt="牛夫子">' +
        '<div><div class="end-rank">📅 今日複習　<span class="end-cond">' + G.d.sec + ' 秒｜' + G.d.name + '</span></div>' +
        '<div class="end-score rv-score">過關 ' + G.pass + '／待複習 ' + pend + '</div>' +
        '<div class="end-word">' + word + '</div></div>' +
      '</div>' +
      '<div class="rx-stats">' +
        '<div><b>' + G.pass + '</b><span>過關</span></div>' +
        '<div><b>' + pend + '</b><span>待複習</span></div>' +
        '<div><b>' + G.grad + '</b><span>畢業</span></div>' +
        '<div><b>' + acc + '%</b><span>答對率（' + G.ok + '/' + G.i + ' 題）</span></div>' +
      '</div>' +
      (G.results.length ? '<div class="rx-rvlist">' + G.results.map(function (r) {
        var c = catOf(r.w.cat);
        return '<div class="rvi ' + (r.pass ? "ok" : "no") + '"><span class="rvi-s">' + (r.pass ? (r.w.done ? "🎓" : "✔") : "✘") + '</span>' +
          '<span class="rvi-n">' + c.icon + ' ' + c.name + (r.w.kp ? '　' + esc(r.w.kp) : "") + '</span>' +
          '<span class="rvi-v">' + (r.pass ? (r.w.done ? "畢業" : "下次 " + fmtDay(r.w.due)) : "明天再來") + '</span></div>';
      }).join("") + '</div>' : "") +
      kpSectionHtml(G.perKp) +
      (Object.keys(G.perCh).length ? '<h3 class="rx-h3">📚 該回去補的章節</h3><div class="rx-chdiag">' + chDiagHtml(G.perCh) + '</div>' : "") +
      '<h3 class="rx-h3">📓 這次複習答錯的題</h3>' +
      '<div class="rx-wrongs">' + wrongListHtml(G.wrongs, "這次複習沒有答錯的題 🎉") + '</div>';

    rm($("endBody"));
    $("btnAgain").textContent = left ? "🔁 繼續複習（還有 " + left + " 題）" : "⚔️ 開一場一般訓練";
    show("scrEnd");
  }

  /* ══════════ 鍵盤 ══════════ */
  document.addEventListener("keydown", function (e) {
    var playing = !$("scrPlay").classList.contains("hide");
    if (!playing) {
      var ae = document.activeElement;
      if (e.key === "Enter" && !$("scrMenu").classList.contains("hide") &&
          ae && !/^(SELECT|INPUT|TEXTAREA|A)$/.test(ae.tagName) && ae.id !== "btnReview" &&
          !(ae.closest && ae.closest("#cloudAccount, #cloudBoard"))) {
        e.preventDefault(); startGame();
      }
      return;
    }
    if (G && G.waitNext && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); goNext(); return; }
    if (e.key >= "1" && e.key <= "4") {
      var b = $("choices").querySelectorAll(".rx-opt")[+e.key - 1];
      if (b && !G.locked) { e.preventDefault(); answer(+e.key - 1); }
    }
  });

  /* ══════════ 啟動 ══════════ */
  document.addEventListener("DOMContentLoaded", function () {
    var db = load();
    muted = !!db.muted;
    $("btnMute").textContent = muted ? "🔇 音效關" : "🔊 音效開";
    $("btnMute").addEventListener("click", function () {
      muted = !muted;
      var d = load(); d.muted = muted; save(d);
      $("btnMute").textContent = muted ? "🔇 音效關" : "🔊 音效開";
      if (!muted) SFX.tick();
    });
    $("btnStart").addEventListener("click", startGame);
    $("btnAgain").addEventListener("click", function () {
      if (G && G.review) {
        if (wbDue(Date.now()).length) startReview();
        else { G = null; startGame(); }
      } else startGame();
    });
    $("btnMenu").addEventListener("click", function () { buildMenu(); show("scrMenu"); });
    $("btnGiveUp").addEventListener("click", function () {
      if (!G) return;
      stopTimer();
      if (G.i > 0) endGame();
      else { G.locked = true; buildMenu(); show("scrMenu"); }
    });
    buildMenu();
    bootCloud();
  });
})();
