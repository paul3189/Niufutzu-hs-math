/* 牛夫子直覺道場 — 遊戲引擎
 * 限時反射作答 → 打怪 → 結算弱點診斷（題型別＋章節別）。
 * 純 vanilla JS，紀錄存 localStorage。
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

  /* ────────── 紀錄 ────────── */
  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
  }
  function save(d) { try { localStorage.setItem(STORE, JSON.stringify(d)); } catch (e) {} }

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
    return REFLEX_BANK.cats.filter(function (c) { return c.id === id; })[0];
  }
  function diffOf(id) {
    return DIFFS.filter(function (d) { return d.id === id; })[0] || DIFFS[2];
  }

  /* ────────── 選擇狀態 ────────── */
  var G = null;
  var sel = { diff: "s10", cats: null, scope: "gsat", chs: [] };

  function currentSet() { return REFLEX_BANK.scopeSet(sel.scope, sel.chs); }
  /* 使用者勾選的題型 ∩ 此範圍真的有題目的題型；交集為空時就全開 */
  function effectiveCats(avail) {
    var use = (sel.cats || []).filter(function (c) { return avail.indexOf(c) >= 0; });
    return use.length ? use : avail.slice();
  }
  function scopeLabel() {
    if (sel.scope === "all") return "高中全範圍";
    if (sel.scope === "gsat") return "學測範圍";
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
    chapterList.forEach(function (c) { if (!set || set.has(c.id)) srcCount += c.n; });
    var d = diffOf(sel.diff);
    var empty = sel.scope === "chapter" && !sel.chs.length;
    $("btnStart").disabled = empty;
    $("btnStart").classList.toggle("off", empty);
    $("setupLine").innerHTML = empty
      ? '<span class="warn-src">⚠ 請至少選一個章節</span>'
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
  }

  /* ══════════ 開場 ══════════ */
  function startGame() {
    var d = diffOf(sel.diff);
    var set = currentSet();
    var use = effectiveCats(REFLEX_BANK.availableCats(set));
    if (!use.length) return;

    G = {
      d: d, cats: use, set: set, scope: scopeLabel(),
      i: 0, hp: MAX_HP, score: 0, combo: 0, maxCombo: 0,
      ok: 0, msSum: 0, kills: 0, wave: 0,
      per: {}, perCh: {}, wrongs: [],
      used: {}, lastCat: null,
      mon: null, monHp: 0, monMax: 0,
      timerId: null, hidAt: 0, item: null, locked: true, waitNext: false
    };
    G.cats.forEach(function (c) { G.per[c] = { n: 0, ok: 0, ms: 0 }; });
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
    G.item = it;
    var cat = catOf(it.cat);

    $("qCat").innerHTML = cat.icon + " " + cat.name +
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
    paintHud();

    var sec = Math.round(G.d.sec * cat.timeMul * 10) / 10;
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
    var p = G.per[it.cat];
    p.n++; p.ms += used;
    var pc = G.perCh[it.ch] || (G.perCh[it.ch] = { n: 0, ok: 0, ms: 0 });
    pc.n++; pc.ms += used;
    G.msSum += used;
    if (ok) { p.ok++; pc.ok++; }

    $("choices").querySelectorAll(".rx-opt").forEach(function (b, i) {
      b.classList.add("done");
      if (i === it.ans) b.classList.add("right");
      else if (i === idx) b.classList.add("wrong");
    });

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
    G.wrongs.push({ cat: it.cat, ch: it.ch, q: it.q, ans: it.choices[it.ans], tip: it.tip, timeout: timeout });
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
    nextQuestion();
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

    /* 章節診斷：只列有答錯的，附複習連結 */
    var weak = Object.keys(G.perCh).filter(function (id) { return G.perCh[id].ok < G.perCh[id].n; });
    weak.sort(function (x, y) {
      return (G.perCh[x].ok / G.perCh[x].n) - (G.perCh[y].ok / G.perCh[y].n);
    });
    var chDiag = !weak.length
      ? '<div class="rx-none">這一場涵蓋的章節全部答對，沒有需要回頭補的地方 🎉</div>'
      : weak.map(function (id) {
        var s = G.perCh[id];
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

    var wrongList = !G.wrongs.length
      ? '<div class="rx-none">這一場全對，沒有錯題可以檢討 🎉</div>'
      : G.wrongs.map(function (w) {
        var c = catOf(w.cat);
        return '<div class="wr"><div class="wr-c">' + c.icon + ' ' + c.name +
          (w.timeout ? '<span class="wr-to">超時</span>' : '<span class="wr-x">答錯</span>') +
          '<span class="wr-ch">' + REFLEX_BANK.labelOf(w.ch) + '</span></div>' +
          '<div class="wr-q">' + w.q + '</div>' +
          '<div class="wr-a">正解：' + w.ans + '</div>' +
          (w.tip ? '<div class="wr-t">' + w.tip + '</div>' : "") + '</div>';
      }).join("");

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
      '<h3 class="rx-h3">📚 該回去補的章節</h3><div class="rx-chdiag">' + chDiag + '</div>' +
      '<h3 class="rx-h3">📓 錯題回顧</h3><div class="rx-wrongs">' + wrongList + '</div>';

    rm($("endBody"));
    show("scrEnd");
  }

  /* ══════════ 鍵盤 ══════════ */
  document.addEventListener("keydown", function (e) {
    var playing = !$("scrPlay").classList.contains("hide");
    if (!playing) {
      if (e.key === "Enter" && !$("scrMenu").classList.contains("hide") &&
          document.activeElement && document.activeElement.tagName !== "SELECT") {
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
    $("btnAgain").addEventListener("click", startGame);
    $("btnMenu").addEventListener("click", function () { buildMenu(); show("scrMenu"); });
    $("btnGiveUp").addEventListener("click", function () {
      if (!G) return;
      stopTimer();
      if (G.i > 0) endGame();
      else { G.locked = true; buildMenu(); show("scrMenu"); }
    });
    buildMenu();
  });
})();
