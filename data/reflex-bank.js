/* 牛夫子直覺道場 — 題庫
 * 五大題型：特殊角三角值／角度變換／關鍵字反射／公式辨識／秒算直覺
 * 每一題都標了所屬章節 id（對應 data/curriculum.js），才能依「章節／學測／全範圍」出題。
 * 靜態題目手寫；三角與計算題由產生器即時出題（題數近乎無限、不會背答案位置）。
 * 輸出格式：{ cat, ch, q, choices:[html...], ans:index, tip, key }
 */
(function () {
  "use strict";

  /* ────────── 小工具 ────────── */
  function ri(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[ri(a.length)]; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = ri(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  /* 約分後的分數 LaTeX（分母為 1 時直接寫整數） */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function frac(n, d) {
    if (d < 0) { n = -n; d = -d; }
    var g = gcd(n, d) || 1;
    n /= g; d /= g;
    if (d === 1) return String(n);
    return (n < 0 ? "-" : "") + "\\dfrac{" + Math.abs(n) + "}{" + d + "}";
  }
  function distract(ans, prefer, pool) {
    var out = [];
    function add(x) {
      if (x == null || x === ans) return;
      if (out.indexOf(x) >= 0) return;
      out.push(x);
    }
    (prefer || []).forEach(add);
    shuffle(pool || []).forEach(add);
    return out.slice(0, 3);
  }
  /* 組題：正解＋誘答洗牌。
   * 保險機制：誘答一律去重、剔除與正解相同者；數值題不足三個時自動用鄰近數字補齊，
   * 避免任何產生器不小心生出兩個一樣的選項。 */
  function mk(cat, ch, q, ans, wrongs, tip) {
    var uniq = [];
    (wrongs || []).forEach(function (w) {
      if (w != null && w !== ans && uniq.indexOf(w) < 0) uniq.push(w);
    });
    var n = parseFloat(ans);
    var numeric = !isNaN(n) && String(n) === String(ans).trim();
    for (var d = 1; uniq.length < 3 && numeric && d < 40; d++) {
      [n + d, n - d].forEach(function (c) {
        var s = String(c);
        if (uniq.length < 3 && s !== ans && uniq.indexOf(s) < 0) uniq.push(s);
      });
    }
    var ch4 = shuffle([ans].concat(uniq.slice(0, 3)));
    return { cat: cat, ch: ch, q: q, choices: ch4, ans: ch4.indexOf(ans), tip: tip, key: cat + "|" + q };
  }

  /* ────────── 題型定義 ────────── */
  var CATS = [
    { id: "trig",    name: "特殊角三角值", icon: "📐", timeMul: 1.00,
      desc: "單位圓上的值，要像反射一樣蹦出來" },
    { id: "trans",   name: "角度變換",     icon: "🔄", timeMul: 1.00,
      desc: "誘導公式、弧度換算、象限判斷" },
    { id: "keyword", name: "關鍵字反射",   icon: "🔑", timeMul: 1.20,
      desc: "看到這句話，手要自動往哪個方向動" },
    { id: "formula", name: "公式辨識",     icon: "🧩", timeMul: 1.05,
      desc: "看到這個結構，這是誰的公式" },
    { id: "concept", name: "觀念判斷",     icon: "🧠", timeMul: 1.15,
      desc: "一句話對不對？專挑最容易記反的地方" },
    { id: "link",    name: "串聯反射",     icon: "🔗", timeMul: 1.15,
      desc: "這一章的東西，在別章叫什麼名字" },
    { id: "graph",   name: "圖形辨識",     icon: "📈", timeMul: 1.10,
      desc: "只看圖，判斷這是誰、是哪一種情形" },
    { id: "quick",   name: "秒算直覺",     icon: "⚡", timeMul: 1.30,
      desc: "指對數、組合、行列式、內積的心算" }
  ];

  /* 學測範圍＝108 課綱必修（高一上下＋高二上下數A）；選修甲上下不在學測範圍 */
  var GSAT_SEMS = ["g10a", "g10b", "g11a", "g11b"];

  /* 目前已建置的章節頁（沒列到的章節只是少一個連結，不會出錯）。
   * 之後補了新的章節頁，把 id 加進來就會自動變成可點的複習連結。 */
  var HAS_PAGE = {
    "g10a-01": 1, "g10a-02": 1, "g10a-03": 1, "g10a-04": 1, "g10a-05": 1, "g10a-06": 1,
    "g10a-09": 1, "g10a-10": 1, "g10a-11": 1,
    "g10b-01": 1, "g10b-03": 1, "g10b-04": 1, "g10b-05": 1, "g10b-06": 1, "g10b-07": 1,
    "g10b-08": 1, "g10b-11": 1, "g10b-12": 1,
    "g11a-01": 1, "g11a-03": 1, "g11a-04": 1, "g11a-05": 1, "g11a-06": 1, "g11a-11": 1, "g11a-12": 1
  };

  /* ══════════════ 一、特殊角三角值 ══════════════ */

  var TV = {
    0:   ["0", "1", "0"],
    30:  ["\\dfrac{1}{2}", "\\dfrac{\\sqrt{3}}{2}", "\\dfrac{\\sqrt{3}}{3}"],
    45:  ["\\dfrac{\\sqrt{2}}{2}", "\\dfrac{\\sqrt{2}}{2}", "1"],
    60:  ["\\dfrac{\\sqrt{3}}{2}", "\\dfrac{1}{2}", "\\sqrt{3}"],
    90:  ["1", "0", null],
    120: ["\\dfrac{\\sqrt{3}}{2}", "-\\dfrac{1}{2}", "-\\sqrt{3}"],
    135: ["\\dfrac{\\sqrt{2}}{2}", "-\\dfrac{\\sqrt{2}}{2}", "-1"],
    150: ["\\dfrac{1}{2}", "-\\dfrac{\\sqrt{3}}{2}", "-\\dfrac{\\sqrt{3}}{3}"],
    180: ["0", "-1", "0"],
    210: ["-\\dfrac{1}{2}", "-\\dfrac{\\sqrt{3}}{2}", "\\dfrac{\\sqrt{3}}{3}"],
    225: ["-\\dfrac{\\sqrt{2}}{2}", "-\\dfrac{\\sqrt{2}}{2}", "1"],
    240: ["-\\dfrac{\\sqrt{3}}{2}", "-\\dfrac{1}{2}", "\\sqrt{3}"],
    270: ["-1", "0", null],
    300: ["-\\dfrac{\\sqrt{3}}{2}", "\\dfrac{1}{2}", "-\\sqrt{3}"],
    315: ["-\\dfrac{\\sqrt{2}}{2}", "\\dfrac{\\sqrt{2}}{2}", "-1"],
    330: ["-\\dfrac{1}{2}", "\\dfrac{\\sqrt{3}}{2}", "-\\dfrac{\\sqrt{3}}{3}"]
  };
  var DEGS = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  var RAD = {
    0: "0", 30: "\\dfrac{\\pi}{6}", 45: "\\dfrac{\\pi}{4}", 60: "\\dfrac{\\pi}{3}", 90: "\\dfrac{\\pi}{2}",
    120: "\\dfrac{2\\pi}{3}", 135: "\\dfrac{3\\pi}{4}", 150: "\\dfrac{5\\pi}{6}", 180: "\\pi",
    210: "\\dfrac{7\\pi}{6}", 225: "\\dfrac{5\\pi}{4}", 240: "\\dfrac{4\\pi}{3}", 270: "\\dfrac{3\\pi}{2}",
    300: "\\dfrac{5\\pi}{3}", 315: "\\dfrac{7\\pi}{4}", 330: "\\dfrac{11\\pi}{6}"
  };
  var FN = ["\\sin", "\\cos", "\\tan"];
  var POOL_SC = ["0", "1", "-1", "\\dfrac{1}{2}", "-\\dfrac{1}{2}",
    "\\dfrac{\\sqrt{2}}{2}", "-\\dfrac{\\sqrt{2}}{2}", "\\dfrac{\\sqrt{3}}{2}", "-\\dfrac{\\sqrt{3}}{2}"];
  var POOL_T = ["0", "1", "-1", "\\sqrt{3}", "-\\sqrt{3}",
    "\\dfrac{\\sqrt{3}}{3}", "-\\dfrac{\\sqrt{3}}{3}", "\\text{不存在}"];

  /* 角度制的廣義角＝高一下 5-2；弧度制＝高二上 1-1 */
  var CH_DEG = "g10b-11", CH_RAD = "g11a-01";

  function neg(v) {
    if (v === "0" || v === "\\text{不存在}") return null;
    return v.charAt(0) === "-" ? v.slice(1) : "-" + v;
  }
  function quadOf(d) { return d % 90 === 0 ? 0 : Math.floor(d / 90) + 1; }
  function refOf(d) {
    var q = quadOf(d);
    if (q === 1) return d;
    if (q === 2) return 180 - d;
    if (q === 3) return d - 180;
    if (q === 4) return 360 - d;
    return d;
  }
  var QNAME = ["", "第一", "第二", "第三", "第四"];

  function gTrigValue() {
    var useRad = Math.random() < 0.45;
    var d, fi, ans;
    for (var guard = 0; guard < 30; guard++) {
      d = pick(DEGS); fi = ri(3); ans = TV[d][fi];
      if (ans !== null) break;
    }
    if (ans === null) { d = 30; fi = 0; ans = TV[30][0]; }

    var lbl = useRad ? RAD[d] : d + "^\\circ";
    var q = "$" + FN[fi] + " " + lbl + " = \\ ?$";

    var prefer = [neg(ans)];
    if (fi === 0) prefer.push(TV[d][1]);
    else if (fi === 1) prefer.push(TV[d][0]);
    else prefer.push(neg(TV[d][2]));
    var ref = refOf(d);
    if (ref !== d && TV[ref]) prefer.push(TV[ref][fi]);

    var wrongs = distract(ans, prefer, fi === 2 ? POOL_T : POOL_SC);
    var qd = quadOf(d), nm = ["sin", "cos", "tan"][fi];
    var tip = qd === 0
      ? "軸上角：直接看單位圓上的點 " + (d === 0 ? "(1,0)" : d === 90 ? "(0,1)" : d === 180 ? "(-1,0)" : "(0,-1)")
      : QNAME[qd] + "象限，" + nm + " 為" + (ans.charAt(0) === "-" ? "負" : "正") + "，參考角 " + ref + "°";
    return mk("trig", useRad ? CH_RAD : CH_DEG, q, "$" + ans + "$",
      wrongs.map(function (w) { return "$" + w + "$"; }), tip);
  }

  function gTanUndef() {
    var d = pick([90, 270]);
    var useRad = Math.random() < 0.4;
    var q = "$\\tan " + (useRad ? RAD[d] : d + "^\\circ") + " = \\ ?$";
    return mk("trig", useRad ? CH_RAD : CH_DEG, q, "$\\text{不存在}$", ["$0$", "$1$", "$-1$"],
      "tan = sin/cos，cos " + d + "° = 0 → 分母為 0，值不存在（圖形是鉛直漸近線）");
  }

  function gTrigCompare() {
    var pairs = [
      ["$\\sin 30^\\circ$ 與 $\\sin 150^\\circ$", "兩者相等", ["前者大", "後者大", "無法比較"],
        "sin(180°−θ)=sinθ，第二象限 sin 仍為正且值相同"],
      ["$\\cos 60^\\circ$ 與 $\\cos 300^\\circ$", "兩者相等", ["前者大", "後者大", "一正一負"],
        "cos(360°−θ)=cosθ，第四象限 cos 為正"],
      ["$\\sin 100^\\circ$ 與 $\\cos 100^\\circ$", "前者大", ["後者大", "兩者相等", "都是負的"],
        "100° 在第二象限：sin 正、cos 負"],
      ["$\\tan 200^\\circ$ 的正負", "正", ["負", "0", "不存在"],
        "200° 在第三象限，sin、cos 同負 → tan 為正"],
      ["$\\cos 190^\\circ$ 的正負", "負", ["正", "0", "不存在"],
        "第三象限 cos 為負（只有第一、四象限 cos 為正）"],
      ["$\\sin(-40^\\circ)$ 的正負", "負", ["正", "0", "不存在"],
        "sin 是奇函數：sin(−θ)=−sinθ"]
    ];
    var p = pick(pairs);
    return mk("trig", CH_DEG, p[0] + "？", p[1], p[2], p[3]);
  }

  /* ══════════════ 二、角度變換 ══════════════ */

  var IND = [
    { deg: "-\\theta",           rad: "-\\theta",              s: "-\\sin\\theta", c: "\\cos\\theta",  t: "-\\tan\\theta",
      why: "sin 是奇函數、cos 是偶函數" },
    { deg: "90^\\circ-\\theta",  rad: "\\dfrac{\\pi}{2}-\\theta",  s: "\\cos\\theta",  c: "\\sin\\theta",  t: null,
      why: "90° 是奇數個直角 → 換成餘函數；結果在第一象限，全正" },
    { deg: "90^\\circ+\\theta",  rad: "\\dfrac{\\pi}{2}+\\theta",  s: "\\cos\\theta",  c: "-\\sin\\theta", t: null,
      why: "換餘函數；結果落第二象限 → sin 正、cos 負" },
    { deg: "180^\\circ-\\theta", rad: "\\pi-\\theta",          s: "\\sin\\theta",  c: "-\\cos\\theta", t: "-\\tan\\theta",
      why: "180° 是偶數個直角 → 函數不變；第二象限只有 sin 正" },
    { deg: "180^\\circ+\\theta", rad: "\\pi+\\theta",          s: "-\\sin\\theta", c: "-\\cos\\theta", t: "\\tan\\theta",
      why: "函數不變；第三象限只有 tan 正" },
    { deg: "270^\\circ-\\theta", rad: "\\dfrac{3\\pi}{2}-\\theta", s: "-\\cos\\theta", c: "-\\sin\\theta", t: null,
      why: "270° 是奇數個直角 → 換餘函數；結果落第三象限，sin、cos 皆負" },
    { deg: "270^\\circ+\\theta", rad: "\\dfrac{3\\pi}{2}+\\theta", s: "-\\cos\\theta", c: "\\sin\\theta",  t: null,
      why: "換餘函數；結果落第四象限 → cos 正、sin 負" },
    { deg: "360^\\circ-\\theta", rad: "2\\pi-\\theta",         s: "-\\sin\\theta", c: "\\cos\\theta",  t: "-\\tan\\theta",
      why: "函數不變；第四象限只有 cos 正" }
  ];
  var SC4 = ["\\sin\\theta", "-\\sin\\theta", "\\cos\\theta", "-\\cos\\theta"];

  function gInduction() {
    var r = pick(IND);
    var useRad = Math.random() < 0.4;
    var fi = ri(3);
    if (fi === 2 && r.t === null) fi = ri(2);
    var lbl = useRad ? r.rad : r.deg;
    var ans = fi === 0 ? r.s : fi === 1 ? r.c : r.t;
    var wrongs = fi === 2
      /* 108 課綱高中只教 sin、cos、tan，餘切一律寫成 1/tan */
      ? distract(ans, [], ["\\tan\\theta", "-\\tan\\theta", "\\dfrac{1}{\\tan\\theta}", "-\\dfrac{1}{\\tan\\theta}"])
      : distract(ans, [], SC4);
    return mk("trans", useRad ? CH_RAD : CH_DEG,
      "$" + FN[fi] + "(" + lbl + ") = \\ ?$（$\\theta$ 為銳角）",
      "$" + ans + "$", wrongs.map(function (w) { return "$" + w + "$"; }),
      "口訣「奇變偶不變、符號看象限」：" + r.why);
  }

  function gRadDeg() {
    var d = pick([15, 30, 36, 45, 60, 72, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]);
    var extra = { 15: "\\dfrac{\\pi}{12}", 36: "\\dfrac{\\pi}{5}", 72: "\\dfrac{2\\pi}{5}" };
    var r = RAD[d] || extra[d];
    if (Math.random() < 0.5) {
      var others = shuffle(DEGS.concat([15, 36, 72])).filter(function (x) { return x !== d; }).slice(0, 3);
      return mk("trans", CH_RAD, "$" + d + "^\\circ$ 化成弧度 = ?", "$" + r + "$",
        others.map(function (o) { return "$" + (RAD[o] || extra[o]) + "$"; }),
        "180° = π 弧度 → 乘上 $\\dfrac{\\pi}{180}$");
    }
    var ds = shuffle(DEGS.concat([15, 36, 72])).filter(function (x) { return x !== d; }).slice(0, 3);
    return mk("trans", CH_RAD, "$" + r + "$ 弧度化成角度 = ?", d + "°",
      ds.map(function (o) { return o + "°"; }),
      "π 弧度 = 180° → 乘上 $\\dfrac{180}{\\pi}$");
  }

  function gQuadrant() {
    var base = pick([20, 40, 70, 110, 130, 160, 200, 230, 250, 290, 310, 340]);
    var mode = ri(3);
    var shown = base;
    if (mode === 1) shown = base + 360 * (1 + ri(2));
    else if (mode === 2) shown = base - 360;
    var q = quadOf(((shown % 360) + 360) % 360);
    var names = ["第一象限", "第二象限", "第三象限", "第四象限"];
    var ans = names[q - 1];
    return mk("trans", CH_DEG, "$" + shown + "^\\circ$ 的終邊落在？", ans,
      names.filter(function (n) { return n !== ans; }),
      "先把角化到 $[0^\\circ,360^\\circ)$：" + (((shown % 360) + 360) % 360) + "° → " + ans);
  }

  function gInverse() {
    var items = [
      ["$0^\\circ\\le\\theta\\le180^\\circ$ 且 $\\cos\\theta=-\\dfrac{1}{2}$", "120°", ["60°", "150°", "240°"],
        "cos 在 [0°,180°] 遞減且一對一；參考角 60°、cos 負 → 第二象限"],
      ["$0^\\circ\\le\\theta\\le180^\\circ$ 且 $\\cos\\theta=-\\dfrac{\\sqrt{2}}{2}$", "135°", ["45°", "225°", "315°"],
        "參考角 45°、cos 負 → 第二象限"],
      ["$0^\\circ\\le\\theta\\le180^\\circ$ 且 $\\sin\\theta=\\dfrac{\\sqrt{3}}{2}$，且 $\\theta$ 為鈍角", "120°", ["60°", "150°", "30°"],
        "sin 正有兩解 60°、120°，鈍角條件挑掉 60°"],
      ["$-90^\\circ\\le\\theta\\le90^\\circ$ 且 $\\sin\\theta=-\\dfrac{1}{2}$", "−30°", ["30°", "210°", "330°"],
        "限定在 [−90°,90°] 時 sin 一對一"],
      ["$0^\\circ\\le\\theta<360^\\circ$、$\\tan\\theta=1$ 且 $\\theta$ 在第三象限", "225°", ["45°", "135°", "315°"],
        "tan 週期 180°，兩解 45° 與 225°，象限條件挑第三象限"],
      ["$0^\\circ\\le\\theta<360^\\circ$、$\\sin\\theta=-\\dfrac{\\sqrt{3}}{2}$ 且 $\\cos\\theta>0$", "300°", ["240°", "120°", "60°"],
        "sin 負、cos 正 → 第四象限；參考角 60°"]
    ];
    var it = pick(items);
    return mk("trans", CH_DEG, it[0] + "，$\\theta = ?$", it[1], it[2], it[3]);
  }

  function gPeriod() {
    var b = pick([2, 3, 4, 1]);
    var f = pick(["\\sin", "\\cos"]);
    var a = 1 + ri(4);
    if (ri(2) === 0) {
      var ans = b === 1 ? "$2\\pi$" : "$\\dfrac{2\\pi}{" + b + "}$";
      var wr = [1, 2, 3, 4].filter(function (x) { return x !== b; }).slice(0, 3)
        .map(function (x) { return x === 1 ? "$2\\pi$" : "$\\dfrac{2\\pi}{" + x + "}$"; });
      return mk("trans", "g11a-02", "$y = " + a + f + "(" + (b === 1 ? "" : b) + "x)$ 的週期 = ?", ans, wr,
        "$y=a\\sin(bx+c)$ 的週期 $=\\dfrac{2\\pi}{|b|}$，振幅只影響高度不影響週期");
    }
    var d = 1 + ri(4);
    return mk("trans", "g11a-02", "$y = " + a + f + "(" + (b === 1 ? "" : b) + "x) + " + d + "$ 的最大值 = ?",
      String(a + d), [String(a), String(a + d + 1), String(a - d)],
      "sin、cos 的值域是 [−1,1] → 最大值 = 振幅 + 平移量 = " + a + " + " + d);
  }

  /* ══════════════ 三、關鍵字反射（手寫） ══════════════ */
  /* [章節id, 題目關鍵字, 反射動作, [三個誘答], 理由] */
  var KEYWORD = [
    ["g10a-02", "看到 $|x-3|<5$", "改寫成 $-5&lt;x-3<5$（距離觀點）",
      ["兩邊平方成 $x^2-9<25$", "直接去掉絕對值得 $x-3<5$", "分子分母同乘共軛根式"],
      "$|x-a|$ 就是數線上 x 到 a 的距離，不等式直接變區間"],
    ["g10a-02", "求 $|x-1|+|x+2|$ 的最小值", "看成到 1、−2 兩點的距離和，最小值 = 兩點距離",
      ["微分後令導數為 0", "配方法求頂點", "代 $x=0$ 試看看"],
      "距離和在兩點之間都相等，最小值就是 $|1-(-2)|=3$"],
    ["g10a-01", "化簡 $\\sqrt{a^2}$", "等於 $|a|$，要分正負討論",
      ["等於 $a$", "等於 $\\pm a$", "等於 $a^2$ 的一半"],
      "根號的結果必須非負，這是最常見的送分陷阱"],
    ["g10a-04", "問「$2^{100}$ 有幾位數」", "取常用對數，位數 $=[100\\log 2]+1$",
      ["用二項式定理展開", "算 $2^{100} \\bmod 10$", "用等比級數公式"],
      "位數看整數部分（首數），首位數字看小數部分（尾數）"],
    ["g11a-07", "式子出現 $\\log_a M + \\log_a N$", "併成 $\\log_a(MN)$",
      ["併成 $\\log_a(M+N)$", "併成 $(\\log_a M)(\\log_a N)$", "拆成 $\\log_a M \\cdot \\log_N a$"],
      "對數把乘法降成加法，這是它存在的理由"],
    ["g11a-07", "同一題出現 $\\log_2$、$\\log_4$、$\\log_8$", "換底公式統一成同一個底",
      ["各自查表算成小數", "全部改寫成指數式再相加", "設成聯立方程式"],
      "底數不同不能直接運算，統一底數後全部化成 $\\log_2$ 的倍數"],
    ["g11a-06", "解 $4^x - 3\\cdot 2^x + 2 = 0$", "令 $t=2^x\\ (t>0)$ 化成二次式",
      ["兩邊同除 $2^x$", "兩邊取 log 後展開", "用勘根定理找整數根"],
      "$4^x=(2^x)^2$；換元後別忘了 $t>0$ 的限制"],
    ["g10a-07", "問「直線與圓相切」", "算圓心到直線的距離，令它等於半徑",
      ["聯立後令判別式大於 0", "把圓心代入直線方程式", "比較兩者的斜率"],
      "距離法一行解決；判別式法要展開二次式，慢很多"],
    ["g10a-07", "給兩圓，問位置關係", "比較圓心距 $d$ 與 $r_1+r_2$、$|r_1-r_2|$",
      ["聯立兩圓方程式解交點", "比較兩圓半徑大小", "算兩圓面積差"],
      "外離、外切、相交、內切、內離，全由 d 與兩個臨界值決定"],
    ["g11a-11", "給三個頂點座標求三角形面積", "用行列式（鞋帶公式）",
      ["先求三邊長再用海龍公式", "先求底再求高", "用正弦定理求角度"],
      "$\\dfrac{1}{2}\\left|\\begin{smallmatrix}x_2-x_1 & y_2-y_1\\\\ x_3-x_1 & y_3-y_1\\end{smallmatrix}\\right|$，代座標即可"],
    ["g10a-08", "問 $f(x)$ 除以 $x-3$ 的餘式", "直接代 $f(3)$",
      ["做長除法", "用綜合除法算出整個商式", "設餘式為 $ax+b$ 解聯立"],
      "餘式定理：除以一次式時餘式是常數，等於 $f(3)$"],
    ["g10a-08", "「$x-2$ 是 $f(x)$ 的因式」", "馬上寫下 $f(2)=0$",
      ["寫下 $f(2)=2$", "寫下 $f'(2)=0$", "把 $x=2$ 代入後求最大值"],
      "因式定理：能整除 ⟺ 餘式為 0"],
    ["g10a-08", "問「$f(x)$ 的所有係數和」", "代 $x=1$",
      ["代 $x=0$", "代 $x=-1$", "把首項係數乘上次數"],
      "$f(1)$ 就是把所有係數加起來；常數項則是 $f(0)$"],
    ["g10a-11", "「$ax^2+bx+c>0$ 對所有實數 x 恆成立」", "$a>0$ 且判別式 $<0$",
      ["$a>0$ 且判別式 $>0$", "只要判別式 $<0$ 即可", "$a>0$ 且 $c>0$"],
      "開口向上又不碰 x 軸，圖形整條在 x 軸上方"],
    ["g10a-09", "題目只提到兩根 $\\alpha$、$\\beta$ 的和或積", "用根與係數：$\\alpha+\\beta=-\\dfrac{b}{a}$、$\\alpha\\beta=\\dfrac{c}{a}$",
      ["先用公式解把兩根解出來", "先用勘根定理夾根", "設 $\\alpha=\\beta$ 再討論"],
      "對稱式都能用和與積表示，不必真的解出根"],
    ["g10b-02", "$\\sum$ 的每一項是分式且分母能因式分解", "部分分式拆項，做望遠鏡消去",
      ["用等比級數公式", "用二項式定理展開", "先通分再一項一項加"],
      "如 $\\dfrac{1}{n(n+1)}=\\dfrac{1}{n}-\\dfrac{1}{n+1}$，中間全部對消"],
    ["g10b-01", "遞迴式 $a_{n+1}=3a_n+4$", "兩邊加同一個常數，湊成等比數列",
      ["直接猜 $a_n$ 是等差", "兩邊取對數", "用數學歸納法硬證"],
      "設不動點 $k=3k+4$ 得 $k=-2$，則 $a_{n+1}+2=3(a_n+2)$"],
    ["g12a-01", "「無窮等比級數的和」", "先檢查 $|r|<1$，再用 $\\dfrac{a}{1-r}$",
      ["直接代 $\\dfrac{a}{1-r}$ 不必檢查", "用 $\\dfrac{a(1-r^n)}{1-r}$ 令 $n=\\infty$", "取極限前先微分"],
      "$|r|\\ge 1$ 時級數發散，公式不能用——這是最常見的扣分點"],
    ["g10b-06", "機率題出現「至少一個」", "算補集：$1-P(\\text{一個都沒有})$",
      ["把各情形一個一個加起來", "用條件機率公式", "用期望值公式"],
      "「至少」的反面是「完全沒有」，只有一種情形，最好算"],
    ["g10b-04", "排列題出現「兩人必須相鄰」", "綁成一綑當一個單位，再乘綑內排列數",
      ["先排這兩人再排其他人", "用全部排法減一半", "先排其他人再插空隙"],
      "相鄰 → 捆綁法；不相鄰 → 插空法，兩者是一對"],
    ["g10b-04", "排列題出現「兩人不能相鄰」", "先排其他人，再把他們插進空隙",
      ["綁成一綑當一個單位", "全部排法除以 2", "用重複排列公式"],
      "插空法：n 個人排好會產生 n+1 個空隙可以插"],
    ["g10b-04", "「abcc 這種有重複字母的排列」", "除以重複字母個數的階乘",
      ["直接用 $4!$", "用 $C^4_2$", "乘上重複的次數"],
      "$\\dfrac{4!}{2!}$；重複的東西交換位置看起來一樣"],
    ["g10b-05", "「分成 3 組，每組 2 人，組別不分名稱」", "先分組再除以 $3!$",
      ["直接用 $C^6_2 C^4_2 C^2_2$", "用 $\\dfrac{6!}{2!2!2!}$ 不必再除", "用排列數 $P^6_3$"],
      "組別沒有名字時，組與組交換算同一種分法"],
    ["g11b-11", "「已知 A 發生的條件下，求 B 的機率」", "條件機率：分母換成 $P(A)$，樣本空間縮小",
      ["直接算 $P(B)$", "用 $P(A)P(B)$", "用 $P(A)+P(B)-P(A\\cap B)$"],
      "$P(B|A)=\\dfrac{P(A\\cap B)}{P(A)}$：已知的資訊會壓縮樣本空間"],
    ["g12b-02", "「重複試驗 n 次，求恰好成功 k 次」", "二項分布 $C^n_k p^k(1-p)^{n-k}$",
      ["幾何分布 $p(1-p)^{k-1}$", "超幾何分布", "用期望值 $np$"],
      "每次獨立、機率相同 → 二項分布；問「第幾次才第一次成功」才是幾何分布"],
    ["g10b-08", "「每筆資料都乘 3 再加 5」", "平均數 ×3+5；標準差 ×3；變異數 ×9",
      ["平均數與標準差都 ×3+5", "平均數 ×3+5，標準差不變", "平均數不變，標準差 ×3+5"],
      "平移不影響分散程度，伸縮才會——常數 5 對標準差沒有作用"],
    ["g10b-09", "「相關係數 r 接近 −1」", "有很強的負線性相關（不代表因果）",
      ["兩者沒有關係", "兩者是二次函數關係", "斜率一定等於 −1"],
      "r 只量「線性」關係的強弱與方向，與單位無關、也不談因果"],
    ["g10b-12", "三角形已知三邊長，要求某個角", "餘弦定理",
      ["正弦定理", "海龍公式", "面積公式 $\\frac{1}{2}ab\\sin C$"],
      "三邊 → 角只有餘弦定理做得到；正弦定理需要「邊角配對」"],
    ["g10b-12", "三角形已知兩角一邊", "正弦定理",
      ["餘弦定理", "畢氏定理", "外積求面積"],
      "邊與其對角配成一組時用正弦定理最快"],
    ["g10b-12", "三角形已知兩邊與夾角，要求面積", "$\\dfrac{1}{2}ab\\sin C$",
      ["海龍公式", "$\\dfrac{1}{2}\\times$ 底 $\\times$ 高", "先用正弦定理求外接圓半徑"],
      "夾角是關鍵字：兩邊夾一角就能直接算面積"],
    ["g11a-04", "求 $3\\sin\\theta + 4\\cos\\theta$ 的最大值", "疊合成 $5\\sin(\\theta+\\phi)$，最大值 $\\sqrt{3^2+4^2}$",
      ["把 $\\theta$ 代 90° 試", "用算幾不等式", "微分後令導數為 0"],
      "$a\\sin+b\\cos$ 的範圍必為 $[-\\sqrt{a^2+b^2},\\ \\sqrt{a^2+b^2}]$"],
    ["g11a-03", "同時出現 $\\sin\\theta+\\cos\\theta$ 與 $\\sin\\theta\\cos\\theta$", "令 $t=\\sin\\theta+\\cos\\theta$，平方得 $t^2=1+2\\sin\\theta\\cos\\theta$",
      ["兩者相除化成 tan", "分別求最大值再相加", "用和差角公式展開"],
      "平方自動生出 $2\\sin\\theta\\cos\\theta$，兩個未知量瞬間變一個"],
    ["g11a-10", "「兩向量垂直」", "內積 = 0",
      ["兩向量的分量成比例", "行列式 = 0", "兩向量長度相等"],
      "$\\vec u\\cdot\\vec v=|u||v|\\cos 90^\\circ=0$；成比例是平行不是垂直"],
    ["g11a-09", "「三點共線」", "兩個向量成比例（或行列式 = 0）",
      ["三個向量內積為 0", "三邊長滿足畢氏定理", "三點到原點等距"],
      "$\\vec{AB}\\parallel\\vec{AC}$ 就是共線；行列式 = 0 代表圍成的面積為 0"],
    ["g11a-10", "求「$\\vec u$ 在 $\\vec v$ 上的正射影長」", "$\\dfrac{\\vec u\\cdot\\vec v}{|\\vec v|}$",
      ["$\\dfrac{\\vec u\\cdot\\vec v}{|\\vec u|}$", "$|\\vec u||\\vec v|\\cos\\theta$", "$\\dfrac{\\vec u\\cdot\\vec v}{|\\vec u||\\vec v|}$"],
      "投影到誰身上就除以誰的長度"],
    ["g11a-09", "「$\\vec{OP}=x\\vec{OA}+y\\vec{OB}$ 且 $x+y=1$」", "P 落在直線 AB 上",
      ["P 落在線段 AB 的中點", "P 與 O 重合", "OAPB 是平行四邊形"],
      "係數和為 1 是共線的招牌；再加上 $x,y\\ge0$ 才限制在線段上"],
    ["g11b-06", "空間中求「點到平面的距離」", "$\\dfrac{|ax_0+by_0+cz_0+d|}{\\sqrt{a^2+b^2+c^2}}$",
      ["先求垂足座標再算兩點距離", "用外積求面積再除以底", "用三階行列式算體積"],
      "與平面座標的點到直線距離同一個模式：代進去除以法向量長度"],
    ["g11b-06", "看到平面 $2x-3y+z=5$，要找垂直方向", "法向量就是係數 $(2,-3,1)$",
      ["方向向量是 $(2,-3,1)$", "法向量是 $(2,-3,5)$", "要先化成參數式才看得出來"],
      "平面方程式的係數天生就是法向量，這是最省時的一眼判讀"],
    ["g11b-04", "求「兩歪斜直線的公垂方向」", "兩方向向量的外積",
      ["兩方向向量的內積", "兩方向向量相加", "解聯立方程式"],
      "外積結果同時垂直於兩個向量"],
    ["g12a-03", "問「瞬間速度」「切線斜率」「變化率」", "微分",
      ["積分", "取極限後代入", "用平均變化率就好"],
      "這三個詞是導數的三種說法"],
    ["g12a-05", "問「面積」「總量」「累積」", "積分",
      ["微分", "求極值", "用等差級數求和"],
      "微分看瞬間、積分看累積，是一體兩面"],
    ["g12a-03", "看到 $\\lim\\limits_{h\\to 0}\\dfrac{f(a+h)-f(a)}{h}$", "這就是 $f'(a)$，直接微分再代 a",
      ["先通分再約分", "先把 $h$ 當常數提出來", "代 $h=0$ 得 0"],
      "認出導數定義可以省下整段極限計算"],
    ["g12a-04", "求「極大值、極小值」", "先解 $f'(x)=0$，再看導數的正負變化",
      ["直接比較端點的函數值", "解 $f(x)=0$", "解 $f''(x)=0$"],
      "$f'=0$ 只是候選點，要用增減表確認才是極值"],
    ["g12b-05", "實係數方程式有一根為 $2+3i$", "另一根必為共軛 $2-3i$",
      ["另一根必為 $-2-3i$", "另一根必為 $\\dfrac{1}{2+3i}$", "無法判斷其他根"],
      "實係數多項式的虛根一定成對出現"],
    ["g12b-04", "要算 $(1+i)^{20}$", "化成極式再用棣美弗定理",
      ["用二項式定理展開 20 項", "用長除法降次", "先取絕對值再平方"],
      "極式把次方變成角度的乘法，20 次方也只是把幅角乘 20"],
    ["g12b-07", "「到兩定點的距離和為定值」", "橢圓",
      ["雙曲線", "拋物線", "圓"],
      "和固定 → 橢圓；差固定 → 雙曲線"],
    ["g12b-06", "「到定點與到定直線的距離相等」", "拋物線（焦點與準線）",
      ["橢圓", "雙曲線", "兩條平行線"],
      "拋物線的定義就是這句話"],
    ["g12b-09", "「在限制條件下求 $2x+3y$ 的最大值」", "線性規劃：畫可行域，檢查頂點",
      ["用算幾不等式", "用柯西不等式", "微分後令導數為 0"],
      "線性目標函數的極值一定發生在可行域的頂點"],
    ["g11a-10", "看到 $(a^2+b^2)(x^2+y^2)$ 要比較 $(ax+by)^2$", "柯西不等式",
      ["算幾不等式", "三角不等式", "排序不等式"],
      "等號成立在 $\\dfrac{a}{x}=\\dfrac{b}{y}$（兩向量平行）時"],
    ["g10a-11", "求「兩正數的和固定時，乘積的最大值」", "算幾不等式，兩數相等時最大",
      ["柯西不等式", "微分兩次", "用判別式"],
      "$\\dfrac{a+b}{2}\\ge\\sqrt{ab}$，等號在 $a=b$ 時成立"
      + "（由 $(\\sqrt{a}-\\sqrt{b})^2\\ge0$ 就推得出來）"]
  ];

  /* ══════════════ 四、公式辨識（手寫） ══════════════ */
  var FORMULA = [
    ["g11a-03", "$\\dfrac{\\tan A+\\tan B}{1-\\tan A\\tan B}$", "$\\tan(A+B)$",
      ["$\\tan(A-B)$", "$\\dfrac{1}{\\tan(A+B)}$", "$\\tan A\\tan B$"],
      "分母是「1 減乘積」→ 和角；「1 加乘積」才是差角"],
    ["g11a-03", "$\\sin A\\cos B-\\cos A\\sin B$", "$\\sin(A-B)$", ["$\\sin(A+B)$", "$\\cos(A-B)$", "$\\cos(A+B)$"],
      "sin 的和差角：中間的正負號跟括號裡一致"],
    ["g11a-03", "$\\cos A\\cos B+\\sin A\\sin B$", "$\\cos(A-B)$", ["$\\cos(A+B)$", "$\\sin(A+B)$", "$\\sin(A-B)$"],
      "cos 的和差角：符號跟括號裡相反"],
    ["g11a-03", "$2\\sin\\theta\\cos\\theta$", "$\\sin 2\\theta$", ["$\\cos 2\\theta$", "$2\\sin 2\\theta$", "$\\tan 2\\theta$"],
      "倍角公式；平方 $(\\sin\\pm\\cos)^2$ 時會自動長出來"],
    ["g11a-03", "$2\\cos^2\\theta-1$", "$\\cos 2\\theta$", ["$\\sin 2\\theta$", "$\\cos^2 2\\theta$", "$1-2\\cos 2\\theta$"],
      "cos 倍角三兄弟：$\\cos^2-\\sin^2 = 2\\cos^2-1 = 1-2\\sin^2$"],
    ["g11a-03", "$\\dfrac{1-\\cos 2\\theta}{2}$", "$\\sin^2\\theta$", ["$\\cos^2\\theta$", "$\\sin\\theta$", "$\\tan^2\\theta$"],
      "降冪公式：把平方換成一次的 $\\cos 2\\theta$，積分和化簡都靠它"],
    ["g10a-09", "實係數二次方程式且 $b^2-4ac<0$", "沒有實根（兩個共軛虛根）", ["兩相異實根", "兩相等實根", "至少一實根"],
      "判別式的正負決定圖形與 x 軸的交點數"],
    ["g10a-09", "$x=-\\dfrac{b}{2a}$", "拋物線 $y=ax^2+bx+c$ 的對稱軸", ["拋物線的焦點", "兩根之積", "判別式"],
      "對稱軸就是兩根的平均，也是極值發生的位置"],
    ["g10a-05", "$\\dfrac{|ax_0+by_0+c|}{\\sqrt{a^2+b^2}}$", "點到直線的距離", ["兩平行線的距離", "直線的斜率", "點到原點的距離"],
      "分子代點、分母是法向量長度"],
    ["g11b-06", "$\\dfrac{|ax_0+by_0+cz_0+d|}{\\sqrt{a^2+b^2+c^2}}$", "點到平面的距離", ["兩平面的夾角", "點到直線的距離", "四面體的體積"],
      "和平面座標同一套邏輯，只是多一個 z"],
    ["g11a-10", "$|\\vec u||\\vec v|\\cos\\theta$", "$\\vec u\\cdot\\vec v$（內積）", ["$|\\vec u\\times\\vec v|$（外積長度）", "正射影長", "平行四邊形面積"],
      "內積配 cos、外積配 sin"],
    ["g11a-11", "$ad-bc$", "二階行列式 $\\begin{vmatrix}a & b\\\\ c & d\\end{vmatrix}$", ["兩向量的內積", "反矩陣", "矩陣的跡"],
      "它的絕對值就是兩向量張出的平行四邊形面積"],
    ["g10b-02", "$\\dfrac{a(1-r^n)}{1-r}$", "等比數列前 n 項和", ["等差數列前 n 項和", "無窮等比級數和", "二項式係數和"],
      "$r=1$ 時分母為 0，要另外討論"],
    ["g12a-01", "$\\dfrac{a}{1-r}$（$|r|<1$）", "無窮等比級數的和", ["等比中項", "等差級數和", "遞迴數列的不動點"],
      "$|r|<1$ 是使用前的通行證"],
    ["g12b-02", "$C^n_k\\, p^k(1-p)^{n-k}$", "二項分布：n 次中恰好成功 k 次", ["幾何分布", "條件機率", "期望值"],
      "獨立重複試驗的標準模型，期望值 $=np$"],
    ["g11b-11", "$\\dfrac{P(A\\cap B)}{P(B)}$", "條件機率 $P(A|B)$", ["$P(A\\cup B)$", "獨立事件的定義", "貝氏定理的分母"],
      "已知 B 發生 → 樣本空間縮到 B 裡面"],
    ["g12a-03", "$\\lim\\limits_{h\\to 0}\\dfrac{f(a+h)-f(a)}{h}$", "$f'(a)$（導數定義）", ["$f(a)$ 的極限", "$\\int f$", "平均變化率"],
      "認出它就不用真的算極限"],
    ["g11a-07", "$\\log_a M-\\log_a N$", "$\\log_a\\dfrac{M}{N}$", ["$\\dfrac{\\log_a M}{\\log_a N}$", "$\\log_a(M-N)$", "$\\log_{a}M\\cdot\\log_N a$"],
      "相除變相減，是對數律的第二條"],
    ["g11a-07", "$\\dfrac{\\log_c b}{\\log_c a}$", "$\\log_a b$（換底公式）", ["$\\log_c\\dfrac{b}{a}$", "$\\log_b a$", "$\\log_c b-\\log_c a$"],
      "統一底數的工具；順口溜：新底在下"],
    ["g11a-10", "$(a^2+b^2)(x^2+y^2)\\ge(ax+by)^2$", "柯西不等式", ["算幾不等式", "三角不等式", "排序不等式"],
      "本質是 $|\\vec u||\\vec v|\\ge|\\vec u\\cdot\\vec v|$"],
    ["g10a-09", "$\\alpha+\\beta=-\\dfrac{b}{a},\\ \\alpha\\beta=\\dfrac{c}{a}$", "根與係數關係", ["判別式", "配方法", "勘根定理"],
      "所有對稱式都能用這兩個量表示"],
    ["g10a-08", "$f(x)=(x-a)q(x)+f(a)$", "餘式定理", ["因式定理", "除法原理的一般式", "插值多項式"],
      "除以一次式時餘式是常數 $f(a)$"],
    ["g11a-02", "$y=a\\sin(bx+c)+d$ 的 $\\dfrac{2\\pi}{|b|}$", "週期", ["振幅", "相位差", "中心線"],
      "b 越大波擠得越密、週期越短"],
    ["g11a-01", "$r\\theta$（$\\theta$ 為弧度）", "弧長", ["扇形面積", "圓周長", "圓心角"],
      "弧度制的存在理由：弧長公式變得沒有係數"],
    ["g11a-01", "$\\dfrac{1}{2}r^2\\theta$", "扇形面積", ["弧長", "三角形面積", "圓面積"],
      "也可以寫成 $\\dfrac{1}{2}r\\times(\\text{弧長})$，和三角形面積同構"],
    ["g12b-04", "$r^n(\\cos n\\theta+i\\sin n\\theta)$", "棣美弗定理（複數的 n 次方）", ["複數的共軛", "複數的模長", "根與係數"],
      "長度取 n 次方、幅角乘 n"],
    ["g10b-08", "$\\dfrac{\\sum (x_i-\\bar{x})^2}{n}$", "變異數", ["標準差", "平均數", "相關係數"],
      "開根號之後才是標準差"],
    ["g10b-12", "$\\dfrac{a}{\\sin A}=\\dfrac{b}{\\sin B}=2R$", "正弦定理", ["餘弦定理", "海龍公式", "托勒密定理"],
      "R 是外接圓半徑；出現外接圓就想到它"],
    ["g10b-12", "$c^2=a^2+b^2-2ab\\cos C$", "餘弦定理", ["正弦定理", "畢氏定理", "中線定理"],
      "$C=90^\\circ$ 時退化成畢氏定理"],
    ["g11a-10", "$\\vec u\\cdot\\vec v=0$", "兩向量互相垂直", ["兩向量平行", "兩向量等長", "兩向量反向"],
      "平行是外積為零向量（或分量成比例）"]
  ];

  /* ══════════════ 五、秒算直覺 ══════════════ */

  function gLogValue() {
    var b = pick([2, 2, 3, 5, 10]);
    var e = b <= 3 ? pick([-3, -2, -1, 2, 3, 4, 5]) : pick([-2, -1, 2, 3]);
    var p = Math.pow(b, Math.abs(e));
    var arg = e < 0 ? "\\dfrac{1}{" + p + "}" : String(p);
    var wr = [String(e + 1), String(e - 1), String(-e)].filter(function (x) { return x !== String(e); });
    return mk("quick", "g11a-07", "$\\log_{" + b + "} " + arg + " = \\ ?$", String(e), wr,
      "問「" + b + " 的幾次方等於 " + (e < 0 ? "1/" + p : p) + "」→ 答案 " + e);
  }

  var POWROWS = [
    ["8", "\\dfrac{2}{3}", "4", ["16", "6", "\\dfrac{16}{3}"]],
    ["8", "-\\dfrac{1}{3}", "\\dfrac{1}{2}", ["2", "-2", "\\dfrac{1}{8}"]],
    ["16", "\\dfrac{3}{4}", "8", ["12", "4", "64"]],
    ["16", "-\\dfrac{1}{2}", "\\dfrac{1}{4}", ["4", "-4", "\\dfrac{1}{8}"]],
    ["27", "\\dfrac{2}{3}", "9", ["18", "3", "\\dfrac{1}{9}"]],
    ["27", "-\\dfrac{1}{3}", "\\dfrac{1}{3}", ["3", "-3", "\\dfrac{1}{27}"]],
    ["32", "\\dfrac{2}{5}", "4", ["8", "2", "16"]],
    ["81", "\\dfrac{3}{4}", "27", ["9", "12", "3"]],
    ["125", "\\dfrac{2}{3}", "25", ["5", "50", "\\dfrac{1}{25}"]],
    ["9", "\\dfrac{3}{2}", "27", ["3", "\\dfrac{27}{2}", "81"]],
    ["4", "-\\dfrac{3}{2}", "\\dfrac{1}{8}", ["8", "-8", "\\dfrac{1}{4}"]],
    ["64", "\\dfrac{2}{3}", "16", ["8", "4", "32"]],
    ["1000", "\\dfrac{2}{3}", "100", ["10", "\\dfrac{2000}{3}", "1"]]
  ];
  function gPowFrac() {
    var r = pick(POWROWS);
    return mk("quick", "g10a-03", "$" + r[0] + "^{" + r[1] + "} = \\ ?$", "$" + r[2] + "$",
      r[3].map(function (w) { return "$" + w + "$"; }),
      "分數指數：分母開根號、分子取次方；負號代表倒數");
  }

  function fact(n) { var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
  function comb(n, r) { return fact(n) / (fact(r) * fact(n - r)); }
  function gCombination() {
    var n = 4 + ri(6), r = 2 + ri(2);
    if (r >= n) r = 2;
    if (Math.random() < 0.35) {
      var p = comb(n, r) * fact(r);
      return mk("quick", "g10b-04", "$P^{" + n + "}_{" + r + "} = \\ ?$", String(p),
        [String(comb(n, r)), String(n * r), String(p + r)],
        "排列（有順序）$=C^{" + n + "}_{" + r + "}\\times " + r + "! = " + p + "$");
    }
    var c = comb(n, r);
    return mk("quick", "g10b-05", "$C^{" + n + "}_{" + r + "} = \\ ?$", String(c),
      [String(c * fact(r)), String(n * r), String(c + n)],
      "$C^{" + n + "}_{" + r + "}=\\dfrac{" + n + "!}{" + r + "!\\,(" + (n - r) + ")!}=" + c +
      "$；乘上 " + r + "! 才是排列數");
  }

  function nz() { var v = ri(9) - 4; return v === 0 ? 3 : v; }
  function gDot() {
    var a = nz(), b = nz(), c = nz(), d = nz();
    var ans = a * c + b * d;
    var wr = [String(a * c - b * d), String(a * d + b * c), String(a * c * b * d)];
    return mk("quick", "g11a-10",
      "$\\vec{u}=(" + a + "," + b + ")$、$\\vec{v}=(" + c + "," + d + ")$，$\\vec{u}\\cdot\\vec{v} = \\ ?$",
      String(ans), wr, "內積 = 對應分量相乘後相加：" + a + "×" + c + " + " + b + "×" + d + " = " + ans);
  }

  function gDet() {
    var a = nz(), b = nz(), c = nz(), d = nz();
    var ans = a * d - b * c;
    var wr = [String(a * d + b * c), String(a * c - b * d), String(b * c - a * d)];
    return mk("quick", "g11a-11",
      "$\\begin{vmatrix} " + a + " & " + b + " \\\\ " + c + " & " + d + " \\end{vmatrix} = \\ ?$",
      String(ans), wr, "主對角相乘減副對角相乘：" + a + "×" + d + " − " + b + "×" + c + " = " + ans);
  }

  function gSeq() {
    if (Math.random() < 0.5) {
      var a1 = 1 + ri(9), dd = 2 + ri(5), n = 5 + ri(8);
      return mk("quick", "g10b-01", "等差數列 $a_1=" + a1 + "$、公差 $d=" + dd + "$，$a_{" + n + "} = \\ ?$",
        String(a1 + (n - 1) * dd), [String(a1 + n * dd), String(a1 + (n - 2) * dd), String(n * dd)],
        "$a_n=a_1+(n-1)d$：是 " + (n - 1) + " 個公差，不是 " + n + " 個");
    }
    var b1 = pick([1, 2, 3]), r = pick([2, 3]), m = 4 + ri(3);
    var v = b1 * Math.pow(r, m - 1);
    return mk("quick", "g10b-01", "等比數列 $a_1=" + b1 + "$、公比 $r=" + r + "$，$a_{" + m + "} = \\ ?$",
      String(v), [String(b1 * Math.pow(r, m)), String(b1 * (m - 1) * r), String(v / r)],
      "$a_n=a_1 r^{\\,n-1}$：指數是 " + (m - 1) + " 不是 " + m);
  }

  function gI() {
    var n = 4 + ri(60) + pick([0, 100, 1000, 2000]);
    var m = n % 4;
    var vals = ["$1$", "$i$", "$-1$", "$-i$"];
    return mk("quick", "g12b-03", "$i^{" + n + "} = \\ ?$", vals[m],
      vals.filter(function (v) { return v !== vals[m]; }),
      "$i$ 的次方以 4 為週期：" + n + " ÷ 4 餘 " + m + " → " + vals[m].replace(/\$/g, ""));
  }

  function gDisc() {
    var a = 1 + ri(3), b = -(1 + ri(7)), c = ri(9) - 3;
    var D = b * b - 4 * a * c;
    var ans = D > 0 ? "兩相異實根" : D === 0 ? "兩相等實根（重根）" : "沒有實根";
    return mk("quick", "g10a-09", "$" + a + "x^2 " + (b < 0 ? "-" : "+") + " " + Math.abs(b) + "x " +
      (c < 0 ? "-" : "+") + " " + Math.abs(c) + " = 0$ 的實根情形？",
      ans, ["兩相異實根", "兩相等實根（重根）", "沒有實根"].filter(function (x) { return x !== ans; })
        .concat(["恰有一實根與一虛根"]),
      "判別式 $D=(" + b + ")^2-4(" + a + ")(" + c + ")=" + D + "$ " + (D > 0 ? "> 0" : D === 0 ? "= 0" : "< 0"));
  }

  function term(n, v) {
    if (n === 0) return "";
    return (n < 0 ? "-" : "+") + (Math.abs(n) === 1 && v ? "" : Math.abs(n)) + v;
  }
  function gCircleCenter() {
    var D = 2 * (Math.random() < 0.5 ? -(1 + ri(4)) : 1 + ri(4));
    var E = 2 * (Math.random() < 0.5 ? -(1 + ri(4)) : 1 + ri(4));
    var cx = -D / 2, cy = -E / 2;
    /* F 必須小於 cx²+cy²，否則 r²<0、根本不是圓（題幹卻寫「圓」） */
    var F = cx * cx + cy * cy - (1 + ri(8));
    var s = function (x, y) { return "$(" + x + "," + y + ")$"; };
    var swap = (cx === cy) ? s(cx + 1, cy) : s(cy, cx);
    return mk("quick", "g10a-06", "圓 $x^2+y^2" + term(D, "x") + term(E, "y") + term(F, "") + "=0$ 的圓心？",
      s(cx, cy), [s(D, E), s(-D, -E), swap],
      "圓心 $=\\left(-\\dfrac{D}{2},-\\dfrac{E}{2}\\right)$：把一次項係數除以 −2");
  }

  function gVertex() {
    var a = pick([1, 2, -1, -2]), h = ri(7) - 3, k = ri(9) - 4;
    var b = -2 * a * h, c = a * h * h + k;
    var body = (a === 1 ? "" : a === -1 ? "-" : a) + "x^2" + term(b, "x") + term(c, "");
    var cand = [-h, h + 1, h - 1, -b, h + 2, h - 2];
    var wr = [];
    cand.forEach(function (x) { if (x !== h && wr.indexOf(x) < 0 && wr.length < 3) wr.push(x); });
    return mk("quick", "g10a-09", "$y=" + body + "$ 的對稱軸？", "$x=" + h + "$",
      wr.map(function (x) { return "$x=" + x + "$"; }),
      "對稱軸 $x=-\\dfrac{b}{2a}=-\\dfrac{" + b + "}{2(" + a + ")}=" + h + "$");
  }

  function gSlope() {
    var x1 = ri(9) - 4, y1 = ri(9) - 4, dx = pick([1, 2, -1, -2]), m = pick([1, 2, 3, -1, -2, -3]);
    var x2 = x1 + dx, y2 = y1 + dx * m;
    return mk("quick", "g10a-05",
      "過 $(" + x1 + "," + y1 + ")$、$(" + x2 + "," + y2 + ")$ 的直線斜率？",
      String(m), [String(-m), String(1 / m === Math.round(1 / m) ? 1 / m : m + 1), String(m * 2)],
      "斜率 $=\\dfrac{y_2-y_1}{x_2-x_1}=\\dfrac{" + (y2 - y1) + "}{" + (x2 - x1) + "}=" + m + "$");
  }

  /* ══════════════ 補充題源 ══════════════
   * 目標：每一章至少 4 個題源，單章練習才不會一直碰到同一題。
   * 觀念拆細——同一章拆成「判別／公式／破題動作／計算」不同切面。 */

  /* 實數：根式估算與數系判別（高一上 1-1） */
  function gRealEst() {
    if (ri(2)) {
      var n = 5 + ri(140), k = Math.floor(Math.sqrt(n));
      if (k * k === n) { n += 1; k = Math.floor(Math.sqrt(n)); }
      return mk("quick", "g10a-01", "$\\sqrt{" + n + "}$ 介於哪兩個連續整數之間？",
        "$" + k + "$ 與 $" + (k + 1) + "$",
        ["$" + (k - 1) + "$ 與 $" + k + "$", "$" + (k + 1) + "$ 與 $" + (k + 2) + "$",
         "$" + Math.round(n / 2) + "$ 附近"],
        "$" + k + "^2=" + k * k + " < " + n + " < " + (k + 1) * (k + 1) + "=" + (k + 1) + "^2$");
    }
    var items = [
      ["$\\sqrt{2}+\\sqrt{3}$", "無理數", "兩個無理數相加通常仍是無理數（要證明可用平方法）"],
      ["$0.\\overline{27}$（循環小數）", "有理數", "任何循環小數都能化成分數"],
      ["$\\sqrt{2}\\times\\sqrt{8}$", "有理數", "$=\\sqrt{16}=4$，無理數相乘可能變有理數"],
      ["$\\pi-\\pi$", "有理數", "$=0$；無理數的差不一定是無理數"],
      ["$\\sqrt{2}+(3-\\sqrt{2})$", "有理數", "$=3$，兩個無理數相加可能消掉"]
    ];
    var it = pick(items);
    return mk("quick", "g10a-01", it[0] + " 是有理數還是無理數？", it[1],
      [it[1] === "有理數" ? "無理數" : "有理數", "整數", "不是實數"], it[2]);
  }

  /* 指數律（高一上 1-3） */
  function gExpLawHS() {
    var b = pick([2, 3, 5]), m = 2 + ri(5), n = 2 + ri(4);
    var mode = ri(4);
    if (mode === 0) {
      return mk("quick", "g10a-03", "$" + b + "^{" + m + "} \\times " + b + "^{" + n + "} = " + b + "^{\\,?}$",
        String(m + n), [String(m * n), String(m - n), String(m + n + 1)],
        "同底數相乘 → 指數相加");
    }
    if (mode === 1) {
      return mk("quick", "g10a-03", "$(" + b + "^{" + m + "})^{" + n + "} = " + b + "^{\\,?}$",
        String(m * n), [String(m + n), String(Math.pow(m, n)), String(m * n + 1)],
        "次方的次方 → 指數相乘");
    }
    if (mode === 2) {
      var e = 1 + ri(3);
      return mk("quick", "g10a-03", "$" + b + "^{-" + e + "} = \\ ?$",
        "$\\dfrac{1}{" + Math.pow(b, e) + "}$",
        ["$-" + Math.pow(b, e) + "$", "$" + Math.pow(b, e) + "$", "$-\\dfrac{1}{" + Math.pow(b, e) + "}$"],
        "負指數代表倒數，不是負數");
    }
    var pairs = [[2, 30, 3, 20, "3^{20}"], [2, 20, 3, 10, "2^{20}"], [4, 15, 8, 10, "\\text{兩者相等}"],
                 [9, 10, 27, 6, "9^{10}"], [2, 40, 5, 15, "2^{40}"]];
    var p = pick(pairs);
    var opts = ["$" + p[0] + "^{" + p[1] + "}$", "$" + p[2] + "^{" + p[3] + "}$",
                "$\\text{兩者相等}$", "$\\text{無法比較}$"];
    var ansTex = "$" + p[4] + "$";
    return mk("quick", "g10a-03",
      "$" + p[0] + "^{" + p[1] + "}$ 與 $" + p[2] + "^{" + p[3] + "}$ 哪個大？",
      ansTex, opts.filter(function (o) { return o !== ansTex; }),
      "化成相同的指數（或相同的底）再比：把兩邊都寫成 $(\\ )^{\\gcd}$ 的形式");
  }

  /* 常用對數：位數與首數（高一上 1-4） */
  function gDigits() {
    var rows = [[2, 0.3010, "\\log 2=0.3010"], [3, 0.4771, "\\log 3=0.4771"],
                [7, 0.8451, "\\log 7=0.8451"], [6, 0.7781, "\\log 6=0.7781"]];
    var r = pick(rows), n = 20 + ri(60);
    var d = Math.floor(n * r[1]) + 1;
    return mk("quick", "g10a-04",
      "已知 $" + r[2] + "$，則 $" + r[0] + "^{" + n + "}$ 是幾位數？",
      String(d), [String(d - 1), String(d + 1), String(Math.round(n * r[1]))],
      "位數 $=[" + n + "\\times" + r[1] + "]+1=[" + (n * r[1]).toFixed(3) + "]+1=" + d + "$");
  }

  /* 圓方程式：一般式求半徑（高一上 2-2） */
  function gCircleRadius() {
    var h = ri(9) - 4, k = ri(9) - 4, r = 1 + ri(6);
    var D = -2 * h, E = -2 * k, F = h * h + k * k - r * r;
    var term = function (n, v) {
      if (n === 0) return "";
      return (n < 0 ? "-" : "+") + (Math.abs(n) === 1 && v ? "" : Math.abs(n)) + v;
    };
    return mk("quick", "g10a-06",
      "圓 $x^2+y^2" + term(D, "x") + term(E, "y") + term(F, "") + "=0$ 的半徑 = ?",
      String(r), [String(r * r), String(Math.abs(F)), String(r + 1)],
      "配方：$(x" + term(-h, "") + ")^2+(y" + term(-k, "") + ")^2=" + r * r + "$ → 半徑 " + r);
  }

  /* 古典機率（高一下 3-1） */
  function gProbBasic() {
    var mode = ri(3);
    if (mode === 0) {
      var s = 2 + ri(11);
      var cnt = s <= 7 ? s - 1 : 13 - s;
      return mk("quick", "g10b-06", "擲兩顆公正骰子，點數和為 $" + s + "$ 的機率 = ?",
        "$\\dfrac{" + cnt + "}{36}$",
        ["$\\dfrac{" + cnt + "}{12}$", "$\\dfrac{1}{" + (13 - Math.abs(7 - s)) + "}$", "$\\dfrac{" + (cnt + 1) + "}{36}$"],
        "樣本空間 36 種；和為 " + s + " 有 " + cnt + " 種");
    }
    if (mode === 1) {
      var r = 2 + ri(5), w = 2 + ri(5);
      var tot = r + w;
      return mk("quick", "g10b-06",
        "袋中 " + r + " 紅 " + w + " 白，一次取兩球都是紅球的機率 = ?",
        "$" + frac(r * (r - 1) / 2, tot * (tot - 1) / 2) + "$",
        ["$" + frac(r, tot) + "$", "$" + frac(r * r, tot * tot) + "$",
         "$" + frac(r * (r - 1) / 2, tot * tot) + "$"],
        "分子 $C^{" + r + "}_2$、分母 $C^{" + tot + "}_2$（同時取出，不看順序）");
    }
    var p = pick([3, 4, 5]);          /* p=2 時 $\frac{1}{2p}$ 會等於正解 */
    return mk("quick", "g10b-06", "擲一枚公正硬幣 " + p + " 次，全部都是正面的機率 = ?",
      "$\\dfrac{1}{" + Math.pow(2, p) + "}$",
      ["$\\dfrac{1}{" + (2 * p) + "}$", "$\\dfrac{" + p + "}{" + Math.pow(2, p) + "}$", "$\\dfrac{1}{2}$"],
      "每次獨立 → 機率相乘：$\\left(\\dfrac{1}{2}\\right)^{" + p + "}$");
  }

  /* 級數求和（高一下 1-2） */
  function gSigma() {
    var n = 5 + ri(16);
    if (ri(2)) {
      return mk("quick", "g10b-02", "$\\displaystyle\\sum_{k=1}^{" + n + "} k = \\ ?$",
        String(n * (n + 1) / 2), [String(n * n), String(n * (n + 1)), String((n - 1) * n / 2)],
        "$\\dfrac{n(n+1)}{2}=\\dfrac{" + n + "\\times" + (n + 1) + "}{2}$");
    }
    var m = 3 + ri(8);
    return mk("quick", "g10b-02", "$\\displaystyle\\sum_{k=1}^{" + m + "} k^2 = \\ ?$",
      String(m * (m + 1) * (2 * m + 1) / 6),
      [String(Math.pow(m * (m + 1) / 2, 2)), String(m * m * m), String(m * (m + 1) / 2)],
      "$\\dfrac{n(n+1)(2n+1)}{6}$（平方和公式）");
  }

  /* 弧度量：弧長與扇形面積（高二上 1-1） */
  function gRadArc() {
    var r = 2 + ri(9), th = pick([1, 2, 3, 4]);
    if (ri(2)) {
      return mk("quick", "g11a-01",
        "半徑 $" + r + "$、圓心角 $" + th + "$ 弧度的弧長 = ?", String(r * th),
        [String(r * r * th / 2), String(r + th), String(2 * r * th)],
        "弧長 $=r\\theta=" + r + "\\times" + th + "$（弧度制才有這麼乾淨的式子）");
    }
    var area = r * r * th / 2;
    return mk("quick", "g11a-01",
      "半徑 $" + r + "$、圓心角 $" + th + "$ 弧度的扇形面積 = ?",
      area % 1 === 0 ? String(area) : "$" + frac(r * r * th, 2) + "$",
      [String(r * th), String(r * r * th), "$" + frac(r * th, 2) + "$"],
      "扇形面積 $=\\dfrac{1}{2}r^2\\theta=\\dfrac{1}{2}\\times" + r * r + "\\times" + th + "$");
  }

  /* 正餘弦疊合（高二上 1-4） */
  function gSuperpose() {
    /* [a, b, 振幅 R, a+b 的寫法] */
    var pairs = [[3, 4, "5", "7"], [6, 8, "10", "14"], [5, 12, "13", "17"], [8, 15, "17", "23"],
                 [1, 1, "\\sqrt{2}", "2"], [1, "\\sqrt{3}", "2", "1+\\sqrt{3}"]];
    var p = pick(pairs);
    var a = p[0] === 1 ? "" : p[0], b = p[1] === 1 ? "" : p[1], R = p[2], sum = p[3];
    if (ri(2)) {
      return mk("quick", "g11a-04",
        "$" + a + "\\sin\\theta + " + b + "\\cos\\theta$ 的最大值 = ?", "$" + R + "$",
        ["$" + sum + "$", "$-" + R + "$", "$" + R + "^2$", "$0$"],
        "疊合成 $" + R + "\\sin(\\theta+\\phi)$，最大值 $=\\sqrt{a^2+b^2}=" + R +
        "$（不是把兩個最大值相加）");
    }
    return mk("quick", "g11a-04",
      "$" + a + "\\sin\\theta + " + b + "\\cos\\theta$ 的最小值 = ?", "$-" + R + "$",
      ["$" + R + "$", "$0$", "$-" + sum + "$", "$-" + R + "^2$"],
      "值域是 $[-\\sqrt{a^2+b^2},\\ \\sqrt{a^2+b^2}]$");
  }

  /* 指數函數與方程（高二上 2-1） */
  function gExpFn() {
    var b = pick([2, 3, 5]), x = 1 + ri(4), k = 1 + ri(3);
    if (ri(2)) {
      var v = Math.pow(b, x + k);
      return mk("quick", "g11a-06", "$" + b + "^{x+" + k + "} = " + v + "$，$x = \\ ?$",
        String(x), [String(x + k), String(v / b), String(x - k)],
        "同底比較指數：$x+" + k + "=" + (x + k) + "$ → $x=" + x + "$");
    }
    var half = pick([[2, ">"], [3, ">"], ["\\dfrac{1}{2}", "<"], ["\\dfrac{1}{3}", "<"]]);
    return mk("quick", "g11a-06",
      "$\\left(" + half[0] + "\\right)^{x} > \\left(" + half[0] + "\\right)^{5}$ 的解？",
      "$x " + (half[1] === ">" ? ">" : "<") + " 5$",
      ["$x " + (half[1] === ">" ? "<" : ">") + " 5$", "$x = 5$", "$x > -5$"],
      "底數大於 1 時指數不等式方向不變；底數在 0 與 1 之間時<b>方向要反過來</b>");
  }

  /* 空間向量外積（高二下 1-4） */
  function gCross() {
    var a = [1 + ri(4), ri(5) - 2, ri(5) - 2];
    var b = [ri(5) - 2, 1 + ri(4), ri(5) - 2];
    var c = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    var v = function (t) { return "$(" + t.join(",") + ")$"; };
    /* 分量出現 0 時前幾個誘答可能重複，所以候選給多一點，由 mk 挑出三個相異的 */
    return mk("quick", "g11b-04",
      "$\\vec{u}=(" + a.join(",") + ")$、$\\vec{v}=(" + b.join(",") + ")$，$\\vec{u}\\times\\vec{v} = \\ ?$",
      v(c),
      [v([-c[0], -c[1], -c[2]]),
       v([a[0] * b[0], a[1] * b[1], a[2] * b[2]]),
       v([c[2], c[0], c[1]]),
       v([c[0], -c[1], c[2]]),
       v([a[0] + b[0], a[1] + b[1], a[2] + b[2]]),
       v([c[0] + 1, c[1], c[2]])],
      "外積用行列式展開；結果同時垂直於 $\\vec u$ 與 $\\vec v$（順序交換會變號）");
  }

  /* 數列極限（選修上 1-1） */
  function gLimit() {
    var a = 1 + ri(6), d = 1 + ri(6), b = ri(9) - 4, e = ri(9) - 4;
    if (a === d) d = a + 1 + ri(3);        /* a=d 時正解是 1，會與誘答 d/a 重複 */
    if (ri(2)) {
      return mk("quick", "g12a-01",
        /* 係數 ±1 時不寫出 1；係數為 0 時整項不寫 */
        "$\\displaystyle\\lim_{n\\to\\infty}\\dfrac{" + a + "n^2" +
        (b === 0 ? "" : (b < 0 ? "-" : "+") + (Math.abs(b) === 1 ? "" : Math.abs(b)) + "n") + "}{" +
        d + "n^2" + (e === 0 ? "" : (e < 0 ? "-" : "+") + Math.abs(e)) + "} = \\ ?$",
        "$" + frac(a, d) + "$",
        /* d+e 可能為 0，frac 會生出 1/0；那時就別放這個誘答 */
        ["$" + frac(d, a) + "$", "$0$", "$\\infty$"].concat(
          d + e === 0 ? [] : ["$" + frac(a + b, d + e) + "$"]),
        "分子分母同除 $n^2$：只有最高次項會留下 → $\\dfrac{" + a + "}{" + d + "}$");
    }
    var r = pick([["\\dfrac{1}{2}", 2], ["\\dfrac{1}{3}", 3], ["\\dfrac{2}{3}", 3], ["-\\dfrac{1}{2}", 2]]);
    var first = 1;
    var ansTex = r[0] === "\\dfrac{1}{2}" ? "2" : r[0] === "\\dfrac{1}{3}" ? frac(3, 2)
      : r[0] === "\\dfrac{2}{3}" ? "3" : frac(2, 3);
    return mk("quick", "g12a-01",
      "無窮等比級數 $1 + \\left(" + r[0] + "\\right) + \\left(" + r[0] + "\\right)^2 + \\cdots = \\ ?$",
      "$" + ansTex + "$", ["$\\infty$", "$1$", "$" + r[0] + "$"],
      "$|r|<1$ 才收斂，和 $=\\dfrac{a}{1-r}=\\dfrac{1}{1-(" + r[0] + ")}$");
  }

  /* 微分（選修上 2-1） */
  function gDiff() {
    var a = 1 + ri(3), b = ri(9) - 4, c = ri(9) - 4, k = ri(5) - 2;
    var fp = 3 * a * k * k + 2 * b * k + c;
    var body = (a === 1 ? "" : a) + "x^3" +
      (b === 0 ? "" : (b < 0 ? "-" : "+") + (Math.abs(b) === 1 ? "" : Math.abs(b)) + "x^2") +
      (c === 0 ? "" : (c < 0 ? "-" : "+") + (Math.abs(c) === 1 ? "" : Math.abs(c)) + "x");
    return mk("quick", "g12a-03",
      "$f(x)=" + body + "$，$f'(" + k + ") = \\ ?$", String(fp),
      [String(a * k * k * k + b * k * k + c * k), String(3 * a * k * k + b * k + c), String(fp + 1)],
      "$f'(x)=" + (3 * a) + "x^2" + (b ? (b < 0 ? "-" : "+") + Math.abs(2 * b) + "x" : "") +
      (c ? (c < 0 ? "-" : "+") + Math.abs(c) : "") + "$，再代 $x=" + k + "$");
  }

  /* 定積分（選修上 3-1） */
  function gIntegral() {
    var a = pick([3, 6, 9]), b = ri(7) - 3, k = 1 + ri(3);
    var val = a * Math.pow(k, 3) / 3 + b * k;
    return mk("quick", "g12a-05",
      "$\\displaystyle\\int_0^{" + k + "} (" + a + "x^2" + (b < 0 ? "-" : "+") + Math.abs(b) + ")\\,dx = \\ ?$",
      String(val), [String(a * k * k + b), String(a * Math.pow(k, 3) + b * k), String(val + k)],
      "$\\left[\\dfrac{" + a + "}{3}x^3" + (b < 0 ? "-" : "+") + Math.abs(b) + "x\\right]_0^{" + k + "}$");
  }

  /* 複數運算（選修下 2-1） */
  function gComplex() {
    var mode = ri(3);
    var a = ri(9) - 4 || 2, b = ri(9) - 4 || 3;
    /* 虛部係數 ±1 時不寫出 1 */
    var im1 = function (v) { return (v < 0 ? "-" : "+") + (Math.abs(v) === 1 ? "" : Math.abs(v)) + "i"; };
    if (mode === 0) {
      var c = ri(7) - 3 || 2, d = ri(7) - 3 || 1;
      var re = a * c - b * d, im = a * d + b * c;
      if (im === 0) { d = d + 1 || 1; im = a * d + b * c; re = a * c - b * d; }  /* 虛部為 0 時誘答會撞號 */
      var f = function (x, y) { return "$" + x + im1(y) + "$"; };
      return mk("quick", "g12b-03",
        "$(" + a + im1(b) + ")(" + c + im1(d) + ") = \\ ?$",
        f(re, im), [f(a * c, b * d), f(a * c + b * d, a * d - b * c), f(re, -im), f(-re, im), f(im, re)],
        "展開後 $i^2=-1$：實部 $=" + a + "\\cdot" + c + "-" + b + "\\cdot" + d + "$");
    }
    if (mode === 1) {
      var t = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]);
      return mk("quick", "g12b-03", "$|" + t[0] + "+" + t[1] + "i| = \\ ?$", String(t[2]),
        [String(t[0] + t[1]), String(t[2] * t[2]), String(t[1] - t[0])],
        "$|a+bi|=\\sqrt{a^2+b^2}=\\sqrt{" + (t[0] * t[0] + t[1] * t[1]) + "}$");
    }
    return mk("quick", "g12b-03",
      "$z=" + a + im1(b) + "$，$z\\bar{z} = \\ ?$",
      String(a * a + b * b),
      [String(a * a - b * b), String(2 * a), String(a * b)],
      "$z\\bar z=|z|^2=a^2+b^2$（結果一定是非負實數）");
  }

  /* 棣美弗（選修下 2-2） */
  function gDeMoivre() {
    var r = pick([1, 2, 3]), th = pick([30, 45, 60, 90, 120]), n = 2 + ri(4);
    if (ri(2)) {
      var ang = (th * n) % 360;
      return mk("quick", "g12b-04",
        "$\\left[" + r + "(\\cos " + th + "^\\circ + i\\sin " + th + "^\\circ)\\right]^{" + n + "}$ 的幅角 = ?",
        ang + "°",
        [th + "°", ((ang + 30) % 360) + "°", ((ang + 90) % 360) + "°",
         ((ang + 180) % 360) + "°", (th * n) + "°"],
        "棣美弗：幅角乘 " + n + " 倍（" + th + "×" + n + "=" + (th * n) +
        (th * n >= 360 ? "，再減掉整圈" : "") + "）");
    }
    return mk("quick", "g12b-04",
      "$\\left[" + r + "(\\cos " + th + "^\\circ + i\\sin " + th + "^\\circ)\\right]^{" + n + "}$ 的絕對值 = ?",
      String(Math.pow(r, n)), [String(r * n), String(r), String(Math.pow(r, n) + 1)],
      "棣美弗：長度取 " + n + " 次方 → $" + r + "^{" + n + "}$");
  }

  /* 圓錐曲線（選修下 3-1～3-3） */
  function gConic() {
    var mode = ri(3);
    if (mode === 0) {
      var c = 1 + ri(5);
      return mk("quick", "g12b-06", "拋物線 $y^2=" + (4 * c) + "x$ 的焦點座標？",
        "$(" + c + ",0)$", ["$(0," + c + ")$", "$(" + (4 * c) + ",0)$", "$(-" + c + ",0)$"],
        "標準式 $y^2=4cx$ → 焦點 $(c,0)$、準線 $x=-" + c + "$；正焦弦長 $=4c=" + 4 * c + "$");
    }
    if (mode === 1) {
      var e = pick([[5, 4, 3], [5, 3, 4], [13, 12, 5], [10, 8, 6], [25, 24, 7]]);
      return mk("quick", "g12b-07",
        "橢圓 $\\dfrac{x^2}{" + (e[0] * e[0]) + "}+\\dfrac{y^2}{" + (e[1] * e[1]) + "}=1$ 的焦點座標？",
        "$(\\pm" + e[2] + ",0)$",
        ["$(\\pm" + e[0] + ",0)$", "$(0,\\pm" + e[2] + ")$", "$(\\pm" + e[1] + ",0)$"],
        "橢圓：$a^2=b^2+c^2$ → $c=\\sqrt{" + (e[0] * e[0]) + "-" + (e[1] * e[1]) + "}=" + e[2] +
        "$；焦點在長軸上");
    }
    var h = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10]]);
    return mk("quick", "g12b-08",
      "雙曲線 $\\dfrac{x^2}{" + (h[0] * h[0]) + "}-\\dfrac{y^2}{" + (h[1] * h[1]) + "}=1$ 的漸近線？",
      "$y=\\pm\\dfrac{" + h[1] + "}{" + h[0] + "}x$",
      ["$y=\\pm\\dfrac{" + h[0] + "}{" + h[1] + "}x$", "$y=\\pm" + h[2] + "x$", "$y=\\pm x$"],
      "漸近線 $y=\\pm\\dfrac{b}{a}x$；焦點則要用 $c^2=a^2+b^2$ → $c=" + h[2] + "$");
  }

  /* ── 補充的關鍵字與公式題（把薄的章節拆成更細的切面） ── */
  KEYWORD = KEYWORD.concat([
    ["g10a-01", "把循環小數化成分數", "設 $x$ 為該小數，乘以 $10^k$ 後相減消掉循環節",
      ["直接四捨五入", "分母寫 100 就好", "用長除法算到底"],
      "如 $x=0.\\overline{27}$：$100x-x=27$ → $x=\\dfrac{27}{99}$"],
    ["g10a-02", "看到 $|x-3|>5$（大於）", "拆成 $x-3>5$ 或 $x-3<-5$（兩段，用「或」）",
      ["拆成 $-5&lt;x-3<5$", "兩邊平方後開根號", "只解 $x-3>5$"],
      "小於是「夾在中間」，大於是「往兩邊跑」，方向剛好相反"],
    ["g10a-03", "比較 $2^{30}$ 與 $3^{20}$ 的大小", "化成相同指數：$(2^3)^{10}$ 與 $(3^2)^{10}$",
      ["直接比指數 30 > 20", "取小數硬算", "兩邊相減"],
      "指數相同時比底數；底數相同時比指數"],
    ["g10a-04", "問「首位數字是多少」", "看常用對數的<b>小數部分（尾數）</b>落在哪兩個 $\\log$ 值之間",
      ["看整數部分（首數）", "把數字除以 10 直到剩一位", "用科學記號的指數"],
      "首數決定位數、尾數決定首位數字，兩者分工要記牢"],
    ["g10a-05", "題目說兩直線<b>垂直</b>", "斜率相乘 $=-1$（或一條鉛直、一條水平）",
      ["斜率相同", "斜率互為倒數", "截距相乘 $=-1$"],
      "鉛直線斜率不存在，要單獨討論——這是最常漏的情況"],
    ["g10a-06", "圓的方程式是一般式 $x^2+y^2+Dx+Ey+F=0$", "配方成標準式，才看得出圓心與半徑",
      ["直接把 $D,E$ 當圓心", "把 $F$ 開根號當半徑", "先微分"],
      "半徑 $=\\sqrt{\\dfrac{D^2+E^2}{4}-F}$；根號內要 $>0$ 才是真的圓"],
    ["g10a-07", "求「切線長」（從圓外一點到切點）", "$\\sqrt{d^2-r^2}$（d 是點到圓心距離）",
      ["$d-r$", "$\\sqrt{d^2+r^2}$", "$\\dfrac{d}{r}$"],
      "連圓心、切點與外點是直角三角形，切線⊥半徑"],
    ["g10a-11", "解分式不等式 $\\dfrac{f(x)}{g(x)}>0$", "移項通分成單一分式，用符號表；分母不可為 0",
      ["兩邊同乘 $g(x)$", "分子分母分別解", "兩邊平方"],
      "$g(x)$ 的正負未知，直接乘會弄錯不等號方向"],
    ["g10b-01", "題目給 $S_n$（前 n 項和）要求 $a_n$", "用 $a_n=S_n-S_{n-1}$，$n=1$ 要單獨檢查",
      ["直接把 $S_n$ 微分", "$a_n=\\dfrac{S_n}{n}$", "$a_n=S_n-S_1$"],
      "$n=1$ 沒有 $S_0$，所以要另外算並確認是否合併得起來"],
    ["g10b-05", "求二項式展開中某一項的係數", "用通項 $C^n_k a^{n-k}b^k$，先解出 k",
      ["把整個展開式寫出來", "用巴斯卡三角形數到底", "直接代 $x=1$"],
      "先由「x 的次方」列式解出 k，再代回通項"],
    ["g10b-06", "「互斥」與「獨立」搞混", "互斥：不能同時發生（相加）；獨立：機率相乘",
      ["兩者意思相同", "互斥就是獨立的相反", "互斥事件一定獨立"],
      "互斥事件除非機率為 0，否則<b>一定不獨立</b>"],
    ["g10b-08", "資料出現極端值，要看分散程度", "用四分位距 $Q_3-Q_1$ 比較穩健",
      ["用全距", "用平均數", "把極端值直接刪掉"],
      "全距與標準差都會被極端值拉走；盒狀圖抓離群值用 $1.5\\times IQR$"],
    ["g10b-09", "問「最適直線一定通過哪一點」", "$(\\bar{x},\\bar{y})$，兩組資料的平均點",
      ["原點", "$(0,\\bar{y})$", "資料中的最大值點"],
      "最適直線的斜率 $=r\\cdot\\dfrac{s_y}{s_x}$，與 r 同號"],
    ["g11a-01", "弧長或扇形面積的公式", "角度一定要先換成<b>弧度</b>",
      ["用角度直接代", "先化成 360 分之幾", "先求圓周長"],
      "$s=r\\theta$、$A=\\dfrac{1}{2}r^2\\theta$ 只在弧度制成立"],
    ["g11a-02", "$y=a\\sin(bx+c)$ 要看左右平移多少", "先提出 b：$a\\sin\\!\\left(b\\left(x+\\dfrac{c}{b}\\right)\\right)$",
      ["直接看 c", "看 $\\dfrac{c}{a}$", "平移量就是週期"],
      "沒提 b 就讀平移量是最常見的錯誤"],
    ["g11a-04", "求 $\\sin\\theta+\\cos\\theta$ 的最大值", "疊合成 $\\sqrt2\\sin(\\theta+45^\\circ)$，最大值 $\\sqrt2$",
      ["兩個最大值相加得 2", "微分求極值", "代 $\\theta=45^\\circ$ 就好"],
      "兩者不會同時取到最大值，所以不能直接相加"],
    ["g11a-06", "指數不等式 $a^{f(x)}>a^{g(x)}$", "先看底數：$a>1$ 方向不變，$0&lt;a<1$ 方向要反過來",
      ["方向永遠不變", "兩邊取對數就不必管底數", "先平方"],
      "這與對數不等式是同一個陷阱"],
    ["g11a-09", "求三角形<b>重心</b>的座標（向量版）", "$\\dfrac{\\vec{OA}+\\vec{OB}+\\vec{OC}}{3}$",
      ["$\\dfrac{\\vec{OA}+\\vec{OB}}{2}$", "三頂點座標相乘", "外心公式"],
      "重心座標就是三頂點座標的平均"],
    ["g11b-04", "求四面體（或平行六面體）的體積", "用三階行列式：四面體是 $\\dfrac{1}{6}|\\det|$",
      ["用外積長度", "底面積 × 高 ÷ 2", "三個邊長相乘"],
      "平行六面體是 $|\\det|$，四面體再除以 6"],
    ["g11b-11", "判斷兩事件是否<b>獨立</b>", "檢查 $P(A\\cap B)=P(A)P(B)$",
      ["檢查 $P(A\\cup B)=P(A)+P(B)$", "檢查兩者互斥", "檢查 $P(A|B)=P(B|A)$"],
      "獨立時 $P(A|B)=P(A)$：知道 B 發生對 A 沒有影響"],
    ["g12a-01", "極限出現 $\\dfrac{\\infty}{\\infty}$", "分子分母同除以最高次項",
      ["直接代無窮大", "上下相減", "先微分再代"],
      "只有最高次項會留下來，其他都趨近 0"],
    ["g12a-04", "求閉區間上的<b>絕對</b>最大最小值", "把極值點與<b>兩個端點</b>的函數值一起比",
      ["只比極值點", "只比端點", "看 $f''$ 的正負就好"],
      "端點不會讓 $f'=0$，卻常常是最大或最小值所在"],
    ["g12a-04", "問「反曲點」", "$f''(x)=0$ 且凹凸性真的改變的點",
      ["$f'(x)=0$ 的點", "$f''(x)=0$ 就一定是", "函數值為 0 的點"],
      "$f''=0$ 只是候選，還要檢查兩側凹凸是否相反"],
    ["g12a-05", "求兩曲線圍成的面積", "先解交點當上下限，再積分「上減下」",
      ["直接把兩個函數各自積分再相減", "取絕對值後隨便定範圍", "用微分"],
      "上下關係若在區間內互換，要分段處理"],
    ["g12b-02", "問二項分布的期望值與變異數", "$E=np$、$\\mathrm{Var}=npq$",
      ["$E=p$、$\\mathrm{Var}=np$", "$E=np$、$\\mathrm{Var}=np$", "$E=nq$、$\\mathrm{Var}=npq$"],
      "$q=1-p$；標準差再開根號"],
    ["g12b-03", "複數相除（分母有 i）", "分子分母同乘分母的<b>共軛</b>",
      ["分子分母同乘 i", "直接把 i 移到分子", "兩邊平方"],
      "$(a+bi)(a-bi)=a^2+b^2$ 是實數，分母就沒有 i 了"],
    ["g12b-04", "解 $z^n=1$（n 次單位根）", "n 個根等分單位圓，構成正 n 邊形",
      ["只有 $z=1$ 一個根", "有 n 個實數根", "根都在實軸上"],
      "幅角每隔 $\\dfrac{360^\\circ}{n}$ 一個，全部落在單位圓上"],
    ["g12b-05", "整係數方程式要找根", "有理根檢驗：$\\pm\\dfrac{常數項的因數}{首項係數的因數}$",
      ["直接用公式解", "先微分", "只試 1 與 −1"],
      "先用它縮小範圍，再用綜合除法降次"],
    ["g12b-05", "題目說「在 $(a,b)$ 之間有根」", "勘根定理：檢查 $f(a)f(b)<0$",
      ["檢查 $f(a)+f(b)=0$", "檢查 $f'(a)f'(b)<0$", "檢查 $f(a)=f(b)$"],
      "連續函數變號就一定穿過 0；不變號不代表沒有根（可能有偶數個）"],
    ["g12b-06", "「正焦弦長」", "$y^2=4cx$ 的正焦弦長 $=|4c|$",
      ["$=c$", "$=2c$", "$=c^2$"],
      "過焦點垂直於軸的弦，是描圖時的關鍵寬度"],
    ["g12b-07", "橢圓題目給「到兩焦點的距離和」", "那個和就是 $2a$（長軸長）",
      ["就是 $2b$", "就是 $2c$", "就是 $a+b$"],
      "再配合 $a^2=b^2+c^2$ 就能解出全部參數"],
    ["g12b-09", "線性規劃找最佳解", "把目標函數當一族平行線平移，看最後碰到哪個頂點",
      ["把所有格子點代進去試", "解聯立方程式就好", "微分"],
      "可行域無界時要注意最大或最小值可能不存在"]
  ]);

  FORMULA = FORMULA.concat([
    ["g10a-11", "$\\dfrac{a+b}{2}\\ge\\sqrt{ab}$（$a,b>0$）", "算幾不等式",
      ["柯西不等式", "三角不等式", "排序不等式"],
      "等號在 $a=b$ 時成立；和固定求積的最大值、積固定求和的最小值都靠它"],
    ["g10a-02", "$|a+b|\\le|a|+|b|$", "三角不等式", ["柯西不等式", "算幾不等式", "絕對值的定義"],
      "等號成立在 a、b 同號（或有一個為 0）時"],
    ["g10a-03", "$a^{\\frac{m}{n}}$", "$\\sqrt[n]{a^m}$（n 次方根）", ["$a^m\\cdot a^n$", "$\\dfrac{a^m}{n}$", "$(a^m)^n$"],
      "分母管開根號、分子管次方；$a$ 必須 $>0$ 才保證有意義"],
    ["g10a-04", "$[\\log N]+1$", "N 的整數位數", ["N 的首位數字", "N 的小數位數", "$\\log N$ 的整數部分"],
      "$[\\ ]$ 是高斯符號；首位數字要看尾數"],
    ["g10a-05", "$\\dfrac{x}{a}+\\dfrac{y}{b}=1$", "直線的截距式（x 截距 a、y 截距 b）",
      ["點斜式", "兩點式", "法線式"],
      "一眼就能讀出兩個截距，畫圖最快"],
    ["g10a-06", "$(x-h)^2+(y-k)^2=r^2$", "圓的標準式", ["橢圓", "拋物線", "圓的一般式"],
      "圓心 $(h,k)$、半徑 r，括號裡的號要相反"],
    ["g10a-07", "圓心到直線距離 $d$ 與半徑 $r$ 比較", "判斷直線與圓相交／相切／相離",
      ["判斷兩圓位置", "求切線長", "求弦長"],
      "$d&lt;r$ 相交、$d=r$ 相切、$d>r$ 相離"],
    ["g10b-02", "$\\dfrac{n(n+1)}{2}$", "前 n 個正整數的和", ["前 n 個正整數的平方和", "等比級數和", "組合數"],
      "平方和是 $\\dfrac{n(n+1)(2n+1)}{6}$"],
    ["g10b-05", "$C^n_k=C^n_{n-k}$", "組合的對稱性", ["巴斯卡定理", "二項式定理", "排列與組合的關係"],
      "取 k 個要留下 = 挑 n−k 個不要，兩件事一樣"],
    ["g10b-06", "$P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$", "機率的加法原理（取捨原理）",
      ["乘法原理", "條件機率", "獨立事件"],
      "互斥時 $P(A\\cap B)=0$，才能直接相加"],
    ["g10b-08", "$Z=\\dfrac{x-\\bar{x}}{s}$", "標準分數（Z 分數）", ["變異數", "相關係數", "四分位距"],
      "標準化後平均變 0、標準差變 1，不同單位才能比較"],
    ["g10b-09", "$r\\cdot\\dfrac{s_y}{s_x}$", "最適直線的斜率", ["相關係數", "共變異數", "標準分數"],
      "所以斜率與 r 同號"],
    ["g11a-02", "$y=a\\sin(bx+c)+d$ 中的 $|a|$", "振幅", ["週期", "相位", "中心線"],
      "$d$ 是上下平移（中心線），$\\dfrac{2\\pi}{|b|}$ 才是週期"],
    ["g11a-04", "$\\sqrt{a^2+b^2}$（在 $a\\sin\\theta+b\\cos\\theta$ 中）", "疊合後的振幅（最大值）",
      ["週期", "相位差", "平均值"],
      "值域是 $[-\\sqrt{a^2+b^2},\\sqrt{a^2+b^2}]$"],
    ["g11a-06", "$y=a^x$ 且 $a>1$", "遞增函數（恆過 $(0,1)$）", ["遞減函數", "週期函數", "偶函數"],
      "$0&lt;a<1$ 時遞減；不論如何都恆正，且必過 $(0,1)$"],
    ["g11a-09", "$\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$", "向量 $\\vec{AB}$ 的長度（兩點距離）",
      ["內積", "斜率", "中點"],
      "就是畢氏定理的座標版"],
    ["g11b-04", "$|\\vec{u}\\times\\vec{v}|$", "兩向量張出的平行四邊形面積", ["內積", "體積", "夾角"],
      "三角形面積再除以 2；體積要用三階行列式"],
    ["g11b-11", "$P(A|B)=\\dfrac{P(B|A)P(A)}{P(B)}$", "貝氏定理", ["加法原理", "獨立事件定義", "全機率公式"],
      "把「已知結果反推原因」的問題翻譯成算式"],
    ["g12a-01", "$\\dfrac{a}{1-r}$ 的使用前提", "$|r|<1$（否則級數發散）", ["$r>0$", "$a>0$", "$n\\to\\infty$ 即可"],
      "沒檢查就用是最常見的扣分點"],
    ["g12a-04", "$f''(x)>0$", "圖形凹口向上", ["圖形遞增", "有極大值", "有反曲點"],
      "$f'$ 管增減、$f''$ 管凹凸，兩者分工要記清楚"],
    ["g12a-05", "$\\displaystyle\\int_a^b f'(x)\\,dx=f(b)-f(a)$", "微積分基本定理",
      ["黎曼和的定義", "分部積分", "均值定理"],
      "把「累積變化量」和「原函數的差」連起來"],
    ["g12b-02", "$np$ 與 $npq$", "二項分布的期望值與變異數", ["幾何分布的期望值", "平均數與中位數", "樣本的平均數與標準差"],
      "$q=1-p$；標準差是 $\\sqrt{npq}$"],
    ["g12b-03", "$z\\bar{z}$", "$|z|^2$（一定是非負實數）", ["$z^2$", "$2\\mathrm{Re}(z)$", "$0$"],
      "複數相除就是靠這件事把分母變成實數"],
    ["g12b-05", "n 次方程式（複數係數）恰有 n 個複數根", "代數基本定理",
      ["勘根定理", "虛根成對定理", "根與係數關係"],
      "重根要按重數計算"],
    ["g12b-06", "到定點與到定直線距離相等的點所成圖形", "拋物線（焦點與準線）",
      ["橢圓", "雙曲線", "圓"],
      "$y^2=4cx$：焦點 $(c,0)$、準線 $x=-c$"],
    ["g12b-07", "橢圓中的 $a^2=b^2+c^2$", "長半軸、短半軸與焦距的關係",
      ["雙曲線的關係式", "畢氏定理", "離心率的定義"],
      "橢圓是 $a$ 最大；雙曲線則是 $c^2=a^2+b^2$，$c$ 最大"],
    ["g12b-08", "$c^2=a^2+b^2$（圓錐曲線）", "雙曲線的參數關係", ["橢圓的參數關係", "拋物線的正焦弦", "離心率"],
      "順便記漸近線 $y=\\pm\\dfrac{b}{a}x$"],
    ["g12b-08", "$y=\\pm\\dfrac{b}{a}x$", "雙曲線 $\\dfrac{x^2}{a^2}-\\dfrac{y^2}{b^2}=1$ 的漸近線",
      ["橢圓的長軸", "拋物線的準線", "雙曲線的焦點連線"],
      "把方程式右邊的 1 改成 0 就解得出來"],
    ["g12b-09", "可行域的頂點", "線性目標函數最大最小值發生的位置",
      ["可行域的中心", "原點", "邊界的中點"],
      "所以只要檢查頂點，不必檢查整個區域"],
    ["g10a-02", "$|x-a|&lt;b \\iff a-b&lt;x&lt;a+b$", "絕對值不等式的區間形式",
      ["三角不等式", "絕對值的定義", "算幾不等式"],
      "距離 a 不到 b → 落在以 a 為中心、半徑 b 的區間內"],
    ["g10a-11", "把根依大小排在數線上、再標出各區間的正負", "解高次不等式的<b>符號表</b>",
      ["配方法", "判別式", "勘根定理"],
      "偶次重根處圖形不穿越，符號不變——這是符號表唯一的例外"],
    ["g10b-01", "$b^2=ac$", "a、b、c 成等比（b 是等比中項）",
      ["a、b、c 成等差", "等差中項", "遞迴關係"],
      "等差中項是 $2b=a+c$，一個用乘一個用加"],
    ["g10b-09", "$-1\\le r\\le 1$", "相關係數的範圍", ["最適直線的斜率範圍", "標準差的範圍", "變異數的範圍"],
      "$|r|$ 越接近 1 越貼近一條直線；$r=0$ 只代表沒有<b>線性</b>關係"],
    ["g11a-11", "$x=\\dfrac{\\Delta_x}{\\Delta}$、$y=\\dfrac{\\Delta_y}{\\Delta}$", "克拉瑪公式",
      ["行列式的定義", "反矩陣", "高斯消去法"],
      "$\\Delta=0$ 時不能用，要另外討論無解或無限多解"],
    ["g11b-06", "兩平面的夾角", "兩個<b>法向量</b>的夾角（或其補角）",
      ["兩平面方程式常數項的差", "兩平面上任兩向量的夾角", "點到平面的距離"],
      "取銳角時記得加絕對值：$\\cos\\theta=\\dfrac{|\\vec{n_1}\\cdot\\vec{n_2}|}{|\\vec{n_1}||\\vec{n_2}|}$"],
    ["g12b-08", "到兩定點的<b>距離差</b>為定值", "雙曲線（差值 $=2a$）",
      ["橢圓", "拋物線", "圓"],
      "和固定是橢圓、差固定是雙曲線，兩者的 a 都是那個定值的一半"],
    ["g12b-09", "目標函數 $ax+by=k$ 中的 k 變動", "一族<b>平行線</b>在平移，k 就是要最佳化的值",
      ["一族同心圓", "一族拋物線", "一個固定的點"],
      "平移到最後碰到可行域的哪個頂點，那裡就是最佳解"]
  ]);

  /* ══════════════ 補齊課綱未涵蓋的章節 ══════════════
   * 依 108 課綱（翰林版目次）比對後補上：原本 18 章沒有題目，現在每章至少 4 個題源。 */

  /* 三次函數的圖形特徵（高一上 3-3） */
  function gCubic() {
    var a = pick([1, 2, -1, -2]), h = ri(7) - 3, k = ri(9) - 4;
    if (h === 0 && k === 0) k = 3;                 /* 中心在原點時 ±h、±k 的誘答會重複 */
    if (ri(2)) {
      return mk("quick", "g10a-10",
        "$y=" + (a === 1 ? "" : a === -1 ? "-" : a) +
        (h === 0 ? "x" : "(x" + (h < 0 ? "+" + (-h) : "-" + h) + ")") + "^3" +
        (k === 0 ? "" : k < 0 ? "-" + (-k) : "+" + k) + "$ 的對稱中心？",
        "$(" + h + "," + k + ")$",
        ["$(" + (-h) + "," + k + ")$", "$(" + h + "," + (-k) + ")$", "$(0,0)$", "$(" + k + "," + h + ")$"],
        "三次函數圖形對稱於<b>反曲點</b>，不是對稱於一條線");
    }
    var n = pick([1, 2, 3]);
    return mk("quick", "g10a-10",
      "三次函數 $y=f(x)$ 的圖形與 x 軸最多有幾個交點？", "3 個",
      ["1 個", "2 個", "4 個"],
      "三次方程式最多 3 個實根；因為兩端一上一下，<b>至少</b>也會有 1 個");
  }

  /* 計數原理（高一下 2-1） */
  function gCount() {
    var mode = ri(3);
    if (mode === 0) {
      var a = 2 + ri(5), b = 2 + ri(5);
      return mk("quick", "g10b-03",
        "從 A 地到 B 地有 " + a + " 條路，B 地到 C 地有 " + b + " 條路，A 經 B 到 C 共幾種走法？",
        String(a * b), [String(a + b), String(a * b + a + b), String(Math.abs(a - b))],
        "分「步驟」完成 → <b>乘法</b>原理：" + a + "×" + b);
    }
    if (mode === 1) {
      var x = 3 + ri(6), y = 3 + ri(6);
      return mk("quick", "g10b-03",
        "搭公車有 " + x + " 班、搭火車有 " + y + " 班，任選一種交通工具共幾種選法？",
        String(x + y), [String(x * y), String(x * y - 1), String(Math.max(x, y))],
        "分「類別」二選一 → <b>加法</b>原理：" + x + "+" + y);
    }
    var n = 3 + ri(4);
    return mk("quick", "g10b-03",
      "$1\\sim" + (n * 10) + "$ 中，$2$ 的倍數有 " + (n * 5) + " 個、$3$ 的倍數有 " +
      Math.floor(n * 10 / 3) + " 個、$6$ 的倍數有 " + Math.floor(n * 10 / 6) + " 個，" +
      "則 $2$ 或 $3$ 的倍數有幾個？",
      String(n * 5 + Math.floor(n * 10 / 3) - Math.floor(n * 10 / 6)),
      [String(n * 5 + Math.floor(n * 10 / 3)), String(Math.floor(n * 10 / 6)), String(n * 5)],
      "取捨原理：$|A\\cup B|=|A|+|B|-|A\\cap B|$，重複算到的 6 的倍數要扣掉");
  }

  /* 數學期望值（高一下 3-2） */
  function gExpect() {
    if (ri(2)) {
      var w = 10 * (1 + ri(9)), p = pick([2, 4, 5, 10]);
      return mk("quick", "g10b-07",
        "一張彩券中獎機率 $\\dfrac{1}{" + p + "}$，中獎可得 " + w + " 元，期望值 = ?",
        String(w / p) + " 元",
        [String(w) + " 元", String(w * p) + " 元", String(w / p / 2) + " 元"],
        "期望值 $=\\sum(\\text{值}\\times\\text{機率})=" + w + "\\times\\dfrac{1}{" + p + "}$");
    }
    var a = 1 + ri(5), b = 1 + ri(5);
    return mk("quick", "g10b-07",
      "擲一顆公正骰子，出現點數的期望值 = ?", "3.5",
      ["3", "4", "6"],
      "$(1+2+3+4+5+6)\\div6=3.5$：期望值不一定是可能出現的值");
  }

  /* 直角三角形的三角比（高一下 5-1） */
  function gRightTri() {
    var t = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
    var f = ri(3);
    var names = ["\\sin", "\\cos", "\\tan"];
    var vals = [frac(t[1], t[2]), frac(t[0], t[2]), frac(t[1], t[0])];
    var tips = ["對邊 ÷ 斜邊", "鄰邊 ÷ 斜邊", "對邊 ÷ 鄰邊"];
    return mk("quick", "g10b-10",
      "直角三角形中 $\\angle A$ 的對邊 $=" + t[1] + "$、鄰邊 $=" + t[0] + "$、斜邊 $=" + t[2] + "$，" +
      "$" + names[f] + " A = \\ ?$",
      "$" + vals[f] + "$",
      vals.filter(function (v, i) { return i !== f; }).map(function (v) { return "$" + v + "$"; })
        .concat(["$" + frac(t[0], t[1]) + "$", "$" + frac(t[2], t[1]) + "$"]),
      names[f].slice(1) + " = " + tips[f] + "（口訣：SOH-CAH-TOA）");
  }

  /* 對數函數（高二上 2-3） */
  function gLogFn() {
    var b = pick([2, 3, 5, 10]);
    if (ri(2)) {
      var e = 1 + ri(4), v = Math.pow(b, e);
      return mk("quick", "g11a-08", "$\\log_{" + b + "} x = " + e + "$，$x = \\ ?$",
        String(v), [String(b * e), String(e), String(v * b)],
        "改寫成指數式：$x=" + b + "^{" + e + "}$");
    }
    return mk("quick", "g11a-08",
      "$y=\\log_{" + b + "} x$ 的圖形恆通過哪一點？", "$(1,0)$",
      ["$(0,1)$", "$(0,0)$", "$(" + b + ",0)$"],
      "$\\log_a 1=0$；圖形只存在於 $x>0$，且以 y 軸為漸近線");
  }

  /* 空間坐標系（高二下 1-2） */
  function gSpaceCoord() {
    var t = pick([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9]]);
    var mode = ri(2);
    if (mode === 0) {
      return mk("quick", "g11b-02",
        "空間中 $A(0,0,0)$、$B(" + t[0] + "," + t[1] + "," + t[2] + ")$，$\\overline{AB} = \\ ?$",
        String(t[3]), [String(t[0] + t[1] + t[2]), String(t[3] * t[3]), String(t[3] + 1)],
        "$\\sqrt{" + t[0] + "^2+" + t[1] + "^2+" + t[2] + "^2}=\\sqrt{" +
        (t[0] * t[0] + t[1] * t[1] + t[2] * t[2]) + "}=" + t[3] + "$");
    }
    var x = 2 * (ri(7) - 3), y = 2 * (ri(7) - 3), z = 2 * (ri(7) - 3);
    if (x === 0 && y === 0 && z === 0) x = 4;      /* 兩點重合的話選項會重複 */
    return mk("quick", "g11b-02",
      "$A(0,0,0)$ 與 $B(" + x + "," + y + "," + z + ")$ 的中點座標？",
      "$(" + x / 2 + "," + y / 2 + "," + z / 2 + ")$",
      /* 座標含 0 時前面幾個誘答可能撞號，候選多給幾個由 mk 挑三個相異的 */
      ["$(" + x + "," + y + "," + z + ")$",
       "$(" + (-x / 2) + "," + (-y / 2) + "," + (-z / 2) + ")$",
       "$(" + (x / 2 + 1) + "," + y / 2 + "," + z / 2 + ")$",
       "$(" + x / 2 + "," + (y / 2 + 1) + "," + z / 2 + ")$",
       "$(" + x / 2 + "," + y / 2 + "," + (z / 2 + 1) + ")$",
       "$(" + (2 * x) + "," + (2 * y) + "," + (2 * z) + ")$"],
      "中點 = 兩點座標各自取平均");
  }

  /* 空間向量的坐標表示法（高二下 1-3） */
  function gSpaceVec() {
    var a = [ri(9) - 4, ri(9) - 4, ri(9) - 4];
    var b = [ri(9) - 4, ri(9) - 4, ri(9) - 4];
    var mode = ri(2);
    if (mode === 0) {
      var s = [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
      return mk("quick", "g11b-03",
        "$\\vec{u}=(" + a.join(",") + ")$、$\\vec{v}=(" + b.join(",") + ")$，$\\vec{u}+\\vec{v} = \\ ?$",
        "$(" + s.join(",") + ")$",
        ["$(" + [a[0] - b[0], a[1] - b[1], a[2] - b[2]].join(",") + ")$",
         "$(" + [a[0] * b[0], a[1] * b[1], a[2] * b[2]].join(",") + ")$",
         "$(" + [s[2], s[1], s[0]].join(",") + ")$", "$(" + [s[0] + 1, s[1], s[2]].join(",") + ")$"],
        "空間向量相加：對應分量各自相加");
    }
    var t = pick([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11]]);
    return mk("quick", "g11b-03",
      "$|\\vec{u}|$，其中 $\\vec{u}=(" + t[0] + "," + t[1] + "," + t[2] + ")$ = ?",
      String(t[3]), [String(t[0] + t[1] + t[2]), String(t[3] * t[3]), String(t[3] - 1)],
      "$|\\vec u|=\\sqrt{x^2+y^2+z^2}=\\sqrt{" + (t[0] * t[0] + t[1] * t[1] + t[2] * t[2]) + "}$");
  }

  /* 三階行列式（高二下 1-5） */
  function gDet3() {
    var m = [[1 + ri(3), ri(5) - 2, ri(5) - 2],
             [ri(5) - 2, 1 + ri(3), ri(5) - 2],
             [ri(5) - 2, ri(5) - 2, 1 + ri(3)]];
    var d = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
          - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
          + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    var rows = m.map(function (r) { return r.join(" & "); }).join(" \\\\ ");
    return mk("quick", "g11b-05",
      "$\\begin{vmatrix} " + rows + " \\end{vmatrix} = \\ ?$", String(d),
      [String(-d), String(m[0][0] * m[1][1] * m[2][2]),
       String(m[0][0] + m[1][1] + m[2][2])],
      "沿第一列降階（或用薩魯斯法）；它的絕對值就是三向量張出的平行六面體體積");
  }

  /* 矩陣的運算（高二下 3-1） */
  function gMatrix() {
    var a = ri(7) - 3, b = ri(7) - 3, c = ri(7) - 3, d = ri(7) - 3;
    var e = ri(7) - 3, f = ri(7) - 3, g = ri(7) - 3, h = ri(7) - 3;
    var mode = ri(2);
    var M = function (p, q, r, s) {
      return "\\begin{bmatrix} " + p + " & " + q + " \\\\ " + r + " & " + s + " \\end{bmatrix}";
    };
    if (mode === 0) {
      var p = a * e + b * g, q = a * f + b * h, r = c * e + d * g, s = c * f + d * h;
      return mk("quick", "g11b-09",
        "$" + M(a, b, c, d) + M(e, f, g, h) + " = \\ ?$",
        "$" + M(p, q, r, s) + "$",
        ["$" + M(a * e, b * f, c * g, d * h) + "$",
         "$" + M(p, r, q, s) + "$",
         "$" + M(a + e, b + f, c + g, d + h) + "$",
         "$" + M(p + 1, q, r, s) + "$"],
        "矩陣乘法是「列 × 行」：左邊<b>橫著</b>取、右邊<b>直著</b>取再相加");
    }
    var det = a * d - b * c;
    return mk("quick", "g11b-09",
      "$A=" + M(a, b, c, d) + "$ 有反方陣的條件是？",
      "$\\det A \\ne 0$",
      ["$\\det A = 0$", "$A$ 的每個元素都不為 0", "$A$ 是對稱矩陣"],
      "$A^{-1}=\\dfrac{1}{\\det A}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$，分母不能為 0；此例 $\\det A=" +
      det + "$" + (det === 0 ? "，所以這個 $A$ 沒有反方陣" : "，所以這個 $A$ 有反方陣"));
  }

  /* 函數的極限（選修上 1-2） */
  function gFnLimit() {
    var a = 1 + ri(5), b = ri(9) - 4;
    if (ri(2)) {
      var k = 1 + ri(4);
      var val = a * k * k + b;
      return mk("quick", "g12a-02",
        "$\\displaystyle\\lim_{x\\to " + k + "} (" + a + "x^2" + (b < 0 ? "-" : "+") + Math.abs(b) + ") = \\ ?$",
        String(val), [String(a * k + b), String(a * k * k), String(val + k)],
        "多項式函數<b>連續</b>，極限值就是直接代入：$" + a + "\\times" + k + "^2" +
        (b < 0 ? "-" : "+") + Math.abs(b) + "$");
    }
    var r = 1 + ri(5);
    return mk("quick", "g12a-02",
      "$\\displaystyle\\lim_{x\\to " + r + "} \\dfrac{x^2-" + (r * r) + "}{x-" + r + "} = \\ ?$",
      String(2 * r), [String(0), String(r), "不存在"],
      "分子分母同時為 0 → 先因式分解約分：$\\dfrac{(x+" + r + ")(x-" + r + ")}{x-" + r + "}=x+" + r + "$");
  }

  /* 積分的應用（選修上 3-2） */
  function gIntApp() {
    var k = 1 + ri(3), a = pick([3, 6]);
    var area = a * Math.pow(k, 3) / 3;
    if (ri(2)) {
      return mk("quick", "g12a-06",
        "$y=" + a + "x^2$ 與 x 軸、$x=" + k + "$ 圍成的面積 = ?", String(area),
        [String(a * k * k), String(area * 3), String(area + k)],
        "面積 $=\\displaystyle\\int_0^{" + k + "}" + a + "x^2dx=\\dfrac{" + a + "}{3}x^3\\Big|_0^{" + k + "}$");
    }
    var m = 1 + ri(4);
    return mk("quick", "g12a-06",
      "$y=x$ 與 $y=x^2$ 在 $[0,1]$ 圍成的面積 = ?", "$\\dfrac{1}{6}$",
      ["$\\dfrac{1}{2}$", "$\\dfrac{1}{3}$", "$1$"],
      "上減下：$\\displaystyle\\int_0^1 (x-x^2)dx=\\dfrac{1}{2}-\\dfrac{1}{3}=\\dfrac{1}{6}$");
  }

  /* 離散型隨機變數（選修下 1-1） */
  function gRandVar() {
    var p = pick([[1, 2], [1, 3], [1, 4], [2, 5], [3, 10]]);
    var n = 2 + ri(5);
    if (ri(2)) {
      var vals = [0, 1, 2], ps = [frac(1, 4), frac(1, 2), frac(1, 4)];
      return mk("quick", "g12b-01",
        "隨機變數 X 的機率為 $P(0)=\\dfrac{1}{4}$、$P(1)=\\dfrac{1}{2}$、$P(2)=\\dfrac{1}{4}$，$E(X) = \\ ?$",
        "1", ["$\\dfrac{1}{2}$", "2", "$\\dfrac{3}{4}$"],
        "$E(X)=0\\times\\dfrac14+1\\times\\dfrac12+2\\times\\dfrac14=1$");
    }
    return mk("quick", "g12b-01",
      "隨機變數 X 的所有機率總和必須等於多少？", "1",
      ["0", "$E(X)$", "隨 X 的個數而定"],
      "這是機率分布的基本檢查：$\\sum P(x_i)=1$，且每個 $P\\ge0$");
  }

  KEYWORD = KEYWORD.concat([
    ["g10a-10", "三次函數要畫圖或找極值", "先微分（或找對稱中心與 x 軸交點）掌握大致形狀",
      ["直接配方成完全平方", "只找 y 截距", "假設圖形對稱於 y 軸"],
      "三次函數必有一個反曲點，圖形對稱於該點"],
    ["g10a-10", "三次方程式 $f(x)=0$ 問「幾個實根」", "看圖形與 x 軸的交點：由極大值與極小值的正負判斷",
      ["用判別式 $b^2-4ac$", "一定有 3 個實根", "一定只有 1 個實根"],
      "極大極小同號 → 1 個實根；異號 → 3 個；其中一個為 0 → 有重根"],
    ["g10b-03", "計數題不知道要用加法還是乘法", "分「類」用加法、分「步驟」用乘法",
      ["一律用乘法", "一律用加法", "看數字大小決定"],
      "「或」通常對應加法、「而且要接著做」對應乘法"],
    ["g10b-03", "計數時有情形被重複算到", "取捨（排容）原理：加起來再扣掉重複的",
      ["直接除以 2", "改用排列公式", "忽略重複的部分"],
      "$|A\\cup B|=|A|+|B|-|A\\cap B|$"],
    ["g10b-07", "題目問「平均而言可以得到多少」", "算期望值：$\\sum(\\text{值}\\times\\text{機率})$",
      ["取所有值的算術平均", "取最大值", "取中位數"],
      "期望值是<b>加權</b>平均，權重是機率"],
    ["g10b-07", "遊戲問「公不公平」", "算期望值是否為 0（或等於入場費）",
      ["看獲勝機率是否為 $\\dfrac12$", "看獎金是否夠大", "看玩幾次"],
      "期望值為 0 才是公平賭局"],
    ["g10b-10", "看到仰角、俯角、測量高度", "畫出直角三角形，用 sin、cos、tan 對應邊角",
      ["用正弦定理", "用相似三角形比例", "用畢氏定理就好"],
      "仰角俯角都是與<b>水平線</b>的夾角"],
    ["g10b-10", "記不住 sin、cos、tan 是哪兩邊", "SOH-CAH-TOA：對/斜、鄰/斜、對/鄰",
      ["都用斜邊當分母", "都用鄰邊當分母", "隨題目自己定義"],
      "先標出「對邊、鄰邊、斜邊」再套，斜邊永遠是直角的對邊"],
    ["g11a-05", "題目描述潮汐、摩天輪、日照時間等週期現象", "設成 $y=a\\sin(b(x-h))+k$，逐一對應振幅、週期、平移",
      ["設成一次函數", "設成指數函數", "用等差數列"],
      "振幅 = (最大−最小)/2、中心線 = (最大+最小)/2、週期由 b 決定"],
    ["g11a-05", "已知週期是 12 小時，要求出 b", "由 $\\dfrac{2\\pi}{|b|}=12$ 解出 $b=\\dfrac{\\pi}{6}$",
      ["$b=12$", "$b=\\dfrac{1}{12}$", "$b=2\\pi\\times12$"],
      "週期與 b 成反比，這一步最常算錯"],
    ["g11a-08", "解對數方程式 $\\log_a f(x)=\\log_a g(x)$", "先寫下「真數 > 0」的限制，再令 $f(x)=g(x)$",
      ["直接約掉 log 就好", "兩邊平方", "兩邊取指數後不必檢查"],
      "解完一定要<b>代回檢驗</b>，真數為負的解要捨去"],
    ["g11a-08", "對數不等式 $\\log_a x > \\log_a y$", "$a>1$ 時 $x>y$；$0&lt;a<1$ 時 $x&lt;y$（方向相反）",
      ["方向永遠不變", "方向永遠相反", "與底數無關"],
      "和指數不等式是同一個陷阱，再加上真數要大於 0"],
    ["g11a-12", "單點透視圖裡，與畫面平行的線", "畫出來仍然互相平行，不會交於消失點",
      ["都會交於消失點", "會變成鉛直線", "長度不變"],
      "只有與視線方向平行的線才會交於消失點"],
    ["g11a-12", "透視圖中距離觀察者愈遠的等長線段", "在畫面上會愈短（等比例縮小）",
      ["長度不變", "會變長", "與距離無關"],
      "這就是用比例（相似）描述投影的核心"],
    ["g11b-01", "空間中兩直線不平行也不相交", "它們是<b>歪斜線</b>（不共面）",
      ["一定平行", "一定相交", "一定垂直"],
      "平面上只有平行或相交，空間中多了歪斜這個情形"],
    ["g11b-01", "要證明一條直線垂直於一個平面", "證它垂直於平面上<b>兩條相交</b>直線",
      ["垂直於平面上任一條直線即可", "垂直於平面的法向量", "與平面平行"],
      "只垂直於一條不夠，那條線可以繞著轉"],
    ["g11b-02", "空間中求兩點距離", "$\\sqrt{(\\Delta x)^2+(\\Delta y)^2+(\\Delta z)^2}$",
      ["$|\\Delta x|+|\\Delta y|+|\\Delta z|$", "先投影到 xy 平面再算", "用內積"],
      "就是畢氏定理用兩次"],
    ["g11b-03", "空間向量要判斷是否平行", "分量成比例（$\\vec u=k\\vec v$）",
      ["內積為 0", "長度相等", "外積為 0 但方向不同"],
      "垂直才是內積為 0；平行是外積為零向量"],
    ["g11b-05", "要算平行六面體或四面體的體積", "用三階行列式：四面體再除以 6",
      ["用外積長度", "底面積乘高除以 2", "三邊長相乘"],
      "$|\\det|$ 是平行六面體體積，四面體是它的 $\\dfrac16$"],
    ["g11b-07", "空間直線要寫成方程式", "用「一點 + 方向向量」寫參數式或比例式",
      ["用兩個平面的法向量相加", "只寫斜率", "用一般式 $ax+by+cz=d$"],
      "空間中一個一次方程式代表<b>平面</b>，直線需要兩個方程式或參數式"],
    ["g11b-07", "判斷直線與平面平行", "方向向量與法向量<b>內積為 0</b>，且直線上的點不在平面上",
      ["方向向量與法向量平行", "兩者外積為 0", "直線的方向向量為零向量"],
      "內積為 0 但點在平面上的話，直線是躺在平面裡"],
    ["g11b-08", "三元一次聯立方程式無解", "三個平面沒有共同交點（可能兩兩平行或圍成三角柱）",
      ["三平面重合", "三平面交於一點", "三平面交於一直線"],
      "行列式 $\\Delta=0$ 時要再判斷是無解還是無限多解"],
    ["g11b-08", "三元一次聯立有無限多組解", "三個平面交於一條直線（或完全重合）",
      ["三平面交於一點", "三平面互相平行", "無解"],
      "$\\Delta=0$ 且 $\\Delta_x=\\Delta_y=\\Delta_z=0$ 時才可能無限多解"],
    ["g11b-11", "題目說「根據過去統計，這種情形發生的比例是…」", "這是<b>客觀</b>機率（由大量重複試驗的相對次數估計）",
      ["主觀機率", "條件機率", "期望值"],
      "由個人信念給出的才是主觀機率；兩者都要滿足機率的基本性質"],
    ["g11b-09", "解三元一次聯立時把增廣矩陣化成階梯形", "高斯消去法",
      ["克拉瑪公式", "反矩陣法", "轉移矩陣"],
      "列運算只有三種：兩列互換、某列乘非零數、某列加上另一列的倍數"],
    ["g11b-09", "矩陣乘法 $AB$ 與 $BA$", "通常<b>不相等</b>（矩陣乘法不可交換）",
      ["一定相等", "只有方陣才相等", "順序不影響結果"],
      "而且 $AB$ 有意義時 $BA$ 不一定有意義（要看維度）"],
    ["g11b-10", "題目給「每年有多少比例轉移到另一狀態」", "寫成轉移矩陣，第 n 年的狀態 $=A^n X_0$",
      ["用等差數列", "用一次函數", "直接相加"],
      "轉移矩陣每一行的機率和為 1"],
    ["g11b-10", "線性變換後圖形的面積變成幾倍", "乘上 $|\\det A|$",
      ["乘上 $\\det A$（含正負）", "乘上矩陣元素的和", "面積不變"],
      "行列式為負代表方向翻轉，面積要取絕對值"],
    ["g12a-02", "求極限時代入後變成 $\\dfrac{0}{0}$", "先因式分解約分（或有理化）再代入",
      ["直接說極限不存在", "上下相減", "代一個接近的數字估計"],
      "$\\dfrac00$ 是未定式，不是答案"],
    ["g12a-02", "問函數在某點是否<b>連續</b>", "檢查三件事：有定義、極限存在、兩者相等",
      ["只要有定義就連續", "只要極限存在就連續", "只要圖形畫得出來就連續"],
      "分段函數的接點最愛考這個"],
    ["g12a-06", "求兩曲線圍成的面積", "先解交點定上下限，再積「上減下」",
      ["兩個函數各自積分再相減", "直接積分後取絕對值", "用微分"],
      "上下關係若在區間內互換，要分段"],
    ["g12b-01", "題目定義了一個隨機變數 X", "先列出機率分布表，確認機率總和為 1",
      ["直接算平均數", "假設每個值機率相同", "先算變異數"],
      "分布表列好之後，期望值與變異數都只是加權求和"],
    ["g12b-01", "求變異數", "$\\mathrm{Var}(X)=E(X^2)-[E(X)]^2$",
      ["$E(X)^2-E(X^2)$", "$E(X)-E(X^2)$", "$\\sqrt{E(X)}$"],
      "先算 $E(X^2)$（把每個值平方再加權），不是把 $E(X)$ 平方就好"]
  ]);

  FORMULA = FORMULA.concat([
    ["g10a-10", "三次函數圖形的對稱中心", "反曲點（$f''(x)=0$ 的點）",
      ["頂點", "與 y 軸的交點", "極大值所在的點"],
      "三次函數對稱於一個<b>點</b>，二次函數才是對稱於一條線"],
    ["g10b-03", "$|A\\cup B|=|A|+|B|-|A\\cap B|$", "取捨（排容）原理",
      ["乘法原理", "加法原理", "條件機率"],
      "被重複算到的部分要扣回來"],
    ["g10b-07", "$\\sum x_i\\,p_i$", "期望值", ["變異數", "標準差", "機率總和"],
      "是以機率為權重的加權平均"],
    ["g10b-10", "$\\dfrac{\\text{對邊}}{\\text{斜邊}}$", "$\\sin$", ["$\\cos$", "$\\tan$", "斜率"],
      "SOH-CAH-TOA：sin 對斜、cos 鄰斜、tan 對鄰"],
    ["g11a-05", "$y=a\\sin(b(x-h))+k$ 中的 $\\dfrac{\\text{最大}-\\text{最小}}{2}$", "振幅 $|a|$",
      ["週期", "中心線 k", "相位 h"],
      "中心線 $k=\\dfrac{\\text{最大}+\\text{最小}}{2}$"],
    ["g11a-08", "$y=\\log_a x$ 的圖形恆過的點", "$(1,0)$", ["$(0,1)$", "原點", "$(a,a)$"],
      "定義域是 $x>0$，y 軸是它的鉛直漸近線"],
    ["g11a-12", "透視圖中平行於視線方向的直線交會處", "消失點（滅點）",
      ["視平線", "基線", "焦點"],
      "單點透視只有一個消失點，落在視平線上"],
    ["g11b-01", "空間中兩直線不共面", "歪斜線", ["平行線", "垂直線", "共點直線"],
      "歪斜線的距離要用公垂線（外積）來算"],
    ["g11b-02", "$\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2+(z_2-z_1)^2}$", "空間兩點距離",
      ["點到平面距離", "向量內積", "平面方程式"],
      "比平面多一個 z 的平方，本質仍是畢氏定理"],
    ["g11b-03", "$(x,y,z)$ 這種寫法用在向量時", "以原點為始點的位置向量",
      ["一個平面", "一條直線", "一個純量"],
      "向量只看「差」，所以可以平移到原點來表示"],
    ["g11b-05", "三階行列式的絕對值", "三個向量張出的平行六面體體積",
      ["平行四邊形面積", "四面體體積", "三角形面積"],
      "四面體體積是它的 $\\dfrac16$"],
    ["g11b-07", "$\\dfrac{x-x_0}{a}=\\dfrac{y-y_0}{b}=\\dfrac{z-z_0}{c}$", "空間直線的比例式",
      ["平面方程式", "球面方程式", "點到直線距離"],
      "$(a,b,c)$ 是方向向量、$(x_0,y_0,z_0)$ 是直線上一點"],
    ["g11b-08", "克拉瑪公式中 $\\Delta=0$", "無法直接用公式，要另外討論無解或無限多解",
      ["恰有一組解", "一定無解", "一定無限多解"],
      "$\\Delta\\ne0$ 才保證恰有一組解"],
    ["g11b-09", "$\\dfrac{1}{ad-bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$", "二階反方陣",
      ["轉置矩陣", "單位矩陣", "伴隨行列式"],
      "$ad-bc=0$ 時反方陣不存在"],
    ["g11b-10", "$|\\det A|$", "線性變換後<b>面積的伸縮倍率</b>",
      ["圖形旋轉的角度", "平移量", "矩陣的跡"],
      "$\\det A=0$ 代表整個平面被壓成一條線"],
    ["g12a-02", "函數在 $x=a$ 連續的三個條件", "有定義、極限存在、兩者相等",
      ["只要有定義", "只要極限存在", "只要左極限存在"],
      "分段函數的接點是最常見的考點"],
    ["g12a-06", "$\\displaystyle\\int_a^b [f(x)-g(x)]\\,dx$（$f$ 在上）", "兩曲線間的面積",
      ["曲線長度", "旋轉體體積", "平均變化率"],
      "先解交點決定上下限，再確認誰在上面"],
    ["g12b-01", "$E(X^2)-[E(X)]^2$", "變異數 $\\mathrm{Var}(X)$",
      ["期望值", "標準差", "機率總和"],
      "開根號之後才是標準差"],
    ["g11a-05", "$\\dfrac{2\\pi}{|b|}$（在 $y=a\\sin(bx+c)+d$ 中）", "週期",
      ["振幅", "相位差", "中心線"],
      "描述週期現象時，先由「多久重複一次」定出 b"],
    ["g11a-12", "透視圖中所有消失點所在的水平線", "視平線（地平線）",
      ["基線", "垂線", "對角線"],
      "視平線的高度等於觀察者眼睛的高度"],
    ["g11b-01", "一直線垂直於平面上兩條<b>相交</b>直線", "此直線垂直於該平面",
      ["此直線平行於該平面", "此直線在平面上", "無法判斷"],
      "「兩條相交」是關鍵，只垂直於一條不夠"],
    ["g11b-02", "$(x-a)^2+(y-b)^2+(z-c)^2=r^2$", "球面方程式",
      ["平面方程式", "空間直線", "圓柱面"],
      "和圓的標準式同一個模式，多了一個 z"],
    ["g11b-03", "$\\vec{u}=k\\vec{v}$（k 為實數）", "兩向量互相平行",
      ["兩向量互相垂直", "兩向量等長", "兩向量共起點"],
      "垂直是內積為 0，別記反了"],
    ["g11b-05", "三階行列式中兩列完全相同", "行列式的值為 0",
      ["行列式的值為 1", "行列式的值加倍", "無法計算"],
      "幾何意義：三個向量壓在同一平面上，體積為 0"],
    ["g11b-07", "空間直線的參數式 $(x,y,z)=(x_0,y_0,z_0)+t(a,b,c)$ 中的 $(a,b,c)$", "方向向量",
      ["法向量", "直線上的定點", "參數"],
      "平面用法向量、直線用方向向量，兩者角色相反"],
    ["g11b-08", "三元一次聯立方程式的 $\\Delta\\ne0$", "恰有一組解（三平面交於一點）",
      ["無解", "無限多解", "無法判斷"],
      "$\\Delta=0$ 時才需要再討論無解或無限多解"],
    ["g11b-09", "$AB$ 與 $BA$（矩陣乘法）", "通常不相等", ["一定相等", "互為反方陣", "行列式互為倒數"],
      "矩陣乘法沒有交換律，這是與數字最大的不同"],
    ["g11b-10", "轉移矩陣中每一行（各狀態的去向）的機率和", "等於 1",
      ["等於 0", "等於狀態數", "沒有限制"],
      "因為每個狀態下一步一定會轉到某個狀態"],
    ["g12a-06", "$\\displaystyle\\int_a^b f(x)\\,dx$ 在 $f(x)<0$ 的區間", "積出來是負值，算面積要取絕對值",
      ["仍然是正的面積", "等於 0", "不能積分"],
      "「定積分」與「面積」不完全相同，這是最常見的陷阱"]
  ]);

  /* ────────── 題源索引（w = 出現權重） ────────── */
  var GENS = {
    trig: [
      { f: gTrigValue,   w: 5, chs: [CH_DEG, CH_RAD] },
      { f: gTanUndef,    w: 1, chs: [CH_DEG, CH_RAD] },
      { f: gTrigCompare, w: 2, chs: [CH_DEG] }
    ],
    trans: [
      { f: gInduction, w: 4, chs: [CH_DEG, CH_RAD] },
      { f: gRadDeg,    w: 2, chs: [CH_RAD] },
      { f: gQuadrant,  w: 2, chs: [CH_DEG] },
      { f: gInverse,   w: 2, chs: [CH_DEG] },
      { f: gPeriod,    w: 2, chs: ["g11a-02"] }
    ],
    quick: [
      { f: gLogValue,     w: 2, chs: ["g11a-07"] },
      { f: gPowFrac,      w: 2, chs: ["g10a-03"] },
      { f: gCombination,  w: 2, chs: ["g10b-04", "g10b-05"] },
      { f: gDot,          w: 2, chs: ["g11a-10"] },
      { f: gDet,          w: 2, chs: ["g11a-11"] },
      { f: gSeq,          w: 2, chs: ["g10b-01"] },
      { f: gI,            w: 1, chs: ["g12b-03"] },
      { f: gDisc,         w: 2, chs: ["g10a-09"] },
      { f: gCircleCenter, w: 2, chs: ["g10a-06"] },
      { f: gVertex,       w: 2, chs: ["g10a-09"] },
      { f: gSlope,        w: 2, chs: ["g10a-05"] },
      /* 補充：讓原本只有一兩個題源的章節也練得下去 */
      { f: gRealEst,      w: 2, chs: ["g10a-01"] },
      { f: gExpLawHS,     w: 2, chs: ["g10a-03"] },
      { f: gDigits,       w: 2, chs: ["g10a-04"] },
      { f: gCircleRadius, w: 2, chs: ["g10a-06"] },
      { f: gSigma,        w: 2, chs: ["g10b-02"] },
      { f: gProbBasic,    w: 2, chs: ["g10b-06"] },
      { f: gRadArc,       w: 2, chs: ["g11a-01"] },
      { f: gSuperpose,    w: 2, chs: ["g11a-04"] },
      { f: gExpFn,        w: 2, chs: ["g11a-06"] },
      { f: gCross,        w: 2, chs: ["g11b-04"] },
      { f: gLimit,        w: 2, chs: ["g12a-01"] },
      { f: gDiff,         w: 2, chs: ["g12a-03"] },
      { f: gIntegral,     w: 2, chs: ["g12a-05"] },
      { f: gComplex,      w: 2, chs: ["g12b-03"] },
      { f: gDeMoivre,     w: 2, chs: ["g12b-04"] },
      { f: gConic,        w: 3, chs: ["g12b-06", "g12b-07", "g12b-08"] },
      /* 補齊課綱原本沒有題目的章節 */
      { f: gCubic,        w: 2, chs: ["g10a-10"] },
      { f: gCount,        w: 2, chs: ["g10b-03"] },
      { f: gExpect,       w: 2, chs: ["g10b-07"] },
      { f: gRightTri,     w: 2, chs: ["g10b-10"] },
      { f: gLogFn,        w: 2, chs: ["g11a-08"] },
      { f: gSpaceCoord,   w: 2, chs: ["g11b-02"] },
      { f: gSpaceVec,     w: 2, chs: ["g11b-03"] },
      { f: gDet3,         w: 2, chs: ["g11b-05"] },
      { f: gMatrix,       w: 2, chs: ["g11b-09"] },
      { f: gFnLimit,      w: 2, chs: ["g12a-02"] },
      { f: gIntApp,       w: 2, chs: ["g12a-06"] },
      { f: gRandVar,      w: 2, chs: ["g12b-01"] }
    ]
  };
  /* concept（觀念判斷）與 link（串聯反射）的題目寫在 data/reflex-bank-2.js，
   * 由 REFLEX_BANK.extend() 掛進這兩個陣列；graph（圖形辨識）掛進 GENS.graph。 */
  var CONCEPT = [], LINK = [];
  GENS.graph = [];
  var STATICS = { keyword: KEYWORD, formula: FORMULA, concept: CONCEPT, link: LINK };

  /* 靜態題的問句尾巴：每個題型問法不同 */
  var TAIL = {
    keyword: function () { return "，你的第一個動作是？"; },
    formula: function (r) { return r[1].indexOf("$") >= 0 ? " 是誰的公式／代表什麼？" : "，代表什麼？"; },
    concept: function () { return ""; },     /* 題幹本身就寫成完整的問句 */
    link:    function () { return " ⟶ 它其實就是？"; }
  };

  function inScope(ch, set) { return !set || set.has(ch); }
  function statRows(cat, set) {
    return STATICS[cat].filter(function (r) { return inScope(r[0], set); });
  }
  function genList(cat, set) {
    return GENS[cat].filter(function (g) {
      return g.chs.some(function (c) { return inScope(c, set); });
    });
  }
  function pickW(list) {
    var total = 0, i;
    for (i = 0; i < list.length; i++) total += list[i].w;
    var r = Math.random() * total;
    for (i = 0; i < list.length; i++) { r -= list[i].w; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }

  /* ────────── 對外 API ────────── */
  window.REFLEX_BANK = {
    cats: CATS,
    gsatSems: GSAT_SEMS,

    /* 章節 id → 顯示名稱／頁面連結（靠 data/curriculum.js） */
    labelOf: function (id) {
      var C = window.CURRICULUM;
      if (!C) return id;
      for (var i = 0; i < C.semesters.length; i++) {
        var sem = C.semesters[i];
        for (var j = 0; j < sem.chapters.length; j++) {
          if (sem.chapters[j].id === id) return sem.name + " " + sem.chapters[j].num + " " + sem.chapters[j].title;
        }
      }
      return id;
    },
    pageOf: function (id) {
      // 只發佈直覺道場、沒有上傳章節頁時（data/site.js 的 chapters:false）就別給連結，
      // 結算頁會自動改成「去工具地圖」。
      if (window.SITE && window.SITE.chapters === false) return null;
      if (!HAS_PAGE[id] || !window.CURRICULUM) return null;
      var C = window.CURRICULUM;
      for (var i = 0; i < C.semesters.length; i++) {
        var sem = C.semesters[i];
        for (var j = 0; j < sem.chapters.length; j++) {
          if (sem.chapters[j].id === id) {
            return "chapters/" + sem.id + "/ch" + (j + 1 < 10 ? "0" : "") + (j + 1) + ".html";
          }
        }
      }
      return null;
    },

    /* 有題目的章節清單（依課綱順序），n = 題源數量 */
    chapters: function () {
      var idx = {};
      function bump(ch) { idx[ch] = (idx[ch] || 0) + 1; }
      Object.keys(STATICS).forEach(function (c) { STATICS[c].forEach(function (r) { bump(r[0]); }); });
      Object.keys(GENS).forEach(function (c) {
        GENS[c].forEach(function (g) { g.chs.forEach(bump); });
      });
      var out = [], C = window.CURRICULUM;
      if (!C) { Object.keys(idx).forEach(function (id) { out.push({ id: id, sem: "", label: id, n: idx[id] }); }); return out; }
      C.semesters.forEach(function (sem) {
        sem.chapters.forEach(function (ch) {
          if (idx[ch.id]) out.push({ id: ch.id, sem: sem.name, semId: sem.id,
            label: ch.num + " " + ch.title, n: idx[ch.id] });
        });
      });
      return out;
    },

    /* 範圍 → Set（null = 不限）。chapter 可傳單一 id 或 id 陣列（複選） */
    scopeSet: function (kind, chId) {
      if (kind === "all") return null;
      if (kind === "chapter") return new Set(Array.isArray(chId) ? chId : [chId]);
      var s = new Set();
      this.chapters().forEach(function (c) {
        if (GSAT_SEMS.indexOf(c.semId) >= 0) s.add(c.id);
      });
      return s;
    },

    /* 這個範圍內還有題目的題型 */
    availableCats: function (set) {
      return CATS.filter(function (c) {
        return STATICS[c.id] ? statRows(c.id, set).length > 0 : genList(c.id, set).length > 0;
      }).map(function (c) { return c.id; });
    },

    /* 出一題；範圍內出不了題時回傳 null */
    make: function (cat, set) {
      if (STATICS[cat]) {
        var rows = statRows(cat, set);
        if (!rows.length) return null;
        var r = rows[ri(rows.length)];
        var tail = (TAIL[cat] || function () { return ""; })(r);
        return mk(cat, r[0], r[1] + tail, r[2], r[3], r[4]);
      }
      var gs = genList(cat, set);
      if (!gs.length) return null;
      for (var i = 0; i < 40; i++) {
        var it = pickW(gs).f();
        if (inScope(it.ch, set)) return it;
      }
      return null;
    },

    size: { keyword: KEYWORD.length, formula: FORMULA.length,
            concept: CONCEPT.length, link: LINK.length },

    /* 給續篇題庫（data/reflex-bank-2.js）用的掛載口。
     * 只是把題目接到既有的 CATS／STATICS／GENS 上，對外 API 完全不變。
     * ext = { cats:[…], statics:{ 題型: [列…] }, gens:{ 題型: [{f,w,chs}…] } }
     * 也回傳 mk 等小工具，讓續篇的產生器能用同一套組題／洗牌邏輯。 */
    extend: function (ext) {
      (ext.cats || []).forEach(function (c) {
        if (!CATS.some(function (x) { return x.id === c.id; })) CATS.push(c);
      });
      Object.keys(ext.statics || {}).forEach(function (k) {
        if (!STATICS[k]) STATICS[k] = [];
        ext.statics[k].forEach(function (row) { STATICS[k].push(row); });
      });
      Object.keys(ext.gens || {}).forEach(function (k) {
        if (!GENS[k]) GENS[k] = [];
        ext.gens[k].forEach(function (g) { GENS[k].push(g); });
      });
      Object.keys(ext.tails || {}).forEach(function (k) { TAIL[k] = ext.tails[k]; });
      var self = this;
      Object.keys(STATICS).forEach(function (k) { self.size[k] = STATICS[k].length; });
      return this;
    },
    util: { mk: mk, ri: ri, pick: pick, shuffle: shuffle, frac: frac, distract: distract }
  };
})();
