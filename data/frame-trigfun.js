/* 架構重建卡 06：三角函數性質（學測範圍，高二上）。格式見 _scripts/frame_cards/FORMAT.md；數值例由 _scripts/frame_cards/verify_frame_trigfun.py 驗算。
   範圍：sin、cos、tan 的圖形與性質、四參數一般式、正餘弦疊合。cot／sec／csc（加深加廣）、積化和差、和差化積不收。 */
FRAME({
  id: "trigfun", stage: "hs", no: 6, n: "三角函數性質",
  scope: "學測（數A：高二上）",
  time: 15,
  intro: "下表每一列是一種三角函數（$x$ 用弧度），請寫出它的週期、值域、對稱（奇偶、對稱軸、對稱中心）、零點、最大最小值出現在哪裡。答案裡的 $k$ 一律代表整數。第 ④、⑤ 列要先寫出你怎麼把它化成前面某一列，再填性質。想不出來就寫「?」。",
  sections: [
    {
      id: "main", title: "五種三角函數（$k$ 是整數）", type: "props", rowH: 30,
      fields: [{ id: "period", n: "週期" }, { id: "range", n: "值域" }, { id: "sym", n: "對稱（奇偶、對稱軸、對稱中心）" }, { id: "zero", n: "零點" }, { id: "ext", n: "最大最小在哪裡" }],
      rows: [
        {
          id: "1", n: "$y=\\sin x$",
          ans: {
            period: "$2\\pi$",
            range: "$[-1,1]$",
            sym: "奇函數；對稱軸 $x=\\frac{\\pi}{2}+k\\pi$（過最高最低點）；對稱中心 $(k\\pi,0)$",
            zero: "$x=k\\pi$",
            ext: "最大值 $1$ 在 $x=\\frac{\\pi}{2}+2k\\pi$；最小值 $-1$ 在 $x=-\\frac{\\pi}{2}+2k\\pi$"
          },
          reduce: [], reduceNote: "基準列：角 $x$ 的終邊與單位圓交點的縱坐標",
          tools: ["trig/graph/基本圖形與週期", "trig/graph/三角函數的值域"], kp: ["T-06"],
          ex: [{ id: "tf1", q: "$y=\\sin x$ 在 $0\\le x\\le4\\pi$ 的零點個數", a: "$5$ 個（$0,\\pi,2\\pi,3\\pi,4\\pi$）", val: "5" }]
        },
        {
          id: "2", n: "$y=\\cos x$",
          ans: {
            period: "$2\\pi$",
            range: "$[-1,1]$",
            sym: "偶函數；對稱軸 $x=k\\pi$；對稱中心 $(\\frac{\\pi}{2}+k\\pi,0)$",
            zero: "$x=\\frac{\\pi}{2}+k\\pi$",
            ext: "最大值 $1$ 在 $x=2k\\pi$；最小值 $-1$ 在 $x=\\pi+2k\\pi$"
          },
          reduce: ["1"], reduceNote: "$\\cos x=\\sin(x+\\frac{\\pi}{2})$：sin 的圖左移 $\\frac{\\pi}{2}$，①的每個位置減 $\\frac{\\pi}{2}$，週期、值域不變",
          tools: ["trig/graph/基本圖形與週期", "trig/graph/三角函數的值域"], kp: ["T-06"],
          ex: [{ id: "tf2", q: "$\\cos x=0$ 在 $0\\le x\\le2\\pi$ 的解", a: "$x=\\frac{\\pi}{2},\\frac{3\\pi}{2}$", val: "(pi/2,3*pi/2)" }]
        },
        {
          id: "3", n: "$y=\\tan x$",
          ans: {
            period: "$\\pi$（不是 $2\\pi$）",
            range: "全體實數",
            sym: "奇函數；沒有對稱軸；對稱中心 $(\\frac{k\\pi}{2},0)$（含漸近線與 $x$ 軸的交點）",
            zero: "$x=k\\pi$（同 sin）；漸近線 $x=\\frac{\\pi}{2}+k\\pi$（cos 的零點）",
            ext: "沒有；每一段 $-\\frac{\\pi}{2}+k\\pi < x < \\frac{\\pi}{2}+k\\pi$ 都遞增"
          },
          reduce: ["1", "2"], reduceNote: "$\\tan x=\\frac{\\sin x}{\\cos x}$：sin 為 $0$ 是零點，cos 為 $0$ 是漸近線；$x$ 加 $\\pi$ 時 sin、cos 同時變號，所以週期是 $\\pi$",
          tools: ["trig/graph/基本圖形與週期", "trig/graph/三角函數的值域"], kp: ["T-06"],
          ex: [{ id: "tf3", q: "$y=\\tan x$ 在 $0\\le x\\le2\\pi$ 的零點個數、漸近線條數", a: "零點 $3$ 個、漸近線 $2$ 條", val: "(3,2)" }]
        },
        {
          id: "4", n: "一般式 $y=a\\sin(bx+c)+d$",
          ans: {
            period: "$\\frac{2\\pi}{\\lvert b\\rvert}$（$b$ 管週期）",
            range: "$[d-\\lvert a\\rvert,d+\\lvert a\\rvert]$；振幅 $\\lvert a\\rvert$，中心線 $y=d$",
            sym: "令 $u=bx+c$：對稱軸 $u=\\frac{\\pi}{2}+k\\pi$，對稱中心 $u=k\\pi$（縱坐標 $d$）；$d=0$ 且 $c$ 是 $\\pi$ 的倍數才是奇函數",
            zero: "解 $\\sin u=-\\frac{d}{a}$；$\\lvert d\\rvert>\\lvert a\\rvert$ 時沒有零點",
            ext: "$a>0$：$u=\\frac{\\pi}{2}+2k\\pi$ 最大、$u=-\\frac{\\pi}{2}+2k\\pi$ 最小；$a < 0$ 時對調"
          },
          reduce: ["1"], reduceNote: "$a$、$b$、$c$、$d$ 是常數（$ab\\ne0$），$d$ 是鉛直位移。$bx+c=b(x+\\frac{c}{b})$：①水平伸縮、左移 $\\frac{c}{b}$（不是 $c$），再乘 $a$、加 $d$",
          tools: ["trig/graph/標準形與四參數", "trig/graph/基本圖形與週期", "trig/graph/三角函數的值域"], kp: ["T-06"],
          ex: [
            { id: "tf4a", q: "$y=2\\sin(2x-\\frac{\\pi}{3})+1$ 的週期、值域", a: "週期 $\\pi$，值域 $[-1,3]$", val: "(pi,-1,3)" },
            { id: "tf4b", q: "同上，$0\\le x\\le\\pi$ 時最大值發生在", a: "$x=\\frac{5\\pi}{12}$", val: "5*pi/12" },
            { id: "tf4c", q: "同上，$0\\le x\\le\\pi$ 的零點", a: "$x=\\frac{\\pi}{12},\\frac{3\\pi}{4}$", val: "(pi/12,3*pi/4)" }
          ]
        },
        {
          id: "5", n: "疊合 $y=a\\sin x+b\\cos x$",
          ans: {
            period: "$2\\pi$（同週期的波相加）",
            range: "$[-r,r]$，$r=\\sqrt{a^2+b^2}$ 是振幅（不是 $a+b$）",
            sym: "照④：對稱軸 $x+\\varphi=\\frac{\\pi}{2}+k\\pi$，對稱中心 $x+\\varphi=k\\pi$；$b=0$ 才奇、$a=0$ 才偶",
            zero: "$x+\\varphi=k\\pi$；$a\\ne0$ 時也就是 $\\tan x=-\\frac{b}{a}$",
            ext: "$x+\\varphi=\\frac{\\pi}{2}+2k\\pi$ 最大 $r$，$x+\\varphi=-\\frac{\\pi}{2}+2k\\pi$ 最小 $-r$；限定區間先算 $x+\\varphi$ 的範圍"
          },
          reduce: ["4"], reduceNote: "$a$、$b$ 不全為 $0$；輔助角 $\\varphi$ 滿足 $\\cos\\varphi=\\frac{a}{r}$、$\\sin\\varphi=\\frac{b}{r}$。和角公式倒用：$a\\sin x+b\\cos x=r\\sin(x+\\varphi)$，即④振幅 $r$、左移 $\\varphi$、中心線 $y=0$",
          tools: ["trig/graph/正弦疊合", "trig/identity/和差角公式", "trig/graph/三角函數的值域"], kp: ["T-05", "T-06"],
          ex: [
            { id: "tf5a", q: "$y=3\\sin x+4\\cos x$ 的最大值", a: "$5$", val: "5" },
            { id: "tf5b", q: "$y=\\sin x+\\sqrt3\\cos x$（$0\\le x\\le2\\pi$）最大值發生在", a: "$x=\\frac{\\pi}{6}$（$=2\\sin(x+\\frac{\\pi}{3})$）", val: "pi/6" },
            { id: "tf5c", q: "$y=\\sqrt3\\sin x-\\cos x$ 在 $0\\le x\\le\\pi$ 的值域", a: "$[-1,2]$（$=2\\sin(x-\\frac{\\pi}{6})$）", val: "(-1,2)" }
          ]
        }
      ]
    }
  ],
  final: [
    {
      id: "map", q: "用箭頭畫出：②、③、④、⑤ 各降成哪一列？在每支箭頭旁寫上「怎麼降」。",
      ans: "② → ①：$\\cos x=\\sin(x+\\frac{\\pi}{2})$，左移 $\\frac{\\pi}{2}$。③ → ①、②：$\\tan x=\\frac{\\sin x}{\\cos x}$，零點看 sin、漸近線看 cos。④ → ①：令 $u=bx+c$，伸縮、平移。⑤ → ④：疊合成 $\\sqrt{a^2+b^2}\\sin(x+\\varphi)$（$\\varphi$ 是輔助角）。所以整張表其實只有 sin 一列是新的。",
      lines: 4
    },
    {
      id: "abcd", q: "在 $y=a\\sin(bx+c)+d$ 裡，$a$、$b$、$c$、$d$ 各會改變表中的哪幾欄？哪一個參數完全不影響值域？",
      ans: "$a$：值域（振幅 $\\lvert a\\rvert$），$a < 0$ 時最大最小位置對調、零點也可能變。$b$：週期，連帶所有位置。$c$：只左右平移（移 $\\frac{c}{b}$），改變對稱軸、對稱中心、零點、最大最小的位置。$d$：值域與中心線，也影響零點有沒有。$b$、$c$ 完全不影響值域。",
      lines: 4
    },
    {
      id: "sketch", q: "在下方空白處畫出 $0\\le x\\le2\\pi$ 的 $y=\\sin x$ 和 $y=\\cos x$（同一張圖），以及 $-\\frac{\\pi}{2} < x < \\frac{3\\pi}{2}$ 的 $y=\\tan x$；標出零點、最高最低點、漸近線。",
      ans: "sin 過 $(0,0)$、$(\\frac{\\pi}{2},1)$、$(\\pi,0)$、$(\\frac{3\\pi}{2},-1)$、$(2\\pi,0)$；cos 是同一條波左移 $\\frac{\\pi}{2}$，過 $(0,1)$、$(\\frac{\\pi}{2},0)$、$(\\pi,-1)$、$(\\frac{3\\pi}{2},0)$、$(2\\pi,1)$，兩圖交於 $x=\\frac{\\pi}{4}$、$\\frac{5\\pi}{4}$。tan 有兩段遞增曲線，過 $(0,0)$、$(\\pi,0)$，漸近線 $x=\\frac{\\pi}{2}$，兩端貼近 $x=-\\frac{\\pi}{2}$、$x=\\frac{3\\pi}{2}$。",
      lines: 6
    }
  ],
  pitfalls: [
    "相位讀錯：$y=\\sin(2x+\\frac{\\pi}{3})$ 是 $y=\\sin2x$ 左移 $\\frac{\\pi}{6}$，不是左移 $\\frac{\\pi}{3}$；要先提出 $x$ 的係數。",
    "疊合的最大值答成 $a+b$：$\\sin x$、$\\cos x$ 不會同時到 $1$，最大值是 $\\sqrt{a^2+b^2}$。",
    "限定區間還直接答 $\\pm\\sqrt{a^2+b^2}$：要先算 $x+\\varphi$ 的範圍，例如 $\\sqrt3\\sin x-\\cos x$ 在 $0\\le x\\le\\pi$ 的最小值是 $-1$，不是 $-2$。",
    "tan 的週期寫成 $2\\pi$；或以為 tan 有對稱軸。tan 的對稱中心 $(\\frac{k\\pi}{2},0)$ 也包含漸近線與 $x$ 軸的交點。",
    "週期公式漏了絕對值：$y=\\sin(-3x)$ 的週期是 $\\frac{2\\pi}{3}$，不是負的。",
    "$a < 0$ 時還照 $a>0$ 的位置找最大值：$y=-2\\sin x$ 的最大值 $2$ 發生在 $x=-\\frac{\\pi}{2}+2k\\pi$。"
  ]
});
