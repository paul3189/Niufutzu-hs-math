/* 牛夫子直覺道場 — 題庫續篇（三）：圖形辨識 graph 產生器 ＋ 秒算直覺 quick 追加產生器
 * 必須在 data/reflex-bank.js 之後載入。
 *
 * graph：題幹是一張行內 SVG（viewBox 260×160、純線條與少量標籤、<b>不放 LaTeX</b>），
 *        問「這是哪個函數／哪一種情形」。所有線條用 currentColor，會自動跟著頁面配色。
 *        每支產生器都吃隨機參數，所以同一支每次畫出來的圖不一樣。
 * quick：補上等差等比的和、餘式定理、對數化簡、排列數、條件機率、標準差線性變換、
 *        複利、三角形面積、二項式係數、兩直線交點等心算題。
 */
(function () {
  "use strict";
  var RB = window.REFLEX_BANK;
  if (!RB || !RB.extend) return;
  var U = RB.util, mk = U.mk, ri = U.ri, pick = U.pick, frac = U.frac;

  /* ══════════════ SVG 小工具 ══════════════ */
  var W = 260, H = 160;
  function P(v) { return Math.round(v * 10) / 10; }
  function svg(inner) {
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H +
      '" style="max-width:100%;height:auto;display:block;margin:6px auto"' +
      ' fill="none" stroke="currentColor" stroke-width="1.7"' +
      ' stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="題目附圖">' +
      inner + '</svg>';
  }
  function poly(pts) {
    var d = "", pen = false;
    for (var i = 0; i < pts.length; i++) {
      if (!pts[i]) { pen = false; continue; }
      d += (pen ? "L" : "M") + P(pts[i][0]) + " " + P(pts[i][1]);
      pen = true;
    }
    return d ? '<path d="' + d + '"/>' : "";
  }
  /* 把數學座標 (x,y) 換成畫面座標 */
  function mkMap(ox, oy, sx, sy) {
    return function (x, y) { return [ox + sx * x, oy - sy * y]; };
  }
  function curve(f, x0, x1, map, n) {
    var pts = [], i, x, y, p;
    n = n || 100;
    for (i = 0; i <= n; i++) {
      x = x0 + (x1 - x0) * i / n;
      y = f(x);
      if (!isFinite(y)) { pts.push(null); continue; }
      p = map(x, y);
      if (p[0] < 6 || p[0] > W - 6 || p[1] < 6 || p[1] > H - 6) { pts.push(null); continue; }
      pts.push(p);
    }
    return poly(pts);
  }
  function axes(ox, oy) {
    return '<g stroke-width="1" opacity=".5">' +
      '<path d="M6 ' + P(oy) + 'H' + (W - 6) + '"/>' +
      '<path d="M' + P(ox) + ' 6V' + (H - 6) + '"/></g>' +
      '<g fill="currentColor" stroke="none" font-size="9" opacity=".65">' +
      '<text x="' + (W - 14) + '" y="' + P(oy - 5) + '">x</text>' +
      '<text x="' + P(ox + 5) + '" y="14">y</text></g>';
  }
  /* 座標軸刻度（每 step 個單位標一次數字） */
  function ticks(ox, oy, sx, sy, xr, yr, step) {
    var g = '<g stroke-width="1" opacity=".45">', t = '<g fill="currentColor" stroke="none" font-size="8" opacity=".7">', i, p;
    for (i = -xr; i <= xr; i++) {
      if (i === 0) continue;
      p = ox + sx * i;
      if (p < 10 || p > W - 10) continue;
      g += '<path d="M' + P(p) + ' ' + P(oy - 3) + 'V' + P(oy + 3) + '"/>';
      if (i % step === 0) t += '<text x="' + P(p - 3) + '" y="' + P(oy + 13) + '">' + i + '</text>';
    }
    for (i = -yr; i <= yr; i++) {
      if (i === 0) continue;
      p = oy - sy * i;
      if (p < 10 || p > H - 10) continue;
      g += '<path d="M' + P(ox - 3) + ' ' + P(p) + 'H' + P(ox + 3) + '"/>';
      if (i % step === 0) t += '<text x="' + P(ox + 6) + '" y="' + P(p + 3) + '">' + i + '</text>';
    }
    return g + '</g>' + t + '</g>';
  }
  function dot(p, r) {
    return '<circle cx="' + P(p[0]) + '" cy="' + P(p[1]) + '" r="' + (r || 2.6) +
      '" fill="currentColor" stroke="none"/>';
  }
  function label(p, s, dx, dy) {
    return '<text x="' + P(p[0] + (dx || 5)) + '" y="' + P(p[1] + (dy || -5)) +
      '" fill="currentColor" stroke="none" font-size="9">' + s + '</text>';
  }
  function circle(cx, cy, r) {
    return '<circle cx="' + P(cx) + '" cy="' + P(cy) + '" r="' + P(r) + '"/>';
  }
  /* 從 a 指到 b 的箭頭（含箭頭尖） */
  function arrow(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / L, uy = dy / L, hx = b[0] - 7 * ux, hy = b[1] - 7 * uy;
    return '<path d="M' + P(a[0]) + ' ' + P(a[1]) + 'L' + P(b[0]) + ' ' + P(b[1]) + '"/>' +
      '<path d="M' + P(b[0]) + ' ' + P(b[1]) + 'L' + P(hx - 3.2 * uy) + ' ' + P(hy + 3.2 * ux) +
      'L' + P(hx + 3.2 * uy) + ' ' + P(hy - 3.2 * ux) + 'Z" fill="currentColor" stroke="none"/>';
  }

  /* ══════════════ 一、圖形辨識產生器 ══════════════ */

  /* ① 拋物線：開口、判別式、頂點（高一上 3-2） */
  function gGraphParabola() {
    var ox = 130, oy = 86, sx = 22, sy = 13;
    var map = mkMap(ox, oy, sx, sy);
    var a = pick([1, -1, 0.5, -0.5]);
    var askD = ri(2) === 0;
    /* 問頂點時 h、k 都不能是 0（否則 $(h,k)$ 與 $(-h,k)$ 這些誘答會撞在一起） */
    var h = askD ? ri(5) - 2 : pick([-3, -2, -1, 1, 2, 3]);
    var ks = askD ? pick([-3, -2, 0, 2, 3]) : pick([-3, -2, -1, 1, 2, 3]);
    var f = function (x) { return a * (x - h) * (x - h) + ks; };
    var g = svg(axes(ox, oy) + ticks(ox, oy, sx, sy, 5, 5, 2) +
      curve(f, h - 5, h + 5, map) + dot(map(h, ks)));
    if (askD) {
      var ans = (a > 0 && ks < 0) || (a < 0 && ks > 0) ? "$b^2-4ac>0$"
        : ks === 0 ? "$b^2-4ac=0$" : "$b^2-4ac&lt;0$";
      return mk("graph", "g10a-09",
        "這條拋物線（圖中的點是頂點）對應的判別式是？" + g, ans,
        ["$b^2-4ac>0$", "$b^2-4ac=0$", "$b^2-4ac&lt;0$", "無法由圖形判斷"]
          .filter(function (x) { return x !== ans; }),
        "判別式只管「和 x 軸碰幾次」：穿過兩次為正、相切為 0、不碰為負");
    }
    return mk("graph", "g10a-09", "圖中拋物線的頂點座標是？" + g,
      "$(" + h + "," + ks + ")$",
      ["$(" + ks + "," + h + ")$", "$(" + (-h) + "," + ks + ")$",
       "$(" + h + "," + (-ks) + ")$", "$(0," + ks + ")$", "$(" + h + ",0)$"],
      "頂點就是對稱軸與曲線的交點，也是極值發生的位置");
  }

  /* ② 指數與對數函數（高二上 2-1／2-3） */
  function gGraphExpLog() {
    var ox = 112, oy = 112, sx = 26, sy = 22;
    var map = mkMap(ox, oy, sx, sy);
    var kind = ri(4);
    var f, ans, ch, mark;
    if (kind === 0) { f = function (x) { return Math.pow(2, x); }; ans = "$y=2^{x}$"; ch = "g11a-06"; mark = map(0, 1); }
    else if (kind === 1) { f = function (x) { return Math.pow(0.5, x); }; ans = "$y=\\left(\\dfrac12\\right)^{x}$"; ch = "g11a-06"; mark = map(0, 1); }
    else if (kind === 2) { f = function (x) { return x > 0 ? Math.log(x) / Math.log(2) : NaN; }; ans = "$y=\\log_{2}x$"; ch = "g11a-08"; mark = map(1, 0); }
    else { f = function (x) { return x > 0 ? Math.log(x) / Math.log(0.5) : NaN; }; ans = "$y=\\log_{\\frac12}x$"; ch = "g11a-08"; mark = map(1, 0); }
    var g = svg(axes(ox, oy) + ticks(ox, oy, sx, sy, 5, 4, 2) +
      curve(f, -4.5, 5.5, map, 160) + dot(mark));
    return mk("graph", ch, "圖中的曲線是哪一個函數（圖上的點是它必過的點）？" + g, ans,
      ["$y=2^{x}$", "$y=\\left(\\dfrac12\\right)^{x}$", "$y=\\log_{2}x$", "$y=\\log_{\\frac12}x$"]
        .filter(function (x) { return x !== ans; }),
      "指數函數過 $(0,1)$、定義域是全體實數；對數函數過 $(1,0)$、只長在 $x>0$。底數大於 1 遞增、小於 1 遞減");
  }

  /* ③ 三角函數圖形（高二上 1-2） */
  function gGraphSinCos() {
    var ox = 24, oy = 80, sx = 216 / (2 * Math.PI), sy = 26;
    var map = mkMap(ox, oy, sx, sy);
    var kind = ri(4);
    var fns = [
      [function (x) { return Math.sin(x); }, "$y=\\sin x$"],
      [function (x) { return Math.cos(x); }, "$y=\\cos x$"],
      [function (x) { return -Math.sin(x); }, "$y=-\\sin x$"],
      [function (x) { return -Math.cos(x); }, "$y=-\\cos x$"]
    ];
    var g = svg(
      '<g stroke-width="1" opacity=".5"><path d="M6 ' + oy + 'H' + (W - 6) + '"/>' +
      '<path d="M' + ox + ' 12V150"/></g>' +
      '<g stroke-width="1" opacity=".3">' +
      '<path d="M' + P(ox + sx * Math.PI) + ' 40V120"/>' +
      '<path d="M' + P(ox + sx * 2 * Math.PI) + ' 40V120"/></g>' +
      '<g fill="currentColor" stroke="none" font-size="9" opacity=".7">' +
      '<text x="' + P(ox + sx * Math.PI - 4) + '" y="' + (oy + 14) + '">π</text>' +
      '<text x="' + P(ox + sx * 2 * Math.PI - 8) + '" y="' + (oy + 14) + '">2π</text>' +
      '<text x="' + (ox + 4) + '" y="' + P(oy - sy - 3) + '">1</text></g>' +
      curve(fns[kind][0], 0, 2 * Math.PI, map, 160));
    if (ri(3) === 0) {
      return mk("graph", "g11a-02", "圖中函數的週期是多少？" + g, "$2\\pi$",
        ["$\\pi$", "$\\dfrac{\\pi}{2}$", "$4\\pi$"],
        "圖形在 $0$ 到 $2\\pi$ 之間剛好走完一個完整的波");
    }
    return mk("graph", "g11a-02", "圖中畫的是哪一個函數（$0\\le x\\le2\\pi$）？" + g,
      fns[kind][1], fns.map(function (r) { return r[1]; })
        .filter(function (x) { return x !== fns[kind][1]; }),
      "從 $x=0$ 的值下手：$\\sin$ 由 0 往上、$\\cos$ 由 1 往下，加負號就上下翻轉");
  }

  /* ④ 兩圓的位置關係（高一上 2-3） */
  function gGraphTwoCircles() {
    var kind = ri(5);
    var r1 = 26 + 6 * ri(3), r2 = 18 + 5 * ri(3), d;
    if (kind === 0) d = r1 + r2 + 16;            /* 外離 */
    else if (kind === 1) d = r1 + r2;            /* 外切 */
    else if (kind === 2) d = r1 + Math.round(r2 * 0.2); /* 相交 */
    else if (kind === 3) d = r1 - r2;            /* 內切 */
    else d = Math.max(2, r1 - r2 - 10);          /* 內含 */
    var names = ["外離（相離）", "外切", "交於兩點", "內切", "內離（一圓在另一圓內部）"];
    var ans = names[kind];
    var c1x = (W - d) / 2, c2x = c1x + d, cy = 80;
    var g = svg(circle(c1x, cy, r1) + circle(c2x, cy, r2) +
      dot([c1x, cy], 2) + dot([c2x, cy], 2) +
      '<g stroke-width="1" opacity=".45" stroke-dasharray="3 3">' +
      '<path d="M' + P(c1x) + ' ' + cy + 'H' + P(c2x) + '"/></g>');
    return mk("graph", "g10a-07", "圖中兩圓的位置關係是？" + g, ans,
      names.filter(function (n) { return n !== ans; }),
      "只看圓心距 $d$ 與 $r_1+r_2$、$|r_1-r_2|$ 的大小：$d>r_1+r_2$ 外離、$=$ 外切、" +
      "夾在中間相交、$d=|r_1-r_2|$ 內切、更小則內離");
  }

  /* ⑤ 直線與圓的關係（高一上 2-3） */
  function gGraphLineCircle() {
    var cx = 130, cy = 80, r = 34 + 5 * ri(3);
    var kind = ri(3);
    var d = kind === 0 ? r + 14 + 4 * ri(3) : kind === 1 ? r : Math.round(r * 0.45);
    var names = ["相離（沒有交點）", "相切（恰一個交點）", "相交於兩點", "無法由圖形判斷"];
    var ans = names[kind];   /* kind 只會是 0～2，第四個永遠是誘答 */
    /* 畫一條與圓心距離為 d 的斜線 */
    var th = (20 + 10 * ri(5)) * Math.PI / 180;
    var nx = Math.cos(th), ny = Math.sin(th);
    var fx = cx + d * nx, fy = cy + d * ny;         /* 垂足 */
    var g = svg(circle(cx, cy, r) + dot([cx, cy], 2) +
      poly([[fx - 150 * ny, fy + 150 * nx], [fx + 150 * ny, fy - 150 * nx]]) +
      '<g stroke-width="1" opacity=".45" stroke-dasharray="3 3">' +
      poly([[cx, cy], [fx, fy]]) + '</g>');
    return mk("graph", "g10a-07", "圖中直線與圓的關係是？" + g, ans,
      names.filter(function (n) { return n !== ans; }),
      "比較圓心到直線的距離 $d$（圖中的虛線）與半徑 $r$：$d>r$ 相離、$d=r$ 相切、$d&lt;r$ 相交");
  }

  /* ⑥ 散布圖與相關係數（高一下 4-2） */
  function gGraphScatter() {
    var kind = ri(4);
    var pts = "", i, x, y, n = 11;
    for (i = 0; i < n; i++) {
      x = 30 + i * 19 + ri(7) - 3;
      if (kind === 0) y = 130 - (x - 30) * 0.42 + (ri(21) - 10);        /* 強正相關 */
      else if (kind === 1) y = 32 + (x - 30) * 0.42 + (ri(21) - 10);    /* 強負相關 */
      else if (kind === 2) y = 80 + (ri(71) - 35);                      /* 幾乎沒有線性關係 */
      else y = 130 - (x - 30) * 0.42;                                   /* 完全共線 */
      y = Math.max(16, Math.min(144, y));
      pts += dot([x, y], 2.8);
    }
    var names = ["接近 $0.9$（強正相關）", "接近 $-0.9$（強負相關）",
                 "接近 $0$（幾乎沒有線性關係）", "剛好 $1$（所有點共線且遞增）"];
    var ans = names[kind];
    var g = svg('<g stroke-width="1" opacity=".5">' +
      '<path d="M22 148H250"/><path d="M22 12V148"/></g>' + pts);
    return mk("graph", "g10b-09", "圖中這組資料的相關係數 $r$ 最接近？" + g, ans,
      names.filter(function (x2) { return x2 !== ans; }),
      "往右上走是正、右下走是負；愈貼近一條直線 $|r|$ 愈接近 1，散成一團則接近 0");
  }

  /* ⑦ 三次函數與實根個數（高一上 3-3） */
  function gGraphCubic() {
    var ox = 130, oy = 80, sx = 24, sy = 9;
    var map = mkMap(ox, oy, sx, sy);
    var kind = ri(3);
    var a = pick([1, -1]);
    var f, ans;
    if (kind === 0) { f = function (x) { return a * (x * x * x - 4 * x); }; ans = "3 個"; }
    else if (kind === 1) { f = function (x) { return a * (x * x * x - 3 * x + 2); }; ans = "2 個（其中一個是重根）"; }
    else { f = function (x) { return a * (x * x * x + 2 * x); }; ans = "1 個"; }
    var g = svg(axes(ox, oy) + ticks(ox, oy, sx, sy, 4, 7, 2) + curve(f, -4, 4, map, 160));
    return mk("graph", "g10a-10", "圖中三次函數 $y=f(x)$，方程式 $f(x)=0$ 有幾個<b>相異</b>實根？" + g,
      ans, ["1 個", "2 個（其中一個是重根）", "3 個", "0 個"]
        .filter(function (x) { return x !== ans; }),
      "實根個數就是圖形與 $x$ 軸的交點個數；碰到就彈回去的那個交點是重根");
  }

  /* ⑧ 兩向量的夾角與內積正負（高二上 3-2） */
  function gGraphVector() {
    var ox = 128, oy = 80, s = 22;
    var map = mkMap(ox, oy, s, s);
    /* 兩軸必須同比例（否則角度看起來會變形），所以 y 分量要限制在畫得下的 ±3 */
    function vec() { var v; do { v = [ri(11) - 5, ri(7) - 3]; } while (v[0] === 0 && v[1] === 0); return v; }
    var u, v, d, cross;
    for (var t = 0; t < 60; t++) {
      u = vec(); v = vec();
      d = u[0] * v[0] + u[1] * v[1];
      cross = u[0] * v[1] - u[1] * v[0];
      if (cross !== 0) break;                 /* 避免同向／反向，角度才讀得出來 */
    }
    if (cross === 0) { u = [3, 1]; v = [-1, 3]; d = 0; }
    var g = svg(axes(ox, oy) + ticks(ox, oy, s, s, 5, 3, 2) +
      arrow(map(0, 0), map(u[0], u[1])) + label(map(u[0], u[1]), "u") +
      arrow(map(0, 0), map(v[0], v[1])) + label(map(v[0], v[1]), "v"));
    var ans = d > 0 ? "銳角（內積 $>0$）" : d < 0 ? "鈍角（內積 $&lt;0$）" : "直角（內積 $=0$）";
    return mk("graph", "g11a-10", "圖中兩個向量 $\\vec u$、$\\vec v$ 的夾角是？" + g, ans,
      ["銳角（內積 $>0$）", "鈍角（內積 $&lt;0$）", "直角（內積 $=0$）", "平角（兩向量反向）"]
        .filter(function (x) { return x !== ans; }),
      "$\\vec u\\cdot\\vec v=" + u[0] + "\\times" + v[0] + "+" + u[1] + "\\times" + v[1] + "=" + d +
      "$：內積的正負就是夾角 $\\cos$ 的正負");
  }

  /* ⑨ 由圖讀直線斜率（高一上 2-1） */
  function gGraphLineSlope() {
    var ox = 130, oy = 80, s = 22;
    var map = mkMap(ox, oy, s, s);
    var m = pick([1, 2, 3, -1, -2, -3]);
    var dx = Math.abs(m) >= 2 ? 1 : 2;
    var dy = m * dx;
    /* 兩個點都要落在畫得下的範圍內（|x|≤5、|y|≤3） */
    var x1 = -5 + ri(11 - dx);          /* x1 ∈ [-5, 5-dx] */
    var x2 = x1 + dx;
    var ylo = Math.max(-3, -3 - dy), yhi = Math.min(3, 3 - dy);
    var y1 = ylo + ri(yhi - ylo + 1);
    var y2 = y1 + dy;
    var f = function (x) { return y1 + m * (x - x1); };
    var g = svg(axes(ox, oy) + ticks(ox, oy, s, s, 5, 3, 2) +
      curve(f, -6, 6, map, 120) + dot(map(x1, y1)) + dot(map(x2, y2)) +
      label(map(x1, y1), "A", 5, 12) + label(map(x2, y2), "B"));
    return mk("graph", "g10a-05", "圖中直線通過標出的 A、B 兩點，它的斜率是？" + g,
      String(m), [String(-m), String(m + 1), String(m - 1), String(2 * m)],
      "斜率 $=\\dfrac{\\Delta y}{\\Delta x}=\\dfrac{" + (y2 - y1) + "}{" + (x2 - x1) + "}=" + m +
      "$：向右一格往上幾格就是幾");
  }

  /* ⑩ 盒狀圖（高一下 4-1） */
  function gGraphBox() {
    var lo = 2 * (1 + ri(4));
    var q1 = lo + 2 * (2 + ri(3));
    var md = q1 + 2 * (2 + ri(3));   /* 至少差 4，數字標籤才不會疊在一起 */
    var q3 = md + 2 * (2 + ri(3));
    var hi = q3 + 2 * (2 + ri(4));
    var x0 = 26, x1 = 234;
    var sc = function (v) { return x0 + (x1 - x0) * (v - lo + 4) / (hi - lo + 8); };
    var cy = 62;
    var g = svg(
      poly([[sc(lo), cy], [sc(q1), cy]]) + poly([[sc(q3), cy], [sc(hi), cy]]) +
      poly([[sc(lo), cy - 9], [sc(lo), cy + 9]]) + poly([[sc(hi), cy - 9], [sc(hi), cy + 9]]) +
      '<rect x="' + P(sc(q1)) + '" y="' + (cy - 16) + '" width="' + P(sc(q3) - sc(q1)) +
      '" height="32" rx="2"/>' +
      poly([[sc(md), cy - 16], [sc(md), cy + 16]]) +
      '<g stroke-width="1" opacity=".45"><path d="M18 106H244"/></g>' +
      '<g fill="currentColor" stroke="none" font-size="9" text-anchor="middle">' +
      [lo, q1, md, q3, hi].map(function (v) {
        return '<text x="' + P(sc(v)) + '" y="120">' + v + '</text>';
      }).join("") + '</g>' +
      '<g stroke-width="1" opacity=".45">' +
      [lo, q1, md, q3, hi].map(function (v) {
        return '<path d="M' + P(sc(v)) + ' 102V110"/>';
      }).join("") + '</g>');
    if (ri(2)) {
      return mk("graph", "g10b-08", "圖中盒狀圖的<b>四分位距</b>（IQR）是多少？" + g,
        String(q3 - q1), [String(hi - lo), String(md), String(q3 - md), String(md - q1)],
        "$\\mathrm{IQR}=Q_3-Q_1=" + q3 + "-" + q1 + "$：就是盒子的長度，不是整條鬍鬚的長度");
    }
    return mk("graph", "g10b-08", "圖中盒狀圖的<b>中位數</b>是多少？" + g,
      String(md), [String(q1), String(q3), String((lo + hi) / 2), String(hi - lo)],
      "盒子中間那條線就是中位數；盒子的兩端是 $Q_1$ 與 $Q_3$");
  }

  /* ⑪ 平移後的拋物線（高二上 1-2 的平移直覺，掛在高一上 3-2） */
  function gGraphShift() {
    var ox = 130, oy = 100, sx = 24, sy = 11;
    var map = mkMap(ox, oy, sx, sy);
    var h = pick([-3, -2, -1, 1, 2, 3]), k = pick([-3, -2, 1, 2, 3]);
    var f = function (x) { return (x - h) * (x - h) + k; };
    function eq(a, b) {
      return "$y=(x" + (a > 0 ? "-" + a : "+" + (-a)) + ")^2" + (b >= 0 ? "+" + b : "-" + (-b)) + "$";
    }
    var g = svg(axes(ox, oy) + ticks(ox, oy, sx, sy, 4, 4, 2) +
      curve(function (x) { return x * x; }, -3.2, 3.2, map, 120).replace('<path d="', '<path opacity=".35" stroke-dasharray="4 3" d="') +
      curve(f, h - 3.2, h + 3.2, map, 120) + dot(map(h, k)));
    return mk("graph", "g10a-09",
      "虛線是 $y=x^2$，實線是它平移後的結果。實線的方程式是？" + g,
      eq(h, k), [eq(-h, k), eq(h, -k), eq(-h, -k), eq(k, h)],
      "括號裡是 $x-h$ 就往<b>右</b>移 $h$（$h$ 為負就往左）；外面加 $k$ 就往上移 $k$");
  }

  /* ══════════════ 二、秒算直覺追加產生器 ══════════════ */

  /* 等差／等比級數的和（高一下 1-2） */
  function gSeqSum() {
    if (ri(2)) {
      var a1 = 1 + ri(9), d = 1 + ri(5), n = 5 + ri(8);
      var S = n * (2 * a1 + (n - 1) * d) / 2;
      return mk("quick", "g10b-02",
        "等差數列 $a_1=" + a1 + "$、公差 $d=" + d + "$，前 $" + n + "$ 項和 $S_{" + n + "} = \\ ?$",
        String(S),
        [String(n * (2 * a1 + n * d) / 2), String(a1 + (n - 1) * d), String(n * a1)],
        "$S_n=\\dfrac{n\\left[2a_1+(n-1)d\\right]}{2}=\\dfrac{" + n + "(" + (2 * a1) + "+" +
        ((n - 1) * d) + ")}{2}=" + S + "$");
    }
    var b1 = pick([1, 2, 3]), r = pick([2, 3]), m = 4 + ri(4);
    var G = b1 * (Math.pow(r, m) - 1) / (r - 1);
    return mk("quick", "g10b-02",
      "等比數列 $a_1=" + b1 + "$、公比 $r=" + r + "$，前 $" + m + "$ 項和 $S_{" + m + "} = \\ ?$",
      String(G),
      [String(b1 * Math.pow(r, m - 1)), String(b1 * Math.pow(r, m)), String(G * r)],
      "$S_n=\\dfrac{a_1(r^n-1)}{r-1}=\\dfrac{" + b1 + "(" + Math.pow(r, m) + "-1)}{" + (r - 1) +
      "}=" + G + "$；$r=1$ 時要另外討論");
  }

  /* 餘式定理：代值（高一上 3-1） */
  function gRemainder() {
    var b = ri(7) - 3, c = ri(7) - 3, d = ri(9) - 4, k = pick([-3, -2, -1, 1, 2, 3]);
    var val = k * k * k + b * k * k + c * k + d;
    function term(n, v) {
      if (n === 0) return "";
      return (n < 0 ? "-" : "+") + (Math.abs(n) === 1 && v ? "" : Math.abs(n)) + v;
    }
    var body = "x^3" + term(b, "x^2") + term(c, "x") + term(d, "");
    return mk("quick", "g10a-08",
      "$f(x)=" + body + "$ 除以 $x" + (k < 0 ? "+" + (-k) : "-" + k) + "$ 的餘式 = ?",
      String(val),
      [String(d), String(1 + b + c + d), String(-k * k * k + b * k * k - c * k + d), String(val + k)],
      "餘式定理：除以一次式時餘式是常數，直接代 $f(" + k + ")=" + val + "$，不必做長除法");
  }

  /* 對數化簡（高二上 2-2） */
  var LOGROWS = [
    ["\\log_2 6+\\log_2 8-\\log_2 3", 4, "$\\log_2\\dfrac{6\\times8}{3}=\\log_2 16$"],
    ["\\log_2 40-\\log_2 5", 3, "$\\log_2\\dfrac{40}{5}=\\log_2 8$"],
    ["\\log_3 54-\\log_3 2", 3, "$\\log_3 27$"],
    ["\\log_3 2+\\log_3 12-\\log_3 8", 1, "$\\log_3\\dfrac{2\\times12}{8}=\\log_3 3$"],
    ["\\log_5 50+\\log_5 10-\\log_5 4", 3, "$\\log_5 125$"],
    ["\\log 25+\\log 4", 2, "$\\log 100$（底數 10 可以不寫）"],
    ["\\log 500-\\log 5", 2, "$\\log 100$"],
    ["\\log 2+\\log 5", 1, "$\\log 10=1$，這一組最常用"],
    ["\\log_3 81-\\log_3 9", 2, "$\\log_3 9$"],
    ["\\log_2 3\\cdot\\log_3 8", 3, "換底連鎖：中間的 $\\log 3$ 對消，剩 $\\log_2 8$"],
    ["\\log_2 \\sqrt{32}", 2.5, "$\\sqrt{32}=2^{2.5}$"],
    ["\\log_4 64", 3, "$4^3=64$"]
  ];
  function gLogSimp() {
    var r = pick(LOGROWS);
    var v = r[1];
    return mk("quick", "g11a-07", "$" + r[0] + " = \\ ?$", String(v),
      [String(v + 1), String(v - 1), String(v * 2)],
      "先用對數律併成一個 $\\log$：" + r[2] + "，答案 " + v);
  }

  /* 排列數：重複與相鄰（高一下 2-2） */
  function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
  function gArrange() {
    if (ri(2)) {
      var n = 4 + ri(3), p = 2 + ri(2);
      if (p >= n) p = 2;
      var ans = fact(n) / fact(p);
      return mk("quick", "g10b-04",
        "$" + n + "$ 個字母排成一列，其中有 $" + p + "$ 個完全相同，共有幾種排法？",
        String(ans), [String(fact(n)), String(fact(n) / p), String(fact(n - p))],
        "$\\dfrac{" + n + "!}{" + p + "!}=" + ans + "$：相同的東西互換看起來一樣，要把重複除掉");
    }
    var m = 4 + ri(3);
    var v = fact(m - 1) * 2;
    return mk("quick", "g10b-04",
      "$" + m + "$ 人排成一列，其中甲乙<b>必須相鄰</b>，共有幾種排法？",
      String(v), [String(fact(m)), String(fact(m - 1)), String(fact(m) - v)],
      "捆綁法：甲乙綁成一綑 → $" + (m - 1) + "!\\times2!=" + v + "$（最後那個誘答是「不相鄰」的答案）");
  }

  /* 條件機率（高二下 4-1） */
  var CPROWS = [
    ["0.12", "0.4", "0.3", ["0.048", "0.28", "0.12"]],
    ["0.15", "0.5", "0.3", ["0.075", "0.35", "0.15"]],
    ["0.2", "0.5", "0.4", ["0.1", "0.3", "0.25"]],
    ["0.18", "0.6", "0.3", ["0.108", "0.42", "0.18"]],
    ["0.35", "0.7", "0.5", ["0.245", "0.35", "0.7"]],
    ["0.28", "0.7", "0.4", ["0.196", "0.42", "0.28"]],
    ["0.45", "0.9", "0.5", ["0.405", "0.45", "0.9"]],
    ["0.22", "0.55", "0.4", ["0.121", "0.33", "0.22"]]
  ];
  function gCondProb() {
    var r = pick(CPROWS);
    return mk("quick", "g11b-11",
      "已知 $P(A\\cap B)=" + r[0] + "$、$P(B)=" + r[1] + "$，則 $P(A|B) = \\ ?$",
      r[2], r[3],
      "$P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{" + r[0] + "}{" + r[1] + "}=" + r[2] +
      "$：分母換成已知事件的機率");
  }

  /* 標準差的線性變換（高一下 4-1） */
  function gStdLinear() {
    var m = pick([50, 60, 70, 80]), s = pick([4, 5, 6, 8, 10]);
    var a = 2 + ri(3), b = pick([-10, -5, 5, 10, 20]);
    var head = "一組資料的平均數是 $" + m + "$、標準差是 $" + s + "$。若每筆資料都<b>乘 $" +
      a + "$ 再加 $" + b + "$</b>，";
    var mode = ri(3);
    if (mode === 0) {
      return mk("quick", "g10b-08", head + "新的平均數 = ?", String(a * m + b),
        [String(m + b), String(a * m), String(m), String(a * (m + b))],
        "平均數跟著整組一起變：$" + a + "\\times" + m + (b < 0 ? "-" + (-b) : "+" + b) + "=" + (a * m + b) + "$");
    }
    if (mode === 1) {
      return mk("quick", "g10b-08", head + "新的標準差 = ?", String(a * s),
        [String(a * s + b), String(s), String(s + b), String(a * s * a)],
        "平移不影響分散程度，只有伸縮才會：標準差 $\\times" + a + "$，常數 $" + b + "$ 沒有作用");
    }
    return mk("quick", "g10b-08", head + "新的變異數 = ?", String(a * a * s * s),
      [String(a * s * s), String(s * s), String(a * s), String(a * a * s * s + b)],
      "變異數是標準差的平方 → $\\times" + a + "^2=" + (a * a) + "$：$" + (s * s) + "\\times" +
      (a * a) + "=" + (a * a * s * s) + "$");
  }

  /* 複利（高二上 2-1） */
  var CPD = [
    [10000, 10, 2, 12100], [10000, 10, 3, 13310], [20000, 10, 2, 24200],
    [10000, 20, 2, 14400], [10000, 20, 3, 17280], [50000, 20, 2, 72000],
    [10000, 50, 2, 22500], [10000, 50, 3, 33750], [20000, 50, 2, 45000],
    [10000, 25, 2, 15625]
  ];
  function gCompound() {
    var r = pick(CPD), P0 = r[0], pct = r[1], n = r[2], A = r[3];
    var simple = P0 + P0 * pct * n / 100;
    return mk("quick", "g11a-06",
      "本金 $" + P0 + "$ 元，年利率 $" + pct + "\\%$、每年複利一次，$" + n + "$ 年後的本利和 = ?",
      String(A), [String(simple), String(P0 * (100 + pct) / 100), String(A + P0)],
      "$" + P0 + "\\times\\left(1+" + (pct / 100) + "\\right)^{" + n + "}=" + A +
      "$（誘答 " + simple + " 是單利的算法）");
  }

  /* 三角形面積 ½ab sin C（高一下 5-3） */
  function gTriArea() {
    var a = pick([2, 4, 6, 8]), b = pick([2, 4, 6, 8]);
    var C = pick([30, 45, 60, 90, 120, 135, 150]);
    var q = a * b / 4;
    var forms = {
      half: "$" + (a * b / 2) + "$",
      quarter: "$" + q + "$",
      root2: "$" + q + "\\sqrt{2}$",
      root3: "$" + q + "\\sqrt{3}$"
    };
    var key = (C === 90) ? "half" : (C === 30 || C === 150) ? "quarter"
      : (C === 45 || C === 135) ? "root2" : "root3";
    var sinTex = (C === 90) ? "1" : (C === 30 || C === 150) ? "\\dfrac12"
      : (C === 45 || C === 135) ? "\\dfrac{\\sqrt2}{2}" : "\\dfrac{\\sqrt3}{2}";
    var ans = forms[key];
    return mk("quick", "g10b-12",
      "三角形兩邊長 $" + a + "$、$" + b + "$，夾角 $" + C + "^\\circ$，面積 = ?",
      ans, Object.keys(forms).filter(function (k) { return k !== key; })
        .map(function (k) { return forms[k]; }),
      "$\\dfrac12ab\\sin C=\\dfrac12\\times" + a + "\\times" + b + "\\times" + sinTex +
      "$；鈍角的 $\\sin$ 與其補角相同");
  }

  /* 二項式展開的係數（高一下 2-3） */
  function comb(n, r) { return fact(n) / (fact(r) * fact(n - r)); }
  function gBinomTerm() {
    var n = 4 + ri(3), c = 1 + ri(3), k = 1 + ri(n - 1);
    var coef = comb(n, k) * Math.pow(c, n - k);
    return mk("quick", "g10b-05",
      "$(x+" + c + ")^{" + n + "}$ 展開後，$x^{" + k + "}$ 的係數 = ?",
      String(coef),
      [String(comb(n, k)), String(Math.pow(c, n - k)), String(comb(n, k) * Math.pow(c, k)),
       String(coef + c)],
      "通項 $C^{" + n + "}_{" + k + "}x^{" + k + "}\\cdot" + c + "^{" + (n - k) + "}=" +
      comb(n, k) + "\\times" + Math.pow(c, n - k) + "=" + coef + "$");
  }

  /* 兩直線的交點（高一上 2-1） */
  function gLineCross() {
    var p = ri(7) - 3, q = ri(7) - 3;
    if (p === q) q = q + 1;
    var m1 = pick([1, 2, -1, -2]), m2 = pick([3, -3, 0]);
    if (m1 === m2) m2 = m1 + 1;
    function line(m) {
      var b = q - m * p;
      return "$y=" + (m === 1 ? "" : m === -1 ? "-" : m === 0 ? "" : m) + (m === 0 ? "" : "x") +
        (m === 0 ? b : (b === 0 ? "" : (b < 0 ? "-" + (-b) : "+" + b))) + "$";
    }
    var pt = function (x, y) { return "$(" + x + "," + y + ")$"; };
    return mk("quick", "g10a-05",
      "直線 " + line(m1) + " 與 " + line(m2) + " 的交點座標？",
      pt(p, q), [pt(q, p), pt(-p, q), pt(p, -q), pt(p + 1, q), pt(p, q + 1)],
      "兩式相減消去 $y$：解出 $x=" + p + "$ 再代回得 $y=" + q + "$");
  }

  /* 向量垂直求未知數（高二上 3-2） */
  function gPerpK() {
    var a = pick([1, 2, 3, 4, -1, -2, -3]), b = pick([1, 2, 3]);
    var m = pick([1, 2, -1, -2]);
    var c = b * m, k = -a * m;
    return mk("quick", "g11a-10",
      "$\\vec{u}=(" + a + "," + b + ")$ 與 $\\vec{v}=(" + c + ",k)$ 互相垂直，$k = \\ ?$",
      String(k), [String(-k), String(a * b), String(a + b), String(c)],
      "垂直 ⟹ 內積為 0：$(" + a + ")(" + c + ")+(" + b + ")k=0$ → $k=" + k + "$");
  }

  /* 平均數與中位數（高一下 4-1） */
  function gCenterStat() {
    var v = [], i, s = 0;
    for (i = 0; i < 5; i++) { v.push(2 + ri(19)); s += v[i]; }
    if (ri(2)) {
      /* 調整最後一項讓平均是整數 */
      var fix = (5 - (s % 5)) % 5;
      v[4] += fix; s += fix;
      var mean = s / 5;
      var sorted0 = v.slice().sort(function (x, y) { return x - y; });
      return mk("quick", "g10b-08",
        "資料 $" + v.join(",\\ ") + "$ 的<b>平均數</b> = ?", String(mean),
        [String(sorted0[2]), String(sorted0[4] - sorted0[0]), String(mean + 1), String(s)],
        "總和 $" + s + "\\div5=" + mean + "$；誘答 " + sorted0[2] + " 是中位數");
    }
    var sorted = v.slice().sort(function (x, y) { return x - y; });
    var med = sorted[2], sum = v.reduce(function (x, y) { return x + y; }, 0);
    return mk("quick", "g10b-08",
      "資料 $" + v.join(",\\ ") + "$ 的<b>中位數</b> = ?", String(med),
      [String(Math.round(sum / 5)), String(sorted[0]), String(sorted[4]),
       String(sorted[4] - sorted[0])],
      "先排序：$" + sorted.join(",\\ ") + "$，取正中間那一個 → " + med);
  }

  RB.extend({
    gens: {
      graph: [
        { f: gGraphParabola,  w: 3, chs: ["g10a-09"] },
        { f: gGraphShift,     w: 2, chs: ["g10a-09"] },
        { f: gGraphExpLog,    w: 3, chs: ["g11a-06", "g11a-08"] },
        { f: gGraphSinCos,    w: 3, chs: ["g11a-02"] },
        { f: gGraphTwoCircles,w: 2, chs: ["g10a-07"] },
        { f: gGraphLineCircle,w: 2, chs: ["g10a-07"] },
        { f: gGraphScatter,   w: 2, chs: ["g10b-09"] },
        { f: gGraphCubic,     w: 2, chs: ["g10a-10"] },
        { f: gGraphVector,    w: 3, chs: ["g11a-10"] },
        { f: gGraphLineSlope, w: 2, chs: ["g10a-05"] },
        { f: gGraphBox,       w: 2, chs: ["g10b-08"] }
      ],
      quick: [
        { f: gSeqSum,     w: 2, chs: ["g10b-02"] },
        { f: gRemainder,  w: 2, chs: ["g10a-08"] },
        { f: gLogSimp,    w: 2, chs: ["g11a-07"] },
        { f: gArrange,    w: 2, chs: ["g10b-04"] },
        { f: gCondProb,   w: 2, chs: ["g11b-11"] },
        { f: gStdLinear,  w: 2, chs: ["g10b-08"] },
        { f: gCompound,   w: 2, chs: ["g11a-06"] },
        { f: gTriArea,    w: 2, chs: ["g10b-12"] },
        { f: gBinomTerm,  w: 2, chs: ["g10b-05"] },
        { f: gLineCross,  w: 2, chs: ["g10a-05"] },
        { f: gPerpK,      w: 2, chs: ["g11a-10"] },
        { f: gCenterStat, w: 2, chs: ["g10b-08"] }
      ]
    }
  });
})();
