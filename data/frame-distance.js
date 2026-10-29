/* 架構重建卡 01：距離（學測範圍）。格式見 _scripts/frame_cards/FORMAT.md；數值例由 _scripts/frame_cards/verify_frames.py 驗算。 */
FRAME({
  id: "distance", stage: "hs", no: 1, n: "距離",
  scope: "學測（數A：高一、高二必修）；球面屬數學 B，不收",
  time: 15,
  intro: "高中學過的距離，其實只是「點、直線、平面」三種東西兩兩之間的距離。下面的表只填右上半（含對角線）的 6 格，左下半和右上半一樣。每一格寫四件事；想不出來就寫「?」，不要空著。",
  sections: [
    {
      id: "main", title: "點、直線、平面", type: "matrix", symmetric: true,
      rows: [{ id: "pt", n: "點" }, { id: "ln", n: "直線" }, { id: "pl", n: "平面" }],
      cols: [{ id: "pt", n: "點" }, { id: "ln", n: "直線" }, { id: "pl", n: "平面" }],
      fields: [{ id: "zero", n: "何時為 0" }, { id: "method", n: "方法" }, { id: "formula", n: "公式" }, { id: "pre", n: "前提" }],
      cells: [
        {
          id: "1", r: "pt", c: "pt", n: "點–點",
          fields: [{ id: "zero", n: "何時為 0" }, { id: "method", n: "方法" }, { id: "formula", n: "公式（平面、空間）" }, { id: "pre", n: "前提" }],
          ans: {
            zero: "兩點重合",
            method: "坐標相減、平方和開根號",
            formula: "兩點 $A(x_1,y_1)$、$B(x_2,y_2)$：$\\overline{AB}=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$；空間兩點 $A(x_1,y_1,z_1)$、$B(x_2,y_2,z_2)$ 多一項 $(z_2-z_1)^2$",
            pre: "無。順帶：$(x,y,z)$ 到 $xy$ 平面是 $\\lvert z\\rvert$、到 $z$ 軸是 $\\sqrt{x^2+y^2}$"
          },
          reduce: [],
          tools: ["geometry/line/距離與中點", "geometry/space/空間坐標與距離"], kp: ["G-01", "G-06"],
          ex: [
            { id: "d1a", q: "$A(1,2,3)$、$B(4,6,15)$", a: "$13$", val: "13" },
            { id: "d1b", q: "$(3,4,-12)$ 到 $z$ 軸", a: "$5$", val: "5" }
          ]
        },
        {
          id: "2", r: "pt", c: "ln", n: "點–直線",
          fields: [{ id: "zero", n: "何時為 0" }, { id: "method", n: "方法" }, { id: "formula", n: "公式（平面、空間）" }, { id: "pre", n: "前提" }],
          ans: {
            zero: "點在直線上",
            method: "從點作垂線，量垂線段（空間可先求垂足）",
            formula: "平面：點 $(x_0,y_0)$ 到直線 $ax+by+c=0$ 的距離 $d=\\dfrac{\\lvert ax_0+by_0+c\\rvert}{\\sqrt{a^2+b^2}}$。空間：點 $P$ 到直線 $L$，$A$ 是 $L$ 上任一點、$\\vec v$ 是 $L$ 的方向向量，$d=\\dfrac{\\lvert\\overrightarrow{AP}\\times\\vec v\\rvert}{\\lvert\\vec v\\rvert}$；或由 $(\\overrightarrow{AP}-t\\vec v)\\cdot\\vec v=0$ 解出 $t$，垂足是 $A$ 沿 $\\vec v$ 走 $t$ 倍的點",
            pre: "平面公式要先化成一般式、右邊等於 $0$；空間直線沒有一般式，不能把平面公式加一項 $z$"
          },
          reduce: [],
          tools: ["geometry/line/點到直線的距離", "vector/plane/空間中點到直線的距離"], kp: ["G-01", "G-08"],
          ex: [
            { id: "d2a", q: "$(1,2)$ 到 $3x+4y-1=0$", a: "$2$", val: "2" },
            { id: "d2b", q: "$(3,1,4)$ 到過 $(1,0,0)$、方向 $(1,2,2)$ 的直線", a: "$\\sqrt5$", val: "sqrt(5)" }
          ]
        },
        {
          id: "3", r: "pt", c: "pl", n: "點–平面",
          ans: {
            zero: "點在平面上",
            method: "沿法向量作垂線；或體積法 $d=\\dfrac{3V}{S}$：在平面上取三點圍成三角形當底面，$S$ 是這個底面三角形的面積，$V$ 是以該點為頂點、這個三角形為底的四面體體積",
            formula: "點 $(x_0,y_0,z_0)$ 到平面 $ax+by+cz+d_0=0$ 的距離 $d=\\dfrac{\\lvert ax_0+by_0+cz_0+d_0\\rvert}{\\sqrt{a^2+b^2+c^2}}$",
            pre: "平面化成一般式、右邊等於 $0$。和平面上的點到直線公式同一個樣子"
          },
          reduce: [],
          tools: ["vector/plane/點到平面的距離"], kp: ["G-08"],
          ex: [{ id: "d3", q: "$(1,2,3)$ 到 $2x-y+2z+3=0$", a: "$3$", val: "3" }]
        },
        {
          id: "4", r: "ln", c: "ln", n: "直線–直線",
          fields: [{ id: "zero", n: "位置關係有幾種" }, { id: "method", n: "每一種怎麼算" }, { id: "formula", n: "公式" }, { id: "pre", n: "前提" }],
          ans: {
            zero: "平面上 2 種、空間 3 種（重合不算）：相交（距離 $0$）、平行、歪斜（只在空間）",
            method: "平行：一條線上取一點，算到另一條（降成②）。歪斜：公垂線段長",
            formula: "平面上兩平行線 $ax+by+c_1=0$、$ax+by+c_2=0$ 的距離 $\\dfrac{\\lvert c_1-c_2\\rvert}{\\sqrt{a^2+b^2}}$。歪斜線 $L_1$、$L_2$：$A$ 在 $L_1$ 上、$B$ 在 $L_2$ 上，$\\vec v_1$、$\\vec v_2$ 分別是 $L_1$、$L_2$ 的方向向量，距離 $d=\\dfrac{\\lvert\\overrightarrow{AB}\\cdot(\\vec v_1\\times\\vec v_2)\\rvert}{\\lvert\\vec v_1\\times\\vec v_2\\rvert}$",
            pre: "平行線的 $x$、$y$ 係數先化成一樣；歪斜公式在平行時分母為 $0$，要改用取點法"
          },
          reduce: ["2", "3"],
          reduceNote: "平行：取一點 → ②。歪斜：過 $L_1$ 作平行於 $L_2$ 的平面（法向量 $\\vec v_1\\times\\vec v_2$），再算 $L_2$ 上一點到它 → ③",
          tools: ["geometry/line/點到直線的距離", "vector/plane/兩歪斜線的距離", "geometry/space/兩直線的位置關係"], kp: ["G-01", "G-08"],
          ex: [
            { id: "d4a", q: "$3x+4y-1=0$ 與 $6x+8y+18=0$", a: "$2$", val: "2" },
            { id: "d4b", q: "過原點方向 $(1,1,0)$，與過 $(1,0,3)$ 方向 $(0,1,1)$ 的直線", a: "$\\dfrac{4\\sqrt3}{3}$", val: "4*sqrt(3)/3" }
          ]
        },
        {
          id: "5", r: "ln", c: "pl", n: "直線–平面",
          fields: [{ id: "zero", n: "位置關係有幾種" }, { id: "method", n: "怎麼算" }, { id: "pre", n: "前提" }],
          ans: {
            zero: "3 種：直線在平面上、交於一點（距離都是 $0$）、平行",
            method: "平行時：直線上任取一點，算到平面的距離（降成③）",
            pre: "$\\vec v$ 是直線的方向向量、$\\vec n$ 是平面的法向量。先確認平行：$\\vec v\\cdot\\vec n=0$ 且線上的點不在平面上。只看內積為 $0$ 分不出「平行」和「在平面上」"
          },
          reduce: ["3"],
          tools: ["geometry/space/直線與平面的位置關係", "vector/plane/點到平面的距離"], kp: ["G-06", "G-08"],
          ex: [{ id: "d5", q: "過 $(1,0,1)$ 方向 $(1,0,-1)$ 的直線，與 $x+y+z=5$", a: "$\\sqrt3$", val: "sqrt(3)" }]
        },
        {
          id: "6", r: "pl", c: "pl", n: "平面–平面",
          fields: [{ id: "zero", n: "位置關係有幾種" }, { id: "method", n: "怎麼算" }, { id: "formula", n: "公式" }, { id: "pre", n: "前提" }],
          ans: {
            zero: "2 種（重合不算）：相交（距離 $0$）、平行",
            method: "平行時：一個平面上取一點，算到另一個平面（降成③）",
            formula: "兩平行平面 $ax+by+cz+d_1=0$、$ax+by+cz+d_2=0$ 的距離 $\\dfrac{\\lvert d_1-d_2\\rvert}{\\sqrt{a^2+b^2+c^2}}$",
            pre: "兩式的 $x$、$y$、$z$ 係數先化成一樣，才能把常數相減"
          },
          reduce: ["3"],
          tools: ["vector/plane/點到平面的距離"], kp: ["G-08"],
          ex: [{ id: "d6", q: "$x+2y+2z-1=0$ 與 $2x+4y+4z+16=0$", a: "$3$", val: "3" }]
        }
      ]
    },
    {
      id: "circle", title: "延伸：圓（只在坐標平面上，圓心 $O$、半徑 $r$）", type: "table", back: true,
      fields: [{ id: "how", n: "最短距離（必要時寫最遠）" }],
      rows: [
        {
          id: "7", n: "點–圓",
          ans: { how: "點 $P$ 到圓（圓心 $O$、半徑 $r$）：最短 $\\lvert\\overline{PO}-r\\rvert$，最遠 $\\overline{PO}+r$" },
          reduce: ["1"], reduceNote: "先換成圓心，用①，再 $\\pm r$",
          tools: ["geometry/circle/圓與直線的關係"], kp: ["G-02"],
          ex: [{ id: "d7", q: "$(7,0)$ 到 $x^2+y^2=9$ 的最短距離", a: "$4$", val: "4" }]
        },
        {
          id: "8", n: "直線–圓",
          ans: { how: "先求弦心距 $d$（圓心 $O$ 到直線的距離），$r$ 是半徑。$d>r$：最短 $d-r$；$d\\le r$：最短 $0$，弦長 $2\\sqrt{r^2-d^2}$" },
          reduce: ["2"], reduceNote: "弦心距就是②",
          tools: ["geometry/circle/圓與直線的關係", "geometry/line/點到直線的距離"], kp: ["G-02"],
          ex: [{ id: "d8", q: "$3x+4y=25$ 與 $x^2+y^2=9$ 的最短距離", a: "$2$", val: "2" }]
        },
        {
          id: "9", n: "圓–圓",
          ans: { how: "兩圓半徑 $r_1$、$r_2$，先求兩圓心的距離 $d$。外離：$d-r_1-r_2$；內含：$\\lvert r_1-r_2\\rvert-d$；其餘（相交、相切）：$0$" },
          reduce: ["1"], reduceNote: "圓心距就是①",
          tools: ["geometry/circle/兩圓的位置關係"], kp: ["G-02"],
          ex: [
            { id: "d9a", q: "圓心 $(0,0)$、$r=3$ 與圓心 $(10,0)$、$r=2$", a: "$5$", val: "5" },
            { id: "d9b", q: "大圓 $r=5$、小圓 $r=1$、圓心距 $2$", a: "$2$", val: "2" }
          ]
        }
      ]
    }
  ],
  final: [
    {
      id: "map", q: "上面 9 格裡，哪些格子其實可以換成另一格來算？用箭頭畫出來（例如 ⑥ → ③）。畫完後，最少只要會幾個基本公式，就能算全部的距離？",
      ans: "⑥ 平行平面 → ③；⑤ 線面平行 → ③；④ 歪斜線 → ③（過一線作平行平面）；④ 平行線 → ②；⑧ 直線與圓 → ②；⑦ 點與圓、⑨ 兩圓 → ①（再 $\\pm r$）。最少 3 個：① 兩點、② 點到直線、③ 點到平面（把歪斜線另算是 4 個，也對），重點是箭頭要畫對。",
      lines: 7
    },
    {
      id: "zero", q: "把每一格「何時為 0」那一欄連起來看，它其實是哪一張表？",
      ans: "位置關係表（相交、平行、歪斜、在上面）。所以距離卡做完，接著做位置關係卡。",
      lines: 2
    }
  ],
  pitfalls: [
    "② 空間的點到直線直接用 $\\frac{\\lvert ax_0+by_0+cz_0+d_0\\rvert}{\\sqrt{a^2+b^2+c^2}}$：那是點到平面 $ax+by+cz+d_0=0$ 的公式，空間直線沒有這種一般式。",
    "④ 平行線、⑥ 平行平面：沒把係數化成一樣，就把常數相減。",
    "④ 用歪斜公式算平行線：分母是 $0$。",
    "⑤ 只用「方向向量垂直法向量」判斷平行，漏了「直線可能就在平面上」。",
    "⑦～⑨ 忘了點在圓內、兩圓內含時，最短距離不是「圓心距減半徑和」。",
    "箭頭圖空白：每一格都會算，卻看不出它們是同一件事。這張卡最想抓的就是這種情形。"
  ]
});
