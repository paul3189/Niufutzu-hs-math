/* 架構重建卡 02：位置關係（學測範圍）。格式見 _scripts/frame_cards/FORMAT.md；數值例由 _scripts/frame_cards/verify_frames.py 驗算。 */
FRAME({
  id: "position", stage: "hs", no: 2, n: "位置關係",
  scope: "學測（數A：高一、高二必修）；球面屬數學 B，不收",
  time: 15,
  intro: "判斷位置關係，永遠是「拿一個量和另一個量比」。每張表的列名先遮住了，請自己寫出共有哪幾種，再填每一種的判斷條件。想不出來就寫「?」。",
  sections: [
    {
      id: "lc", col: 1, title: "A　直線與圓（$d$ 是圓心到直線的距離，$r$ 是半徑）", type: "table", hideNames: true,
      fields: [{ id: "cond", n: "用 $d$ 與 $r$ 判斷" }, { id: "disc", n: "聯立後的判別式 $D$" }, { id: "pts", n: "交點數" }],
      rows: [
        { id: "A1", n: "相離", ans: { cond: "$d>r$", disc: "$D<0$", pts: "$0$" }, tools: ["geometry/circle/圓與直線的關係"], kp: ["G-02"],
          ex: [{ id: "pA1", q: "$x^2+y^2=25$ 與 $3x+4y=30$ 的交點數", a: "$0$", val: "0" }] },
        { id: "A2", n: "相切", ans: { cond: "$d=r$", disc: "$D=0$", pts: "$1$" }, tools: ["geometry/circle/圓與直線的關係"], kp: ["G-02"],
          ex: [{ id: "pA2", q: "$x^2+y^2=25$ 與 $3x+4y=25$ 的交點數", a: "$1$", val: "1" }] },
        { id: "A3", n: "相交（割線）", ans: { cond: "$d<r$，弦長 $2\\sqrt{r^2-d^2}$", disc: "$D>0$", pts: "$2$" }, tools: ["geometry/circle/圓與直線的關係"], kp: ["G-02"],
          ex: [{ id: "pA3", q: "$x^2+y^2=25$ 與 $3x+4y=0$ 的弦長", a: "$10$", val: "10" }] }
      ]
    },
    {
      id: "cc", col: 1, title: "B　兩圓（$d$ 是兩圓心的距離，$r_1$、$r_2$ 是兩圓半徑，$r_1\\ge r_2$）", type: "table", hideNames: true,
      fields: [{ id: "cond", n: "條件" }, { id: "pts", n: "交點數" }, { id: "tan", n: "公切線條數" }],
      rows: [
        { id: "B1", n: "外離", ans: { cond: "$d>r_1+r_2$", pts: "$0$", tan: "$4$" }, tools: ["geometry/circle/兩圓的位置關係"], kp: ["G-02"],
          ex: [{ id: "pB1", q: "圓心距 $8$、半徑 $5$ 與 $2$ 的交點數", a: "$0$", val: "0" }] },
        { id: "B2", n: "外切", ans: { cond: "$d=r_1+r_2$", pts: "$1$", tan: "$3$" }, tools: ["geometry/circle/兩圓的位置關係"], kp: ["G-02"],
          ex: [{ id: "pB2", q: "圓心距 $7$、半徑 $5$ 與 $2$ 的交點數", a: "$1$", val: "1" }] },
        { id: "B3", n: "相交", ans: { cond: "$r_1-r_2<d<r_1+r_2$", pts: "$2$", tan: "$2$" }, tools: ["geometry/circle/兩圓的位置關係"], kp: ["G-02"],
          ex: [{ id: "pB3", q: "圓心距 $4$、半徑 $5$ 與 $2$ 的交點數", a: "$2$", val: "2" }] },
        { id: "B4", n: "內切", ans: { cond: "$d=r_1-r_2>0$", pts: "$1$", tan: "$1$" }, tools: ["geometry/circle/兩圓的位置關係"], kp: ["G-02"],
          ex: [{ id: "pB4", q: "圓心距 $3$、半徑 $5$ 與 $2$ 的交點數", a: "$1$", val: "1" }] },
        { id: "B5", n: "內含（含同心）", ans: { cond: "$d<r_1-r_2$", pts: "$0$", tan: "$0$" }, tools: ["geometry/circle/兩圓的位置關係"], kp: ["G-02"],
          ex: [{ id: "pB5", q: "圓心距 $1$、半徑 $5$ 與 $2$ 的交點數", a: "$0$", val: "0" }] }
      ]
    },
    {
      id: "ll", col: 2, title: "C　空間中兩直線（$\\vec v_1$、$\\vec v_2$ 是兩直線的方向向量，$A$、$B$ 分別是兩直線上的一點）", type: "table", hideNames: true,
      fields: [{ id: "cond", n: "判斷條件" }, { id: "plane", n: "共平面嗎" }, { id: "pts", n: "交點數" }],
      rows: [
        { id: "C1", n: "重合", ans: { cond: "$\\vec v_1\\parallel\\vec v_2$ 且 $\\overrightarrow{AB}\\parallel\\vec v_1$", plane: "是", pts: "無限多" }, tools: ["geometry/space/兩直線的位置關係"], kp: ["G-06"],
          ex: [{ id: "pC1", q: "$(t,t,0)$ 與 $(2-s,2-s,0)$", a: "重合", val: "coincide" }] },
        { id: "C2", n: "平行", ans: { cond: "$\\vec v_1\\parallel\\vec v_2$，但 $\\overrightarrow{AB}\\not\\parallel\\vec v_1$", plane: "是", pts: "$0$" }, tools: ["geometry/space/兩直線的位置關係"], kp: ["G-06"],
          ex: [{ id: "pC2", q: "$(t,t,0)$ 與 $(2s,1+2s,0)$", a: "平行", val: "parallel" }] },
        { id: "C3", n: "相交", ans: { cond: "$\\vec v_1\\not\\parallel\\vec v_2$ 且 $\\overrightarrow{AB}\\cdot(\\vec v_1\\times\\vec v_2)=0$", plane: "是", pts: "$1$" }, tools: ["geometry/space/兩直線的位置關係", "vector/cross/空間中兩向量的夾角"], kp: ["G-06", "G-07"],
          ex: [{ id: "pC3", q: "$(t,t,0)$ 與 $(1,1,5+s)$", a: "相交於 $(1,1,0)$", val: "intersect" }] },
        { id: "C4", n: "歪斜", ans: { cond: "$\\overrightarrow{AB}\\cdot(\\vec v_1\\times\\vec v_2)\\ne0$", plane: "否（只在空間才有）", pts: "$0$" }, tools: ["geometry/space/兩直線的位置關係", "vector/plane/兩歪斜線的距離"], kp: ["G-06", "G-08"],
          ex: [{ id: "pC4", q: "$(t,t,0)$ 與 $(1,s,3+s)$", a: "歪斜", val: "skew" }] }
      ]
    },
    {
      id: "lp", col: 2, title: "D　直線與平面（$\\vec v$ 是直線的方向向量，$\\vec n$ 是平面的法向量）", type: "table", hideNames: true,
      fields: [{ id: "cond", n: "判斷條件" }, { id: "pts", n: "交點數" }],
      rows: [
        { id: "D1", n: "直線在平面上", ans: { cond: "$\\vec v\\cdot\\vec n=0$，且線上一點在平面上", pts: "無限多" }, tools: ["geometry/space/直線與平面的位置關係"], kp: ["G-06"],
          ex: [{ id: "pD1", q: "$(5+t,-t,0)$ 與 $x+y+z=5$", a: "在平面上", val: "inplane" }] },
        { id: "D2", n: "平行", ans: { cond: "$\\vec v\\cdot\\vec n=0$，但線上的點不在平面上", pts: "$0$" }, tools: ["geometry/space/直線與平面的位置關係"], kp: ["G-06"],
          ex: [{ id: "pD2", q: "$(1+t,0,1-t)$ 與 $x+y+z=5$", a: "平行", val: "parallel" }] },
        { id: "D3", n: "交於一點", ans: { cond: "$\\vec v\\cdot\\vec n\\ne0$（$\\vec v\\parallel\\vec n$ 時垂直）", pts: "$1$" }, tools: ["geometry/space/直線與平面的位置關係"], kp: ["G-06", "G-08"],
          ex: [{ id: "pD3", q: "$(t,t,t)$ 與 $x+y+z=5$ 的交點", a: "$\\left(\\frac53,\\frac53,\\frac53\\right)$", val: "(5/3,5/3,5/3)" }] }
      ]
    },
    {
      id: "pp", col: 2, title: "E　兩平面（$\\vec n_1$、$\\vec n_2$ 是兩平面的法向量）", type: "table", hideNames: true,
      fields: [{ id: "cond", n: "判斷條件" }, { id: "pts", n: "交集" }],
      rows: [
        { id: "E1", n: "重合", ans: { cond: "兩式（含常數項）成比例", pts: "整個平面" }, tools: ["vector/plane/三平面的相交關係"], kp: ["G-08"],
          ex: [{ id: "pE1", q: "$x+2y+2z=1$ 與 $2x+4y+4z=2$", a: "重合", val: "coincide" }] },
        { id: "E2", n: "平行", ans: { cond: "$\\vec n_1\\parallel\\vec n_2$，常數項不成比例", pts: "空集合" }, tools: ["vector/plane/點到平面的距離"], kp: ["G-08"],
          ex: [{ id: "pE2", q: "$x+2y+2z=1$ 與 $x+2y+2z=-8$", a: "平行", val: "parallel" }] },
        { id: "E3", n: "相交", ans: { cond: "$\\vec n_1\\not\\parallel\\vec n_2$", pts: "一條直線，方向 $\\vec n_1\\times\\vec n_2$" }, tools: ["vector/plane/兩平面夾角"], kp: ["G-08", "G-07"],
          ex: [{ id: "pE3", q: "$x+2y+2z=1$ 與 $x-y=0$ 的交線方向", a: "$(2,2,-3)$ 的倍數", val: "(2,2,-3)" }] }
      ]
    },
    {
      id: "ppp", short: "三平面", title: "延伸（背面）　三平面：共有幾種？", type: "table", hideNames: true, back: true,
      fields: [{ id: "fig", n: "長什麼樣子" }, { id: "sol", n: "聯立方程組的解" }],
      rows: [
        { id: "F1", n: "三面重合", ans: { fig: "三個式子都成比例", sol: "無限多（一整個平面）" }, tools: ["vector/plane/三平面的相交關係"], kp: ["G-08", "G-10"],
          ex: [{ id: "pF1", q: "$x+y+z=1$、$2x+2y+2z=2$、$3x+3y+3z=3$", a: "無限多（平面）", val: "plane" }] },
        { id: "F2", n: "兩面重合、第三面與之平行", ans: { fig: "兩片疊在一起，另一片分開", sol: "無解" }, tools: ["vector/plane/三平面的相交關係"], kp: ["G-08", "G-10"],
          ex: [{ id: "pF2", q: "$x+y+z=1$、$2x+2y+2z=2$、$x+y+z=3$", a: "無解", val: "none" }] },
        { id: "F3", n: "兩面重合、第三面與之相交", ans: { fig: "交於一條直線", sol: "無限多（一條直線）" }, tools: ["vector/plane/三平面的相交關係"], kp: ["G-08", "G-10"],
          ex: [{ id: "pF3", q: "$x+y+z=1$、$2x+2y+2z=2$、$x-y=0$", a: "無限多（直線）", val: "line" }] },
        { id: "F4", n: "三面互相平行", ans: { fig: "三片平行", sol: "無解" }, tools: ["vector/plane/三平面的相交關係"], kp: ["G-08", "G-10"],
          ex: [{ id: "pF4", q: "$x+y+z=1$、$x+y+z=2$、$x+y+z=3$", a: "無解", val: "none" }] },
        { id: "F5", n: "兩面平行、第三面與之相交", ans: { fig: "交出兩條平行線", sol: "無解" }, tools: ["vector/plane/三平面的相交關係"], kp: ["G-08", "G-10"],
          ex: [{ id: "pF5", q: "$x+y+z=1$、$x+y+z=2$、$x-y=0$", a: "無解", val: "none" }] },
        { id: "F6", n: "三面交於一直線", ans: { fig: "像書頁繞著書脊", sol: "無限多（一條直線）" }, tools: ["vector/plane/三平面的相交關係"], kp: ["G-08", "G-10"],
          ex: [{ id: "pF6", q: "$x+y+z=1$、$x-y=0$、$2x+z=1$", a: "無限多（直線）", val: "line" }] },
        { id: "F7", n: "兩兩相交於三條平行線", ans: { fig: "三稜柱的三個側面", sol: "無解" }, tools: ["vector/plane/三平面的相交關係"], kp: ["G-08", "G-10"],
          ex: [{ id: "pF7", q: "$x+y+z=1$、$x-y=0$、$2x+z=5$", a: "無解", val: "none" }] },
        { id: "F8", n: "交於一點", ans: { fig: "像房間的牆角", sol: "唯一解" }, tools: ["vector/plane/三平面的相交關係"], kp: ["G-08", "G-10"],
          ex: [{ id: "pF8", q: "$x+y+z=1$、$x-y=0$、$z=0$", a: "$\\left(\\frac12,\\frac12,0\\right)$", val: "(1/2,1/2,0)" }] }
      ]
    }
  ],
  final: [
    {
      id: "same", q: "A、B 兩張表判斷時都在比什麼？C、D、E 三張表又都在看哪兩個向量的什麼關係？",
      ans: "A、B 都是「距離」和「半徑」比大小（A 用弦心距，B 用圓心距）。C、D、E 都先看方向向量或法向量「平行或垂直」，再用一個點決定是重合還是分開（C 歪斜另用三重積判斷共不共平面）。",
      lines: 3
    },
    {
      id: "count", q: "三平面的八種裡，哪幾種無解、哪幾種無限多解、哪一種唯一解？",
      ans: "無解 4 種（兩面重合另一面平行、三面平行、兩面平行另一面相交、三稜柱）；無限多解 3 種（三面重合、兩面重合另一面相交、交於一直線）；唯一解 1 種（交於一點）。",
      lines: 2
    }
  ],
  pitfalls: [
    "B 只寫了三種（外離、相切、相交），漏了內切、內含；公切線條數 $4,3,2,1,0$ 對不上。",
    "B 內切條件寫成 $d=r_1+r_2$，或忘了要 $d>0$（$d=0$ 是同心，屬內含）。",
    "C 只看方向向量就下結論：不平行不代表相交，空間裡還有歪斜。",
    "D 只看 $\\vec v\\cdot\\vec n=0$ 就說平行，漏了直線在平面上。",
    "E 重合與平行沒分：法向量平行之後，還要看常數項有沒有跟著成比例。",
    "三平面只記得「交於一點」和「無解」，八種畫不出來。"
  ]
});
