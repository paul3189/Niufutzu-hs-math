/* 架構重建卡線上版（frame.html）2026-10-30
 * 資料：data/frame.js ＋ data/frame-<id>.js（格式見 _scripts/frame_cards/FORMAT.md）。
 * 流程：學生在空白骨架裡自己寫 → 按「對照標準版」→ 每格展開標準答案、降成哪一格、數值例、工具地圖連結 → 自評 ✓△✗? → 底部統計與要回頭看的工具。
 * 2026-10-30 老師裁定：學生線上打數學式太難，先只做「空白卡（看／列印／下載 PDF）＋標準版（逐格答案、數值例、工具地圖連結）」。
 *   作答框、自評、localStorage 的程式碼保留，INPUT 改 true 就回來（之後接手寫／拍照輸入再開）。
 * 存檔：只存在這台裝置的瀏覽器（localStorage，鍵 hsmath.frame.<id>）；讀寫都包 try/catch，存不了也能用。
 * 課綱碼（G-11A-2 這類）在顯示前再濾一次（老師 2026-10-29：學生看的文字不可出現）。
 */
(function () {
  var F = window.FRAMES || {};
  var APP = document.getElementById('frApp');
  var CIRC = '⓪①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';
  var C1 = '[ADFGNS]-(?:1[0-2]|[1-9])[ABab甲乙]?-\\d+';
  var CODE = new RegExp('[（(]\\s*(?:課綱\\s*)?' + C1 + '(?:\\s*[、，,／/]\\s*' + C1 + ')*\\s*[）)]|課綱\\s*' + C1 + '|' + C1, 'g');
  // 高中、國中共用同一支：frame.html 的 <body data-stage="jh"> 就是國中（清單只列該學段、存檔鍵不同、國中沒有考點代碼表不顯示考點）
  var STAGE = document.body.getAttribute('data-stage') || 'hs';
  var KEY = (STAGE === 'jh' ? 'jhmath' : 'hsmath') + '.frame.';
  var INPUT = false; // 線上作答（打字框＋自評＋存檔）；先關
  var MODE = 'blank'; // 'blank' 空白卡｜'std' 標準版（INPUT 關時用）
  var EVALS = [['ok', '✓ 對'], ['miss', '△ 漏'], ['bad', '✗ 錯'], ['q', '? 不會']];

  function lab(id) { return /^\d+$/.test(id) && +id <= 20 ? CIRC[+id] : id; }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function txt(s) { return esc(String(s == null ? '' : s).replace(CODE, function (m) { return m.indexOf('課綱') === 0 ? '課綱' : ''; })); }
  function math(el) {
    if (window.renderMathInElement) {
      try {
        renderMathInElement(el, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false, ignoredClasses: ['fr-nomath'] });
      } catch (e) { /* 公式渲染失敗不影響作答 */ }
    }
  }
  function param(name) {
    var q = new URLSearchParams(location.search).get(name);
    if (q) return q;
    return new URLSearchParams(location.hash.replace(/^#/, '')).get(name);
  }
  function load(id) {
    try { var s = JSON.parse(localStorage.getItem(KEY + id) || '{}'); return { v: s.v || {}, e: s.e || {}, show: !!s.show, t0: s.t0 || 0 }; }
    catch (e) { return { v: {}, e: {}, show: false, t0: 0 }; }
  }
  function save(id, st) { try { localStorage.setItem(KEY + id, JSON.stringify(st)); } catch (e) { /* 私密視窗等情形存不了 */ } }
  function cellsOf(S) { return S.type === 'matrix' ? S.cells : S.type === 'tree' ? S.nodes : S.rows; }
  function toolLink(k) {
    var p = k.split('/');
    if (p.length < 3) return esc(k);
    var name = p.slice(2).join('/');
    return '<a href="branch.html#d=' + encodeURIComponent(p[0]) + '&t=' + encodeURIComponent(p[1]) + '&x=' + encodeURIComponent(name) + '">' + esc(name) + '</a>';
  }
  function kpName(c) {
    var K = (window.KP && window.KP.codes) || [];
    for (var i = 0; i < K.length; i++) if (K[i].id === c) return K[i].n;
    return '';
  }
  function evalKeys(F1) {
    var keys = [];
    F1.sections.forEach(function (S) {
      if (S.hideNames) keys.push({ k: 'sec:' + S.id, n: S.short || S.title.split(/[　 ]/)[0], tools: [].concat.apply([], cellsOf(S).map(function (c) { return c.tools || []; })) });
      else cellsOf(S).forEach(function (c) { keys.push({ k: 'cell:' + c.id, n: lab(c.id) + ' ' + c.n, tools: c.tools || [] }); });
    });
    (F1.final || []).forEach(function (q, i) { keys.push({ k: 'final:' + q.id, n: '收尾 ' + (i + 1), tools: [] }); });
    if (F1.example) keys.push({ k: 'example', n: '反例', tools: [] });
    return keys;
  }

  /* ── 首頁：卡片清單 ── */
  function renderIndex() {
    var list = Object.keys(F).map(function (k) { return F[k]; }).filter(function (f) { return f.stage === STAGE; }).sort(function (a, b) { return a.no - b.no; });
    if (!INPUT) {
      var g = '<h1>架構重建卡</h1>' +
        '<div class="fr-lead">' + (STAGE === 'jh' ? '國中' : '高中') + '學過的工具很多，但它們其實可以排成幾張表。每張卡有兩個版本：<br>' +
        '<b>空白卡</b>：只有骨架。印出來（或下載 PDF），先不看課本、自己把整個主題寫出來，寫不出來就打「?」。<br>' +
        '<b>標準版</b>：逐格的標準答案、數值例，還有連到工具地圖的複習連結。寫完再拿來對照，圈出漏的和錯的。</div><div class="fr-list">';
      list.forEach(function (f) {
        var u = 'frame.html?id=' + encodeURIComponent(f.id);
        g += '<div class="fr-pick"><b>' + String(f.no).padStart(2, '0') + '　' + txt(f.n) + '</b>' +
          '<span class="fr-meta">建議 ' + f.time + ' 分鐘・' + evalKeys(f).length + ' 格</span>' +
          '<span class="fr-two"><a class="fr-btn primary" href="' + u + '&v=blank">空白卡</a><a class="fr-btn" href="' + u + '&v=std">標準版</a></span></div>';
      });
      APP.innerHTML = g + '</div>';
      return;
    }
    var h = '<h1>架構重建卡</h1>' +
      '<div class="fr-lead">' + (STAGE === 'jh' ? '國中' : '高中') + '學過的工具很多，但它們其實可以排成幾張表。每張卡給你一個<b>空白骨架</b>：先不看課本、自己把整個主題寫出來，寫不出來就打「?」；' +
      '寫完按<b>「對照標準版」</b>，逐格自評，最後看要回頭複習哪些工具。<br>答案只存在這台裝置的瀏覽器裡，換裝置不會跟著走。</div><div class="fr-list">';
    list.forEach(function (f) {
      var st = load(f.id), keys = evalKeys(f), done = keys.filter(function (k) { return st.e[k.k]; }).length;
      var ok = keys.filter(function (k) { return st.e[k.k] === 'ok'; }).length;
      h += '<a class="fr-pick" href="frame.html?id=' + encodeURIComponent(f.id) + '"><b>' + String(f.no).padStart(2, '0') + '　' + txt(f.n) + '</b>' +
        '<span class="fr-meta">建議 ' + f.time + ' 分鐘・' + keys.length + ' 格</span>' +
        '<span class="fr-prog">' + (done ? '已自評 ' + done + '／' + keys.length + ' 格，✓ ' + ok + ' 格' : '還沒寫過') + '</span></a>';
    });
    APP.innerHTML = h + '</div>';
  }

  /* ── 單張卡 ── */
  function fieldBox(key, label, val, tall) {
    if (!INPUT) return MODE === 'std' ? '' : '<div class="fr-f"><label>' + txt(label) + '</label><div class="fr-blank' + (tall ? ' tall' : '') + '"></div></div>';
    return '<div class="fr-f"><label>' + txt(label) + '</label><textarea data-k="' + esc(key) + '" class="' + (tall ? 'tall' : '') + '" placeholder="自己寫；想不出來就打 ?">' + esc(val || '') + '</textarea><div class="fr-pv"></div></div>';
  }
  function ansBlock(S, c) {
    var fl = c.fields || S.fields;
    var h = '<div class="fr-ans">' + fl.map(function (f) { return '<div><span class="k">' + txt(f.n) + '</span>　' + txt(c.ans[f.id]) + '</div>'; }).join('');
    if ((c.reduce && c.reduce.length) || c.reduceNote) h += '<div class="red">↪ ' + (c.reduce && c.reduce.length ? '降成 ' + c.reduce.map(lab).join('、') + (c.reduceNote ? '：' : '') : '') + txt(c.reduceNote || '') + '</div>';
    (c.ex || []).forEach(function (e) { h += '<div class="ex">例：' + txt(e.q) + ' ⟹ ' + txt(e.a) + '</div>'; });
    h += '<div class="tl">複習：' + (c.tools || []).map(toolLink).join('、') + ((c.kp || []).length && window.KP ? '｜考點：' + c.kp.map(function (k) { return esc(kpName(k) || k); }).join('、') : '') + '</div>';
    return h + '</div>';
  }
  function evalBar(key) {
    if (!INPUT) return '';
    return '<div class="fr-eval" data-e="' + esc(key) + '"><span>自評：</span>' + EVALS.map(function (x) { return '<button type="button" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
  }
  function cellCard(F1, S, c, st, pos) {
    var fl = c.fields || S.fields;
    return '<div class="fr-cell" id="c-' + esc(c.id) + '"><div class="fr-cn">' + lab(c.id) + ' ' + txt(c.n) + (pos ? ' <span class="fr-pos">' + txt(pos) + '</span>' : '') + '</div>' +
      fl.map(function (f) { return fieldBox(S.id + '/' + c.id + '/' + f.id, f.n, st.v[S.id + '/' + c.id + '/' + f.id], /formula/.test(f.id)); }).join('') +
      ansBlock(S, c) + evalBar('cell:' + c.id) + '</div>';
  }
  function sectionHTML(F1, S, st) {
    var h = '<h2>' + txt(S.title) + '</h2>';
    if (S.type === 'matrix') {
      h += '<div class="fr-matrix" style="--fr-cols:' + S.cols.length + '"><div class="fr-mh"></div>' + S.cols.map(function (c) { return '<div class="fr-mh">' + txt(c.n) + '</div>'; }).join('');
      S.rows.forEach(function (r) {
        h += '<div class="fr-mh row">' + txt(r.n) + '</div>';
        S.cols.forEach(function (col) {
          var c = S.cells.filter(function (x) { return x.r === r.id && x.c === col.id; })[0];
          if (!c && S.symmetric) {
            var m = S.cells.filter(function (x) { return x.r === col.id && x.c === r.id; })[0];
            h += '<div class="fr-sym">同 ' + (m ? lab(m.id) : '') + '</div>';
          } else if (c) h += cellCard(F1, S, c, st, '');
          else h += '<div></div>';
        });
      });
      return h + '</div>';
    }
    if (S.hideNames) {
      // 列名遮住：學生自己寫有哪幾種（多給一列，不洩漏種數）；標準版整段一起對照、整段自評
      var n = cellsOf(S).length + 1;
      h += '<p class="fr-note">先寫出共有哪幾種，再填每一種的欄位。用不到的列留空。</p><div class="fr-rows">';
      if (!INPUT && MODE === 'std') n = 0;
      if (!INPUT && MODE === 'std') h = h.replace(/<p class="fr-note">[^<]*<\/p><div class="fr-rows">$/, '<div class="fr-rows">');
      for (var i = 0; i < n; i++) {
        if (!INPUT) {
          h += '<div class="fr-rowcard"><div class="fr-blank fr-blank-name">第 ' + (i + 1) + ' 種：</div><div class="fr-fields">' +
            S.fields.map(function (f) { return fieldBox('', f.n, '', /formula/.test(f.id)); }).join('') + '</div></div>';
          continue;
        }
        var base = S.id + '/row' + i;
        h += '<div class="fr-rowcard"><input class="fr-name" data-k="' + base + '/name" placeholder="第 ' + (i + 1) + ' 種：名稱" value="' + esc(st.v[base + '/name'] || '') + '"><div class="fr-fields">' +
          S.fields.map(function (f) { return fieldBox(base + '/' + f.id, f.n, st.v[base + '/' + f.id], /formula/.test(f.id)); }).join('') + '</div></div>';
      }
      h += '</div><div class="fr-secans"><div class="fr-scroll"><table><tr><th>種類</th>' + S.fields.map(function (f) { return '<th>' + txt(f.n) + '</th>'; }).join('') + '<th>例與複習</th></tr>';
      cellsOf(S).forEach(function (c) {
        h += '<tr><td><b>' + txt(c.n) + '</b></td>' + S.fields.map(function (f) { return '<td>' + txt(c.ans[f.id]) + '</td>'; }).join('') +
          '<td>' + (c.ex || []).map(function (e) { return '例：' + txt(e.q) + ' ⟹ ' + txt(e.a); }).join('<br>') + '<br><small>' + (c.tools || []).map(toolLink).join('、') + '</small></td></tr>';
      });
      return h + '</table></div>' + evalBar('sec:' + S.id).replace('fr-eval', 'fr-eval') + '</div>';
    }
    // 一般表格／性質表／推導樹：一列一張卡
    h += '<div class="fr-rows">';
    cellsOf(S).forEach(function (c) { h += cellCard(F1, S, c, st, c.parent ? '（' + (S.edgeLabel || '怎麼推') + '：' + (c.edge || '') + '）' : ''); });
    return h + '</div>';
  }
  function renderCard(id) {
    var F1 = F[id];
    if (!F1) { APP.innerHTML = '<p>找不到這張卡。<a href="frame.html">回卡片清單</a></p>'; return; }
    if (!INPUT) return renderStatic(F1);
    var st = load(id);
    var h = '<p class="fr-note"><a href="frame.html">← 全部卡片</a></p>' +
      '<h1>' + String(F1.no).padStart(2, '0') + '　' + txt(F1.n) + '</h1>' +
      '<div class="fr-lead">' + txt(F1.intro) + '<br><span class="fr-note fr-nomath">建議 ' + F1.time + ' 分鐘，先不要翻課本。公式可以夾在兩個錢字號中間寫（例如 <code>$\\sqrt{2}$</code>、<code>$x_0$</code>），框下會即時排好。</span></div>' +
      '<div class="fr-tools"><button class="fr-btn primary" id="frShow"></button><button class="fr-btn" id="frReset">重新寫一次</button><button class="fr-btn" id="frPrint">列印</button><span class="fr-timer" id="frTimer"></span></div>' +
      '<div id="frBody">';
    var front = F1.sections.filter(function (S) { return !S.back; }), back = F1.sections.filter(function (S) { return S.back; });
    front.concat(back).forEach(function (S) { h += sectionHTML(F1, S, st); });
    if ((F1.final || []).length || F1.example) {
      h += '<h2>收尾題</h2><div class="fr-final">';
      (F1.final || []).forEach(function (q, i) {
        h += '<div class="fr-cell"><div class="fr-cn">收尾 ' + (i + 1) + '　' + txt(q.q) + '</div>' + fieldBox('final/' + q.id, '我的回答', st.v['final/' + q.id], true) +
          '<div class="fr-ans">' + txt(q.ans) + '</div>' + evalBar('final:' + q.id) + '</div>';
      });
      if (F1.example) h += '<div class="fr-cell"><div class="fr-cn">反例　' + txt(F1.example.q) + '</div>' + fieldBox('example', '我的回答', st.v.example, true) +
        '<div class="fr-ans">' + txt(F1.example.ans) + '</div>' + evalBar('example') + '</div>';
      h += '</div>';
    }
    if ((F1.pitfalls || []).length) h += '<div class="fr-pit"><h2>常見的漏和錯</h2><ol>' + F1.pitfalls.map(function (p) { return '<li>' + txt(p) + '</li>'; }).join('') + '</ol></div>';
    h += '<div class="fr-sum" id="frSum"></div></div>';
    APP.innerHTML = h;
    var body = document.getElementById('frBody');
    // 標準答案、題目文字先排版；學生輸入框下的預覽另外處理
    Array.prototype.forEach.call(APP.querySelectorAll('.fr-lead, .fr-cn, .fr-ans, .fr-secans, .fr-pit, h2, .fr-f label'), math);
    Array.prototype.forEach.call(APP.querySelectorAll('textarea'), function (ta) { preview(ta); });
    applyEvals();
    setShow(st.show);
    tick();

    // 事件只在 APP 上綁一次（見檔尾 bindOnce），這裡把目前這張卡的狀態交給它
    CUR = {
      onInput: function (ev) {
        var k = ev.target.getAttribute('data-k'); if (!k) return;
        st.v[k] = ev.target.value;
        if (!st.t0) st.t0 = Date.now();
        if (ev.target.tagName === 'TEXTAREA') preview(ev.target);
        save(id, st);
      },
      onClick: function (ev) {
        var b = ev.target.closest('.fr-eval button'); if (!b) return;
        var key = b.parentNode.getAttribute('data-e'), v = b.getAttribute('data-v');
        st.e[key] = st.e[key] === v ? '' : v;
        save(id, st); applyEvals();
      }
    };
    document.getElementById('frShow').onclick = function () { st.show = !st.show; save(id, st); setShow(st.show); };
    document.getElementById('frReset').onclick = function () {
      if (!confirm('清掉這張卡的作答和自評，重新寫一次？')) return;
      st = { v: {}, e: {}, show: false, t0: 0 }; save(id, st); renderCard(id);
    };
    document.getElementById('frPrint').onclick = function () { window.print(); };

    function preview(ta) {
      var pv = ta.parentNode.querySelector('.fr-pv');
      if (!pv) return;
      if (ta.value.indexOf('$') < 0) { pv.textContent = ''; return; }
      pv.innerHTML = esc(ta.value).replace(/\n/g, '<br>'); math(pv);
    }
    function setShow(on) {
      body.classList.toggle('fr-show', on);
      var b = document.getElementById('frShow');
      b.textContent = on ? '收起標準版' : '對照標準版';
      b.classList.toggle('on', on);
      summary();
    }
    function applyEvals() {
      Array.prototype.forEach.call(APP.querySelectorAll('.fr-eval'), function (bar) {
        var v = st.e[bar.getAttribute('data-e')] || '';
        Array.prototype.forEach.call(bar.querySelectorAll('button'), function (b) { b.classList.toggle('sel', b.getAttribute('data-v') === v); });
      });
      summary();
    }
    function summary() {
      var el = document.getElementById('frSum'), keys = evalKeys(F1), cnt = { ok: 0, miss: 0, bad: 0, q: 0 }, back = [];
      keys.forEach(function (k) { var v = st.e[k.k]; if (v) cnt[v]++; if (v === 'bad' || v === 'q' || v === 'miss') back.push(k); });
      var left = keys.length - cnt.ok - cnt.miss - cnt.bad - cnt.q;
      var h = '<b>自評統計</b>　<span class="n">✓ ' + cnt.ok + '</span><span class="n">△ ' + cnt.miss + '</span><span class="n">✗ ' + cnt.bad + '</span><span class="n">? ' + cnt.q + '</span>' +
        (left ? '<span class="fr-note">還有 ' + left + ' 格沒自評' + (st.show ? '' : '（先按「對照標準版」）') + '</span>' : '');
      if (back.length) {
        h += '<ul>' + back.map(function (k) {
          return '<li>' + txt(k.n) + (k.tools.length ? '：' + k.tools.filter(function (t, i, a) { return a.indexOf(t) === i; }).map(toolLink).join('、') : '') + '</li>';
        }).join('') + '</ul><p class="fr-note">過一週，按「重新寫一次」再寫一遍，比比看兩次的結果。</p>';
      }
      el.innerHTML = h;
    }
    function tick() {
      var el = document.getElementById('frTimer');
      if (!el || !document.body.contains(el)) return;
      if (st.t0 && !st.show) {
        var m = Math.floor((Date.now() - st.t0) / 60000);
        el.textContent = '已寫 ' + m + ' 分鐘' + (m >= F1.time ? '（超過建議時間，可以先對照了）' : '');
      } else el.textContent = '';
      setTimeout(tick, 20000);
    }
  }

  /* ── 不開線上作答時：空白卡／標準版 ── */
  function pdfUrl(F1, kind) { return 'assets/frame-pdf/' + String(F1.no).padStart(2, '0') + '-' + F1.id + '-' + kind + '.pdf'; }
  function renderStatic(F1) {
    var std = MODE === 'std', st = { v: {}, e: {}, show: std, t0: 0 }, u = 'frame.html?id=' + encodeURIComponent(F1.id);
    var h = '<p class="fr-note"><a href="frame.html">← 全部卡片</a></p>' +
      '<h1>' + String(F1.no).padStart(2, '0') + '　' + txt(F1.n) + (std ? '<span class="fr-tag">標準版</span>' : '<span class="fr-tag">空白卡</span>') + '</h1>' +
      '<div class="fr-lead">' + txt(F1.intro) + '<br><span class="fr-note">' +
      (std ? '逐格對照自己寫的：漏的用 △、錯的用 ✗、不會的用 ? 標在紙上，再點每格下面的連結回工具地圖複習。'
           : '建議 ' + F1.time + ' 分鐘，先不要翻課本。印出來或下載 PDF 寫在紙上；寫完切到「標準版」對照。') + '</span></div>' +
      '<div class="fr-tools"><a class="fr-btn' + (std ? '' : ' on') + '" href="' + u + '&v=blank">空白卡</a><a class="fr-btn' + (std ? ' on' : '') + '" href="' + u + '&v=std">標準版</a>' +
      '<button class="fr-btn" id="frPrint">列印</button><a class="fr-btn" href="' + pdfUrl(F1, std ? 'std' : 'blank') + '" download>下載 PDF</a></div>' +
      '<div id="frBody" class="' + (std ? 'fr-show fr-std' : 'fr-blankcard') + '">';
    var front = F1.sections.filter(function (S) { return !S.back; }), back = F1.sections.filter(function (S) { return S.back; });
    front.concat(back).forEach(function (S) { h += sectionHTML(F1, S, st); });
    if ((F1.final || []).length || F1.example) {
      h += '<h2>收尾題</h2><div class="fr-final">';
      (F1.final || []).forEach(function (q, i) {
        h += '<div class="fr-cell"><div class="fr-cn">收尾 ' + (i + 1) + '　' + txt(q.q) + '</div>' + fieldBox('', '我的回答', '', true) + '<div class="fr-ans">' + txt(q.ans) + '</div></div>';
      });
      if (F1.example) h += '<div class="fr-cell"><div class="fr-cn">反例　' + txt(F1.example.q) + '</div>' + fieldBox('', '我的回答', '', true) + '<div class="fr-ans">' + txt(F1.example.ans) + '</div></div>';
      h += '</div>';
    }
    if ((F1.pitfalls || []).length) h += '<div class="fr-pit"><h2>常見的漏和錯</h2><ol>' + F1.pitfalls.map(function (p) { return '<li>' + txt(p) + '</li>'; }).join('') + '</ol></div>';
    APP.innerHTML = h + '</div>';
    math(APP);
    document.getElementById('frPrint').onclick = function () { window.print(); };
  }

  var CUR = null;
  APP.addEventListener('input', function (ev) { if (CUR) CUR.onInput(ev); });
  APP.addEventListener('click', function (ev) { if (CUR) CUR.onClick(ev); });

  var booted = false;
  function boot() {
    if (booted) return; booted = true;
    var id = param('id');
    MODE = param('v') === 'std' ? 'std' : 'blank';
    if (id) renderCard(id); else renderIndex();
  }
  // KaTeX 是 defer 載入：等它到了再畫，公式才排得出來；萬一它載不到，load 之後照樣畫（公式顯示原文）
  if (window.renderMathInElement) boot();
  else window.addEventListener('load', boot);
})();
