/* 高中數學｜跨章決策流程圖引擎（由左至右的樹狀判斷圖）
 * node = { t:"文字", kind:"q"|"tool"|"warn", note:"補充/限制", on:"來自父節點的條件",
 *          ref:"領域id/主題id/工具名", children:[node...] }
 * 排版：層級往右展開、選項往下堆疊；同一層的節點左緣對齊成一欄。
 *
 * ref：指向工具地圖裡對應的工具。有 ref 的節點可以點（圖表模式點節點、清單模式點葉節點），
 *      會呼叫 MathFlow.onPick(ref, 節點文字)；由頁面決定要做什麼（cross.html 打開工具抽屜）。
 */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var FS_Q = 15, FS_T = 14, FS_N = 11.5, FS_E = 12;
  var MAXW = 190;      // 節點內文字最大寬度
  var VGAP = 16;       // 同層節點的垂直間距
  var LGAP = 182;      // 層與層的水平間距（要放得下分支標籤）
  var ELBOW = 30;      // 由父節點往右延伸多少才轉彎

  function textW(s, fs) {
    var w = 0;
    for (var i = 0; i < s.length; i++) w += (s.charCodeAt(i) > 0x2e80) ? 1 : 0.56;
    return w * fs;
  }
  function wrap(s, maxW, fs) {
    var lines = [], cur = "";
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch === "\n") { lines.push(cur); cur = ""; continue; }
      if (cur && textW(cur + ch, fs) > maxW) { lines.push(cur); cur = ch; }
      else cur += ch;
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  }
  function el(tag, a) {
    var e = document.createElementNS(NS, tag);
    for (var k in a) e.setAttribute(k, a[k]);
    return e;
  }
  function shade(hex, amt) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    function m(v) { var x = amt <= 1 ? v * amt : v + (255 - v) * (amt - 1); return Math.max(0, Math.min(255, Math.round(x))); }
    return "rgb(" + m(r) + "," + m(g) + "," + m(b) + ")";
  }

  function measure(n, depth) {
    n.kind = n.kind || "tool";
    n.depth = depth;
    var fs = n.kind === "q" ? FS_Q : FS_T;
    n.lines = wrap(n.t, MAXW, fs);
    n.nlines = n.note ? wrap(n.note, MAXW, FS_N) : [];
    var w = 0;
    n.lines.forEach(function (l) { w = Math.max(w, textW(l, fs)); });
    n.nlines.forEach(function (l) { w = Math.max(w, textW(l, FS_N)); });
    n.w = Math.max(124, Math.ceil(w) + 26);
    n.h = n.lines.length * (fs + 6) + (n.nlines.length ? n.nlines.length * (FS_N + 4) + 8 : 0) + 16;
    var kids = n.children || [];
    kids.forEach(function (c) { measure(c, depth + 1); });
    n.sh = kids.length
      ? Math.max(n.h + VGAP, kids.reduce(function (s, c) { return s + c.sh; }, 0))
      : n.h + VGAP;
  }
  /* y = 本子樹垂直區段的頂端；x 由該層的欄位決定 */
  function place(n, y, colX) {
    n.x = colX[n.depth];
    var kids = n.children || [];
    if (kids.length) {
      var cy = y;
      kids.forEach(function (c) { place(c, cy, colX); cy += c.sh; });
      var f = kids[0], l = kids[kids.length - 1];
      n.y = (f.y + f.h / 2 + l.y + l.h / 2) / 2 - n.h / 2;
    } else {
      n.y = y + (n.sh - n.h) / 2;
    }
  }
  function walk(n, fn) { fn(n); (n.children || []).forEach(function (c) { walk(c, fn); }); }

  var Flow = {
    render: function (mountId, root, color) {
      var mount = document.getElementById(mountId);
      if (!mount) return;
      mount.innerHTML = "";
      color = color || "#2563eb";

      measure(root, 0);
      // 每一層取最寬的節點，決定欄位起點，讓同層左緣對齊
      var colW = [];
      walk(root, function (n) { colW[n.depth] = Math.max(colW[n.depth] || 0, n.w); });
      var colX = [], acc = 0;
      for (var i = 0; i < colW.length; i++) { colX[i] = acc; acc += colW[i] + LGAP; }
      place(root, 0, colX);

      var maxX = 0, maxY = 0, minY = 1e9;
      walk(root, function (n) {
        maxX = Math.max(maxX, n.x + n.w); maxY = Math.max(maxY, n.y + n.h);
        minY = Math.min(minY, n.y);
      });
      var PAD = 26;
      var W = maxX + PAD * 2, H = maxY - minY + PAD * 2;
      var dx = PAD, dy = PAD - minY;

      var svg = el("svg", { width: W, height: H, viewBox: "0 0 " + W + " " + H });
      var defs = el("defs");
      var mk = el("marker", {
        id: "fa", viewBox: "0 0 8 8", refX: 7, refY: 4,
        markerWidth: 7, markerHeight: 7, orient: "auto"
      });
      mk.appendChild(el("path", { d: "M0,0 L8,4 L0,8 z", fill: shade(color, .8) }));
      defs.appendChild(mk); svg.appendChild(defs);

      // ── 連線 ──
      walk(root, function (p) {
        (p.children || []).forEach(function (c) {
          var sx = p.x + p.w + dx, sy = p.y + p.h / 2 + dy;
          var ex = c.x + dx, ey = c.y + c.h / 2 + dy;
          var mx = sx + ELBOW;
          svg.appendChild(el("path", {
            d: "M" + sx + "," + sy + " H" + mx + " V" + ey + " H" + (ex - 9),
            fill: "none", stroke: shade(color, 1.35), "stroke-width": 2,
            "marker-end": "url(#fa)", "stroke-linejoin": "round"
          }));
          if (c.on) {
            var lw = textW(c.on, FS_E) + 14, lx = (mx + ex) / 2;
            svg.appendChild(el("rect", {
              x: lx - lw / 2, y: ey - 10, width: lw, height: 20, rx: 10,
              fill: "#ffffff", stroke: shade(color, 1.5), "stroke-width": 1
            }));
            var t = el("text", {
              x: lx, y: ey + 4, "font-size": FS_E, "text-anchor": "middle",
              fill: shade(color, .75), "font-weight": 700
            });
            t.textContent = c.on;
            svg.appendChild(t);
          }
        });
      });

      // ── 節點 ──
      walk(root, function (n) {
        var g = el("g", { class: "fl-node" + (n.ref ? " fl-hot" : "") });
        var fill, stroke, tcol;
        if (n.kind === "q") { fill = shade(color, 1.88); stroke = color; tcol = shade(color, .62); }
        else if (n.kind === "warn") { fill = "#fef2f2"; stroke = "#f0a3a3"; tcol = "#991b1b"; }
        else { fill = "#ffffff"; stroke = "#cbd5e1"; tcol = "#1f2937"; }
        g.appendChild(el("rect", {
          x: n.x + dx, y: n.y + dy, width: n.w, height: n.h, rx: n.kind === "q" ? 12 : 8,
          fill: fill, stroke: stroke, "stroke-width": n.kind === "q" ? 2 : 1.4
        }));
        if (n.kind === "tool") {
          g.appendChild(el("rect", {
            x: n.x + dx, y: n.y + dy, width: 5, height: n.h,
            fill: shade(color, 1.15), rx: 2
          }));
        }
        var fs = n.kind === "q" ? FS_Q : FS_T;
        var y = n.y + dy + 14 + (fs - 14);
        n.lines.forEach(function (l, i) {
          var t = el("text", {
            x: n.x + dx + n.w / 2, y: y + i * (fs + 6), "font-size": fs,
            "text-anchor": "middle", fill: tcol, "font-weight": n.kind === "q" ? 700 : 600
          });
          t.textContent = l; g.appendChild(t);
        });
        var y2 = y + n.lines.length * (fs + 6) + 2;
        n.nlines.forEach(function (l, i) {
          var t = el("text", {
            x: n.x + dx + n.w / 2, y: y2 + i * (FS_N + 4), "font-size": FS_N,
            "text-anchor": "middle", fill: "#7c8698"
          });
          t.textContent = l; g.appendChild(t);
        });
        // 有 ref 的節點可以點開工具抽屜（CSS 另給 hover 效果）
        if (n.ref) {
          g.setAttribute("style", "cursor:pointer");
          var tip = el("title");
          tip.textContent = "點一下看「" + String(n.t).replace(/\n/g, " ") + "」的工具細節";
          g.appendChild(tip);
          (function (ref, label) {
            g.addEventListener("click", function () {
              if (typeof Flow.onPick === "function") Flow.onPick(ref, label);
            });
          })(n.ref, String(n.t).replace(/\n/g, " "));
        }
        svg.appendChild(g);
      });

      mount.appendChild(svg);
      return svg;
    },

    /* 學測版用：拿掉標了 adv（高三選修）的節點。
     * 若某個「問題節點」的選項被拿光了，整個問題也一併移除。
     * 回傳 { tree, removed }，removed 是被拿掉的節點名稱清單。
     */
    prune: function (root) {
      var removed = [];
      function copy(n) {
        var o = {}, k;
        for (k in n) if (Object.prototype.hasOwnProperty.call(n, k)) o[k] = n[k];
        return o;
      }
      function walk(n) {
        if (n.adv) { removed.push(n.t); return null; }
        var kids = n.children || [];
        if (!kids.length) return copy(n);
        var out = [];
        kids.forEach(function (c) { var p = walk(c); if (p) out.push(p); });
        if (!out.length) { removed.push(n.t); return null; }
        var o = copy(n);
        o.children = out;
        return o;
      }
      return { tree: walk(root), removed: removed };
    },

    /* 清單版（窄螢幕用）：把判斷樹攤成可折疊的巢狀清單 */
    renderList: function (mountId, root, color) {
      var mount = document.getElementById(mountId);
      if (!mount) return;
      color = color || "#2563eb";

      function esc(s) {
        return String(s == null ? "" : s)
          .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/\n/g, " ");
      }
      function leaf(c) {
        return '<div class="fl-leaf' + (c.kind === "warn" ? " warn" : "") + (c.ref ? " fl-hot" : "") + '"' +
          (c.ref ? ' data-ref="' + esc(c.ref) + '" title="點一下看工具細節"' : "") + ">" +
          (c.on ? '<span class="fl-on" style="background:' + color + '">' + esc(c.on) + "</span>" : "") +
          "<b>" + esc(c.t) + "</b>" +
          (c.note ? '<span class="fl-note">' + esc(c.note) + "</span>" : "") + "</div>";
      }
      function branch(n, lv) {
        var kids = n.children || [];
        if (!kids.length) return leaf(n);
        return '<div class="fl-q' + (lv ? " sub" : "") + '" style="' +
          (lv ? "" : "background:" + color + ";color:#fff;border-color:" + color) + '">' +
          esc(n.t) + "</div>" +
          kids.map(function (c) {
            if ((c.children || []).length) {
              return '<details class="fl-br"><summary style="color:' + color + '">' +
                esc(c.on || "…") + '</summary><div class="fl-in">' + branch(c, lv + 1) + "</div></details>";
            }
            return leaf(c);
          }).join("");
      }
      mount.innerHTML = '<div class="fl-list">' + branch(root, 0) + "</div>";
      // 葉節點若有 ref，點下去打開工具抽屜
      mount.querySelectorAll("[data-ref]").forEach(function (node) {
        node.addEventListener("click", function () {
          if (typeof Flow.onPick !== "function") return;
          var b = node.querySelector("b");
          Flow.onPick(node.getAttribute("data-ref"), b ? b.textContent : "");
        });
      });
    },

    /* 由頁面覆寫：onPick(ref, 節點文字) —— 預設什麼都不做 */
    onPick: null
  };

  window.MathFlow = Flow;
})();
