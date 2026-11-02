/* 架構重建卡 08：指數與對數（學測範圍，高一上指數與常用對數、高二上指對數函數）。格式見 _scripts/frame_cards/FORMAT.md；數值例由 _scripts/frame_cards/verify_frame_batch2.py 驗算。 */
FRAME({
  id: "explog", stage: "hs", no: 8, n: "指數與對數",
  scope: "學測（數A：高一上、高二上）",
  time: 15,
  intro: "對數不是新發明的獨立運算，它只是「把指數解出來」的反問法：$a^b=N\\iff b=\\log_a N$（$a>0$、$a\\ne1$、$N>0$）。請先對照指數律與對數律怎麼一一對應，再填背面指數函數與對數函數的圖形性質、不等式變號條件與常用對數應用。想不出來就寫「?」。",
  sections: [
    {
      id: "laws", title: "指數律與對數律的一一對應（底數 $a$、$c>0$ 且 $a$、$c\\ne1$；真數 $M$、$N>0$；$r$、$s$ 是實數，$m$ 是整數、$n$ 是正整數）", type: "props", rowH: 20,
      fields: [{ id: "exp", n: "指數寫法" }, { id: "log", n: "對應的對數寫法" }, { id: "pre", n: "成立前提與常見陷阱" }],
      rows: [
        {
          id: "1", n: "定義與特殊值",
          ans: {
            exp: "$a^0=1$；$a^{-r}=\\dfrac{1}{a^r}$；分數指數 $a^{\\frac{1}{n}}=\\sqrt[n]{a}$、$a^{\\frac{m}{n}}=\\sqrt[n]{a^m}$（$m$ 是整數、$n$ 是正整數）",
            log: "$a^x=N\\iff x=\\log_a N$（$x$ 是實數）；$\\log_a 1=0$、$\\log_a a=1$；恆等式 $a^{\\log_a N}=N$、$\\log_a a^r=r$",
            pre: "對數有意義的三大條件：底數 $a>0$ 且 $a\\ne1$、真數 $N>0$；分數指數必須底數 $a>0$ 才能隨意約分擴分"
          },
          reduce: [], reduceNote: "基準定義：$\\log_a N$ 的意思就是「$a$ 的幾次方會等於 $N$」",
          tools: ["number/exp/零與負指數", "number/exp/分數指數與根式互換", "number/log/對數定義", "number/log/常用恆等式"], kp: ["E-01", "E-04"],
          ex: [
            { id: "el1a", q: "求 $8^{-\\frac23}+\\log_2 8+3^{\\log_3 5}$", a: "$\\dfrac{33}{4}$", val: "33/4" },
            { id: "el1b", q: "$\\log_{(x-1)}(4-x)$ 有意義，求整數 $x$", a: "$x=3$", val: "3" }
          ]
        },
        {
          id: "2", n: "相乘與相除",
          ans: {
            exp: "同底相乘指數相加：$a^r\\cdot a^s=a^{r+s}$；同底相除指數相減：$\\dfrac{a^r}{a^s}=a^{r-s}$",
            log: "真數相乘＝對數相加：$\\log_a(MN)=\\log_a M+\\log_a N$；真數相除＝對數相減：$\\log_a\\dfrac{M}{N}=\\log_a M-\\log_a N$",
            pre: "最常寫錯：$\\log_a(M+N)\\ne\\log_a M+\\log_a N$，且 $\\dfrac{\\log_a M}{\\log_a N}\\ne\\log_a\\dfrac{M}{N}$（前者是換底後的 $\\log_N M$）；拆開時必須確保 $M>0$ 且 $N>0$"
          },
          reduce: ["1"], reduceNote: "令 $M=a^r$、$N=a^s$，由 $MN=a^{r+s}$ 取對數即得 $\\log_a(MN)=r+s=\\log_a M+\\log_a N$",
          tools: ["number/exp/指數律", "number/log/對數律"], kp: ["E-01", "E-04"],
          ex: [{ id: "el2", q: "求 $\\log_6 4+\\log_6 9$", a: "$2$", val: "2" }]
        },
        {
          id: "3", n: "次方與換底",
          ans: {
            exp: "次方的次方＝指數相乘：$(a^r)^s=a^{rs}$；積的次方：$(ab)^r=a^r b^r$（$b>0$）",
            log: "次方提到前面：$\\log_{a^s} M^r=\\dfrac{r}{s}\\log_a M$（$s\\ne0$）；換底公式：$\\log_a b=\\dfrac{\\log_c b}{\\log_c a}$（$b>0$；$b\\ne1$ 時倒數 $\\log_a b=\\dfrac{1}{\\log_b a}$，連鎖律 $\\log_a b\\cdot\\log_b c=\\log_a c$）",
            pre: "偶數次方開出來要加絕對值：若實數 $x$ 只知 $x\\ne0$，$\\log_a x^2=2\\log_a\\lvert x\\rvert$（不是 $2\\log_a x$）；不同底數的對數相加減或相乘時，先用換底公式換成同底"
          },
          reduce: ["1"], reduceNote: "設 $x=\\log_a b$（$b>0$），即 $a^x=b$，兩邊取以 $c$ 為底的對數得 $x\\log_c a=\\log_c b$（其中 $\\log_c a^x=x\\log_c a$ 是左欄 $(a^r)^s=a^{rs}$ 的對數寫法），移項即為換底公式",
          tools: ["number/log/換底公式", "number/log/常用恆等式"], kp: ["E-04"],
          ex: [
            { id: "el3a", q: "求 $\\log_2 3\\cdot\\log_3 4$", a: "$2$", val: "2" },
            { id: "el3b", q: "求 $\\log_4 8+\\log_9 27$", a: "$3$", val: "3" }
          ]
        }
      ]
    },
    {
      id: "fun", title: "背面　函數圖形、不等式與對數應用（底數 $a>0$ 且 $a\\ne1$，真數 $N>0$，$k$ 是整數）", type: "table", back: true, rowH: 20,
      fields: [{ id: "inc", n: "底數 $a>1$（遞增）" }, { id: "dec", n: "底數 $0 < a < 1$（遞減）" }, { id: "key", n: "對稱關係與關鍵應用" }],
      rows: [
        {
          id: "4", n: "指數函數 $y=a^x$",
          ans: {
            inc: "定義域全體實數，值域 $(0,\\infty)$（恆正）；恆過 $(0,1)$；向右嚴格遞增，左端以 $x$ 軸（$y=0$）為水平漸近線",
            dec: "定義域全體實數，值域 $(0,\\infty)$；恆過 $(0,1)$；向右嚴格遞減，右端以 $x$ 軸（$y=0$）為水平漸近線",
            key: "$y=a^x$ 與 $y=\\left(\\dfrac1a\\right)^x=a^{-x}$ 的圖形對稱於 $y$ 軸；解 $a^{f(x)} > a^{g(x)}$（$f(x)$、$g(x)$ 是 $x$ 的式子）：$a>1$ 時不等號同向，$0 < a < 1$ 時不等號反向"
          },
          reduce: ["1"], reduceNote: "把①的指數定義畫在坐標平面上；$a^0=1$ 對應恆過點 $(0,1)$，$a^x>0$ 對應圖形恆在 $x$ 軸上方",
          tools: ["function/explog/指數函數的圖形", "function/explog/指對不等式的方向"], kp: ["E-02", "E-03"],
          ex: [{ id: "el4", q: "解不等式 $\\left(\\dfrac12\\right)^{x-1} > \\dfrac18$", a: "$x < 4$", val: "4" }]
        },
        {
          id: "5", n: "對數函數 $y=\\log_a x$",
          ans: {
            inc: "定義域 $(0,\\infty)$，值域全體實數；恆過 $(1,0)$；向右嚴格遞增，以 $y$ 軸（$x=0$）為鉛直漸近線",
            dec: "定義域 $(0,\\infty)$，值域全體實數；恆過 $(1,0)$；向右嚴格遞減，以 $y$ 軸（$x=0$）為鉛直漸近線",
            key: "$y=\\log_a x$ 與 $y=a^x$ 互為反函數，圖形對稱於直線 $y=x$（定義域、值域、恆過點、漸近線全部把 $x,y$ 對調）；解 $\\log_a f(x) > \\log_a g(x)$ 除了看 $a$ 決定同向或反向，還必須先列真數 $>0$"
          },
          reduce: ["4", "1"], reduceNote: "把④的 $(x,y)$ 坐標互換（對直線 $y=x$ 鏡射）就得到對數函數的圖形與所有性質",
          tools: ["function/explog/對數函數的圖形", "function/fbasic/反函數", "function/explog/指對不等式的方向"], kp: ["E-05"],
          ex: [{ id: "el5", q: "解 $\\log_{\\frac12}(x-1) > -2$ 的整數解個數", a: "$3$ 個（$1 < x < 5$，整數 $2,3,4$）", val: "3" }]
        },
        {
          id: "6", n: "常用對數與成長模型",
          fields: [{ id: "inc", n: "科學記號與取常用對數" }, { id: "dec", n: "位數、小數位與首位數字" }, { id: "key", n: "成長／衰減模型" }],
          ans: {
            inc: "科學記號 $N=c\\times 10^k$（$1\\le c < 10$，$k$ 是整數）取常用對數：$\\log N=k+\\log c$（整數部分 $k=\\lfloor\\log N\\rfloor$，小數部分 $0\\le\\log c < 1$）",
            dec: "當 $k\\ge0$ 時，$N$ 的整數位數是 $k+1$ 位；當 $k < 0$ 時，$N$ 在小數點後第 $\\lvert k\\rvert$ 位始出現不為 $0$ 的數字；首位數字 $d$ 是 $1\\sim 9$ 的整數，由 $\\log c$ 落在 $\\log 1,\\log 2,\\dots,\\log 9,\\log 10$ 中哪兩個相鄰值之間決定（$\\log d\\le\\log c < \\log(d+1)$）",
            key: "成長／半衰期模型 $N(t)=N_0\\cdot r^t$（$t$ 是時間、$N_0$ 是初始量、$r$ 是每單位時間倍率）：兩邊取 $\\log$ 把未知指數 $t$ 搬下來解"
          },
          reduce: ["1", "2", "3"], reduceNote: "對 $N=c\\times 10^k$ 套②拆成 $\\log c+\\log 10^k=k+\\log c$，把「幾位數」換成看 $10$ 的次方 $k$",
          tools: ["number/log/位數判定", "number/log/首位數字", "number/log/小數位判定", "function/explog/指數成長／衰減模型"], kp: ["E-03", "E-06"],
          ex: [
            { id: "el6a", q: "$\\log 2\\approx 0.3010$，求 $2^{30}$ 是幾位數", a: "$10$ 位數", val: "10" },
            { id: "el6b", q: "同上，求 $2^{30}$ 的最高位數字", a: "$1$（$\\log 2^{30}\\approx 9.03 < 9+\\log 2$）", val: "1" }
          ]
        }
      ]
    }
  ],
  final: [
    {
      id: "mirror", q: "為什麼記住 $y=a^x$ 的圖形，就等於記住 $y=\\log_a x$ 的圖形？請寫出四組「把 $x$ 和 $y$ 對調」的對應。",
      ans: "因為 $y=\\log_a x\\iff x=a^y$，兩圖形對稱於直線 $y=x$：① 定義域 $\\mathbb{R}$ 變值域 $\\mathbb{R}$、值域 $(0,\\infty)$ 變定義域 $(0,\\infty)$；② 恆過點 $(0,1)$ 變 $(1,0)$；③ 水平漸近線 $y=0$ 變鉛直漸近線 $x=0$；④ 單調性：對調後不變（$a>1$ 都遞增、$0 < a < 1$ 都遞減），因為對直線 $y=x$ 鏡射不改變「向右上升」。",
      lines: 4
    },
    {
      id: "ineq", q: "解對數不等式 $\\log_a f(x) > \\log_a g(x)$（$f(x)$、$g(x)$ 是 $x$ 的式子）時，哪兩個步驟少做一個就會全錯？",
      ans: "第一步：先看底數 $a$ 是大於 $1$（同向 $f(x) > g(x)$）還是介於 $0$ 與 $1$ 之間（反向 $f(x) < g(x)$）；第二步：必須補上真數大於 $0$ 的限制（$f(x)>0$ 且 $g(x)>0$），再取交集。",
      lines: 3
    }
  ],
  pitfalls: [
    "自創假公式：把 $\\log_a(M+N)$ 拆成 $\\log_a M+\\log_a N$，或把 $\\dfrac{\\log_a M}{\\log_a N}$ 寫成 $\\log_a\\dfrac{M}{N}$（$\\dfrac{\\log_a M}{\\log_a N}$ 其實是換底公式的 $\\log_N M$，和 $\\log_a M-\\log_a N$ 無關）。",
    "解對數方程式或不等式忘了驗「真數 $>0$、底數 $>0$ 且 $\\ne1$」：算出的解常有一支會讓原式真數 $\\le0$ 而必須捨去。",
    "底數 $0 < a < 1$ 時解指數或對數不等式忘了變號。",
    "偶數次方直接搬到對數前面：$\\log_2 x^2=2\\log_2\\lvert x\\rvert$，若沒有限制 $x>0$，直接寫 $2\\log_2 x$ 會漏掉負數解。",
    "常用對數求小數點後第幾位始不為 $0$ 時算錯整數部分：$-4.398$ 要寫成 $-5+0.602$（小數部分必須 $\\ge0$），所以是小數點後第 $5$ 位，不是第 $4$ 位。"
  ]
});
