/* 架構重建卡 13：數據的線性變換（學測範圍，高一下一維與二維數據分析）。格式見 _scripts/frame_cards/FORMAT.md；數值例由 _scripts/frame_cards/verify_frame_batch2.py 驗算。 */
FRAME({
  id: "stat", stage: "hs", no: 13, n: "數據的線性變換",
  scope: "學測（數A：高一下數據分析）",
  time: 15,
  intro: "把全班成績乘以 $a$ 倍再加 $b$ 分（線性變換 $y_i=ax_i+b$，$a\\ne0$），各種統計量怎麼變？核心原則只有兩句話：「代表位置的量（平均數、中位數、眾數、百分位數）跟著乘 $a$ 加 $b$（$a < 0$ 時百分位數的順序會顛倒：新的 $Q_1$ 是 $aQ_3+b$）；代表分散差距的量（全距、四分位距、標準差）平移 $b$ 不影響，只乘以 $\\lvert a\\rvert$ 倍」。請填寫下表並完成背面的二維數據對照。想不出來就寫「?」。",
  sections: [
    {
      id: "1d", title: "一維數據統計量與線性變換 $y_i=ax_i+b$（$n$ 是筆數、$x_i$ 是原數據、$y_i$ 是變換後數據、$a,b$ 是常數且 $a\\ne0$；$\\mu_X,\\mu_Y$ 是平均數、$\\sigma_X,\\sigma_Y$ 是母體標準差、$Q_1,Q_3$ 是第 $1$、第 $3$ 四分位數、$z_i$ 是標準化數據、$Z$ 是標準化後的變數）", type: "props", rowH: 24,
      fields: [{ id: "def", n: "定義與算式" }, { id: "shift", n: "平移 $+b$ 與伸縮 $\\times a$ 後變成什麼" }, { id: "feat", n: "幾何意義與何時用" }],
      rows: [
        {
          id: "1", n: "集中量數（算術平均數 $\\mu_X$、中位數、眾數）",
          ans: {
            def: "算術平均數 $\\mu_X=\\dfrac{1}{n}\\sum_{i=1}^n x_i$；中位數是數據由小到大排正中間的數（偶數筆取中間兩筆平均）；眾數是出現最多次的數",
            shift: "位置跟著一起搬：$\\mu_Y=a\\mu_X+b$；中位數與眾數也都變成原來的 $a$ 倍加 $b$",
            feat: "$\\mu_X$ 是數據的重心（離均差總和 $\\sum(x_i-\\mu_X)=0$，且在所有實數 $c$ 中，$c=\\mu_X$ 使 $\\sum(x_i-c)^2$ 最小）；但極端值（離群值）會大幅拉偏平均數，此時改用中位數代表典型水準"
          },
          reduce: [], reduceNote: "基準列：對 $\\sum(ax_i+b)$ 提出 $a$ 再加上 $nb$，同除以 $n$ 直接得到 $\\mu_Y=a\\mu_X+b$",
          tools: ["prob/stat/集中量數", "prob/stat/線性變換的影響", "prob/stat/百分位數與四分位數"], kp: ["D-12"],
          ex: [
            { id: "st1a", q: "數據 $2,4,6,8,10$ 的平均數 $\\mu_X$", a: "$6$", val: "6" },
            { id: "st1b", q: "若 $\\mu_X=60$，線性調整 $y_i=1.2x_i+10$ 後的新平均數 $\\mu_Y$", a: "$82$", val: "82" }
          ]
        },
        {
          id: "2", n: "全距與四分位距（$Q_3-Q_1$）",
          ans: {
            def: "全距＝最大值減最小值；四分位距 $=Q_3-Q_1$（中間 $50\\%$ 數據的跨度）",
            shift: "兩數相減時 $+b$ 互相抵消，且差距必為非負：新全距 $=\\lvert a\\rvert\\times$ 原全距；新四分位距 $=\\lvert a\\rvert(Q_3-Q_1)$（注意 $a < 0$ 時大小順序顛倒：新最大值是 $ax_{\\min}+b$，新 $Q_1$ 是 $aQ_3+b$，所以相減後仍為正）",
            feat: "四分位距不受頭尾極端值影響，常搭配中位數畫盒狀圖"
          },
          reduce: ["1"], reduceNote: "因為最大值與最小值都照①變成 $a x_{\\max}+b$ 與 $a x_{\\min}+b$，相減取絕對值就把 $+b$ 消掉了",
          tools: ["prob/stat/百分位數與四分位數", "prob/stat/線性變換的影響"], kp: ["D-12"],
          ex: [{ id: "st2", q: "原數據四分位距為 $15$，經 $y_i=-2x_i+100$ 變換後的新四分位距", a: "$30$", val: "30" }]
        },
        {
          id: "3", n: "標準差 $\\sigma_X$ 與變異數 $\\sigma_X^2$",
          ans: {
            def: "$\\sigma_X=\\sqrt{\\dfrac{1}{n}\\sum_{i=1}^n(x_i-\\mu_X)^2}=\\sqrt{\\left(\\dfrac{1}{n}\\sum_{i=1}^n x_i^2\\right)-\\mu_X^2}$（平方的平均減去平均的平方，再開根號）",
            shift: "離均差 $y_i-\\mu_Y=a(x_i-\\mu_X)$，平移 $+b$ 完全抵消：新標準差 $\\sigma_Y=\\lvert a\\rvert\\sigma_X$；新變異數 $\\sigma_Y^2=a^2\\sigma_X^2$",
            feat: "衡量數據離平均數有多分散；全部數據同加一個常數 $b$ 時，分散程度不變；展開式 $\\dfrac{1}{n}\\sum x_i^2-\\mu_X^2$ 在已知平方和求標準差（或反求平方和）時最快"
          },
          reduce: ["1"], reduceNote: "由①得 $y_i-\\mu_Y=(ax_i+b)-(a\\mu_X+b)=a(x_i-\\mu_X)$，平方平均再開根號即提出 $\\sqrt{a^2}=\\lvert a\\rvert$",
          tools: ["prob/stat/標準差", "prob/stat/線性變換的影響"], kp: ["D-12"],
          ex: [
            { id: "st3a", q: "數據 $2,4,6,8,10$ 的母體標準差 $\\sigma_X$", a: "$2\\sqrt2$", val: "2*sqrt(2)" },
            { id: "st3b", q: "若 $\\sigma_X=5$，經 $y_i=-3x_i+20$ 變換後的新標準差 $\\sigma_Y$", a: "$15$", val: "15" }
          ]
        },
        {
          id: "4", n: "標準化數據（$z$ 分數）",
          ans: {
            def: "當 $\\sigma_X>0$ 時，$z_i=\\dfrac{x_i-\\mu_X}{\\sigma_X}$（它本身就是一個線性變換：乘 $\\dfrac{1}{\\sigma_X}$ 再加 $-\\dfrac{\\mu_X}{\\sigma_X}$）",
            shift: "不論原數據為何，標準化後的數據永遠滿足：平均數 $\\mu_Z=0$、標準差 $\\sigma_Z=1$；若先對 $x_i$ 做線性變換 $y_i=ax_i+b$ 再標準化，當 $a>0$ 時 $y_i$ 的標準化數據和 $x_i$ 的完全相同，當 $a < 0$ 時變成 $-z_i$",
            feat: "把不同科目的單位與底分消掉，用來比較「某生在國文與數學哪一科在班上的相對表現較好」（看誰的 $z$ 分數高）"
          },
          reduce: ["1", "3"], reduceNote: "先減 $\\mu_X$ 把平均數移到 $0$（①），再除以 $\\sigma_X$ 把標準差縮成 $1$（③）",
          tools: ["prob/stat/標準化（z 分數）"], kp: ["D-12"],
          ex: [{ id: "st4", q: "某生考 $78$ 分，班平均 $66$ 分、標準差 $8$ 分，求其標準化數據 $z$", a: "$\\dfrac32$", val: "3/2" }]
        }
      ]
    },
    {
      id: "2d", title: "背面　二維數據：相關係數與最適直線（$x_i,y_i$ 是原數據、$u_i,v_i$ 是變換後數據、$\\mu_X,\\mu_Y$ 是平均數、$\\sigma_X,\\sigma_Y,\\sigma_U,\\sigma_V$ 是標準差、$z_{x,i},z_{y,i}$ 是標準化數據、$r$ 是相關係數、$m$ 是迴歸斜率、$a,b,c,d$ 是常數，$ac\\ne0$）", type: "table", back: true, rowH: 24,
      fields: [{ id: "def", n: "公式與範圍" }, { id: "shift", n: "對 $x_i,y_i$ 做線性變換 $u_i=ax_i+b$、$v_i=cy_i+d$ 後怎麼變" }, { id: "feat", n: "關鍵性質與常見陷阱" }],
      rows: [
        {
          id: "5", n: "相關係數 $r$",
          ans: {
            def: "$r=\\dfrac{\\sum(x_i-\\mu_X)(y_i-\\mu_Y)}{n\\sigma_X\\sigma_Y}=\\dfrac{1}{n}\\sum z_{x,i}z_{y,i}$（$z_{x,i}$、$z_{y,i}$ 分別是 $x_i$、$y_i$ 的標準化數據，兩者乘積的平均）；恆滿足 $-1\\le r\\le 1$",
            shift: "平移 $+b,+d$ 與放大縮小倍率都不改變相關強弱，只看 $a$ 與 $c$ 同號或異號：當 $ac>0$ 時新相關係數 $=r$；當 $ac < 0$ 時新相關係數 $=-r$",
            feat: "$\\lvert r\\rvert=1$ 代表所有點完全落在同一條非水平非鉛直的直線上（斜率 $> 0$ 則 $r=1$，斜率 $< 0$ 則 $r=-1$）；若所有點排在水平線上（$\\sigma_Y=0$）或鉛直線上（$\\sigma_X=0$），分母為 $0$，相關係數無定義"
          },
          reduce: ["4", "3"], reduceNote: "由④，$u_i$ 的標準化數據是 $\\pm z_{x,i}$（$a>0$ 取 $+$、$a < 0$ 取 $-$），$v_i$ 的同理看 $c$；相乘後只差一個正負號，由 $ac$ 的正負決定",
          tools: ["prob/stat/相關係數", "prob/stat/散布圖與離群值"], kp: ["D-13"],
          ex: [
            { id: "st5a", q: "$X,Y$ 的相關係數 $r=0.8$，求 $U=2X-5$ 與 $V=-3Y+1$ 的相關係數", a: "$-0.8$", val: "-4/5" },
            { id: "st5b", q: "三點 $(1,3)$、$(2,5)$、$(4,9)$ 的相關係數 $r$", a: "$1$（三點共線且斜率 $2>0$）", val: "1" }
          ]
        },
        {
          id: "6", n: "最適直線（最小平方法迴歸直線）",
          ans: {
            def: "$Y$ 對 $X$ 的最適直線必過重心 $(\\mu_X,\\mu_Y)$，方程式為 $y-\\mu_Y=m(x-\\mu_X)$，其中斜率 $m=r\\dfrac{\\sigma_Y}{\\sigma_X}=\\dfrac{\\sum(x_i-\\mu_X)(y_i-\\mu_Y)}{\\sum(x_i-\\mu_X)^2}$",
            shift: "新的最適直線（$V$ 對 $U$）可直接把原直線裡的 $x,y$ 代換成 $\\dfrac{u-b}{a}$ 與 $\\dfrac{v-d}{c}$；新斜率 $=\\dfrac{c}{a}m$（只變 $x$ 時是 $\\dfrac{m}{a}$、只變 $y$ 時是 $cm$；因為 $\\sigma_V=\\lvert c\\rvert\\sigma_Y$、$\\sigma_U=\\lvert a\\rvert\\sigma_X$，配⑤的正負號恰好消掉絕對值）",
            feat: "斜率 $m$ 與相關係數 $r$ 必同號（因 $\\sigma_X,\\sigma_Y>0$）；注意「$Y$ 對 $X$ 的迴歸直線」與「$X$ 對 $Y$ 的迴歸直線」在 $\\lvert r\\rvert\\ne1$ 時是兩條不同的直線，但一定交於重心 $(\\mu_X,\\mu_Y)$"
          },
          reduce: ["1", "3", "5"], reduceNote: "把數據標準化後最適直線是 $z_y=r z_x$，將④的 $z_y=\\dfrac{y-\\mu_Y}{\\sigma_Y}$、$z_x=\\dfrac{x-\\mu_X}{\\sigma_X}$ 代回即得 $y-\\mu_Y=r\\dfrac{\\sigma_Y}{\\sigma_X}(x-\\mu_X)$",
          tools: ["prob/stat/最適直線"], kp: ["D-13"],
          ex: [
            { id: "st6a", q: "$\\mu_X=4$、$\\mu_Y=10$、$\\sigma_X=2$、$\\sigma_Y=5$、$r=0.6$，求 $Y$ 對 $X$ 的最適直線在 $x=8$ 的預測值", a: "$16$", val: "16" }
          ]
        }
      ]
    }
  ],
  final: [
    {
      id: "summary", q: "整理線性變換 $y_i=ax_i+b$（$a\\ne0$）：哪些量「乘 $a$ 加 $b$」？哪些量「只乘 $\\lvert a\\rvert$」？哪些量「只乘 $a^2$」？哪些量「大小完全不變（只看正負號）」？",
      ans: "① 乘 $a$ 加 $b$：平均數、中位數、眾數；各百分位數與四分位數也是，但 $a < 0$ 時位置顛倒（新 $Q_1=aQ_3+b$、新 $Q_3=aQ_1+b$）；② 只乘 $\\lvert a\\rvert$：全距、四分位距、標準差；③ 只乘 $a^2$：變異數；④ 大小不變、只看正負號：標準化數據 $z_i$（$a < 0$ 變號）與相關係數 $r$（$ac < 0$ 變號）。",
      lines: 4
    },
    {
      id: "reg_r", q: "某班數學與物理成績的最適直線斜率是 $m=1.6$，能不能說兩科的相關係數 $r=1.6$？斜率 $m$ 和相關係數 $r$ 差在哪裡？",
      ans: "絕對不行，因為相關係數恆滿足 $-1\\le r\\le 1$！斜率 $m=r\\dfrac{\\sigma_Y}{\\sigma_X}$ 還乘上了兩科標準差的比值 $\\dfrac{\\sigma_Y}{\\sigma_X}$（有單位比例），只能確定 $m$ 和 $r$ 的正負號相同（$m=1.6>0$ 代表正相關 $r>0$，且由 $\\lvert r\\rvert\\le1$ 可知 $\\dfrac{\\sigma_Y}{\\sigma_X}\\ge1.6$），要知道 $\\sigma_X,\\sigma_Y$ 才能算出 $r$。",
      lines: 3
    }
  ],
  pitfalls: [
    "當 $a < 0$ 時，標準差寫成 $a\\sigma_X$（忘了加絕對值 $\\lvert a\\rvert$，標準差永遠 $\\ge0$）。",
    "以為把數據同加 $10$ 分，標準差也會加 $10$：平移不改變分散程度，標準差不變。",
    "變異數 $\\sigma_Y^2$ 只乘了 $\\lvert a\\rvert$ 而忘了平方成 $a^2\\sigma_X^2$。",
    "以為相關係數 $r$ 越大，最適直線就越陡：$r$ 衡量的是點貼近直線的集中程度，哪怕所有點共線在 $y=0.01x$ 上很平緩，$r$ 依然是 $1$。",
    "預測值代最適直線時忘了直線必過重心 $(\\mu_X,\\mu_Y)$：若題目給 $y=mx+k$ 與 $\\mu_X$，直接代 $\\mu_Y=m\\mu_X+k$ 就能求出 $\\mu_Y$。"
  ]
});
