/* 架構重建卡 03：角度（學測範圍）。格式見 _scripts/frame_cards/FORMAT.md；數值例由 _scripts/frame_cards/verify_frames.py 驗算。 */
FRAME({
  id: "angle", stage: "hs", no: 3, n: "角度",
  scope: "學測（數A：高一、高二必修）",
  time: 15,
  intro: "高中算角度，幾乎都先換成「兩個向量的夾角」。下表每一列是一種角，請寫出：要用哪兩個向量、公式（cos 還是 sin？要不要絕對值？）、角度的範圍、什麼時候是 $0^\\circ$、什麼時候是 $90^\\circ$。想不出來就寫「?」。",
  sections: [
    {
      id: "main", title: "六種角", type: "props", rowH: 24,
      fields: [{ id: "vec", n: "用哪兩個向量" }, { id: "formula", n: "公式" }, { id: "range", n: "範圍" }, { id: "zero", n: "何時 $0^\\circ$" }, { id: "right", n: "何時 $90^\\circ$" }],
      rows: [
        {
          id: "1", n: "兩向量的夾角",
          ans: { vec: "兩個非零向量 $\\vec a$、$\\vec b$ 本身", formula: "$\\theta$ 是 $\\vec a$ 與 $\\vec b$ 的夾角：$\\cos\\theta=\\dfrac{\\vec a\\cdot\\vec b}{\\lvert\\vec a\\rvert\\lvert\\vec b\\rvert}$（保留正負）", range: "$0^\\circ\\le\\theta\\le180^\\circ$", zero: "同向", right: "$\\vec a\\cdot\\vec b=0$" },
          reduce: [], tools: ["vector/cross/空間中兩向量的夾角", "vector/dot/夾角的正負判斷"], kp: ["G-05"],
          ex: [{ id: "a1", q: "$(1,0,-1)$ 與 $(0,1,1)$ 的夾角", a: "$120^\\circ$", val: "120" }]
        },
        {
          id: "2", n: "平面上兩直線",
          ans: { vec: "兩直線的方向向量 $\\vec v_1$、$\\vec v_2$（或兩個法向量）；也可以不用向量，改用斜角", formula: "$\\theta$ 是兩直線的夾角。兩直線的斜角 $\\alpha_1$、$\\alpha_2$（直線與 $x$ 軸正向的夾角，$-90^\\circ < \\alpha\\le90^\\circ$），$\\theta=\\lvert\\alpha_1-\\alpha_2\\rvert$，超過 $90^\\circ$ 就用 $180^\\circ$ 減；或 $\\cos\\theta=\\dfrac{\\lvert\\vec v_1\\cdot\\vec v_2\\rvert}{\\lvert\\vec v_1\\rvert\\lvert\\vec v_2\\rvert}$", range: "取銳角或直角：$0^\\circ\\le\\theta\\le90^\\circ$（另一個是 $180^\\circ-\\theta$）", zero: "平行或重合", right: "兩直線斜率 $m_1$、$m_2$ 滿足 $m_1m_2=-1$，或一鉛直一水平" },
          reduce: ["1"], reduceNote: "方向向量的夾角，再取絕對值（銳角）",
          tools: ["geometry/line/兩直線的夾角", "geometry/line/斜率與平行垂直"], kp: ["G-01", "T-04"],
          ex: [{ id: "a2", q: "$y=\\sqrt3x$ 與 $y=-x$ 的夾角（銳角）", a: "$75^\\circ$", val: "75" }]
        },
        {
          id: "3", n: "空間兩直線",
          ans: { vec: "兩直線的方向向量 $\\vec v_1$、$\\vec v_2$", formula: "$\\theta$ 是兩直線的夾角：$\\cos\\theta=\\dfrac{\\lvert\\vec v_1\\cdot\\vec v_2\\rvert}{\\lvert\\vec v_1\\rvert\\lvert\\vec v_2\\rvert}$", range: "$0^\\circ\\le\\theta\\le90^\\circ$", zero: "平行或重合", right: "$\\vec v_1\\cdot\\vec v_2=0$（歪斜也可以垂直）" },
          reduce: ["1"], reduceNote: "方向向量的夾角，再取絕對值（銳角）",
          tools: ["vector/cross/空間中兩向量的夾角", "geometry/space/兩直線的位置關係"], kp: ["G-05", "G-06"],
          ex: [{ id: "a3", q: "方向 $(1,0,-1)$ 與 $(0,1,1)$ 的兩直線", a: "$60^\\circ$", val: "60" }]
        },
        {
          id: "4", n: "直線與平面",
          ans: { vec: "直線的方向向量 $\\vec v$、平面的法向量 $\\vec n$", formula: "$\\theta$ 是直線與平面的夾角：$\\sin\\theta=\\dfrac{\\lvert\\vec v\\cdot\\vec n\\rvert}{\\lvert\\vec v\\rvert\\lvert\\vec n\\rvert}$（是 sin，不是 cos）", range: "$0^\\circ\\le\\theta\\le90^\\circ$", zero: "直線平行平面或在平面上（$\\vec v\\cdot\\vec n=0$）", right: "$\\vec v\\parallel\\vec n$" },
          reduce: ["1"], reduceNote: "$\\vec v$ 與 $\\vec n$ 的夾角是 $90^\\circ-\\theta$，所以 cos 變 sin",
          tools: ["vector/plane/線面夾角"], kp: ["G-08"],
          ex: [{ id: "a4", q: "方向 $(1,0,1)$ 的直線與 $xy$ 平面", a: "$45^\\circ$", val: "45" }]
        },
        {
          id: "5", n: "兩平面",
          ans: { vec: "兩平面的法向量 $\\vec n_1$、$\\vec n_2$", formula: "$\\theta$ 是兩平面的夾角：$\\cos\\theta=\\dfrac{\\lvert\\vec n_1\\cdot\\vec n_2\\rvert}{\\lvert\\vec n_1\\rvert\\lvert\\vec n_2\\rvert}$", range: "依慣例取銳角或直角：$0^\\circ\\le\\theta\\le90^\\circ$", zero: "平行或重合", right: "$\\vec n_1\\cdot\\vec n_2=0$" },
          reduce: ["1", "6"], reduceNote: "法向量的夾角，再取絕對值；它就是兩面角裡的銳角（或直角）那一組",
          tools: ["vector/plane/兩平面夾角"], kp: ["G-08"],
          ex: [{ id: "a5", q: "$x+y=1$ 與 $x+z=2$", a: "$60^\\circ$", val: "60" }]
        },
        {
          id: "6", n: "兩面角",
          ans: { vec: "幾何：在稜上取一點，兩面內各作垂直於稜的射線；向量：兩個法向量", formula: "幾何直接量那個平面角；向量法算出法向量夾角後，依圖判斷要不要取補角", range: "$0^\\circ\\le\\theta\\le180^\\circ$（兩平面相交成兩組，互補）", zero: "（兩半平面重疊）", right: "兩平面垂直" },
          reduce: ["5"], reduceNote: "向量法算的是兩平面夾角，再看圖決定是它還是 $180^\\circ$ 減它",
          tools: ["geometry/space/兩面角（二面角）", "vector/plane/兩平面夾角"], kp: ["G-06", "G-08"],
          ex: [{ id: "a6", q: "正立方體 $ABCD$-$EFGH$ 中，平面 $ABCD$ 與平面 $ABGH$ 的兩面角", a: "$45^\\circ$", val: "45" }]
        }
      ]
    }
  ],
  final: [
    {
      id: "abs", q: "六種角裡，哪幾種公式要加絕對值？為什麼「兩向量的夾角」不能加？",
      ans: "平面兩直線、空間兩直線、線面、兩平面都要加：直線和平面沒有方向，依慣例取 $0^\\circ$～$90^\\circ$，加絕對值就自動取到銳角。向量有方向，夾角可以是鈍角，加了絕對值就錯了。",
      lines: 3
    },
    {
      id: "sin", q: "為什麼只有「直線與平面」用 sin？畫一張圖說明。",
      ans: "公式算的是 $\\vec v$ 與法向量 $\\vec n$ 的夾角 $\\varphi$，而直線和平面的夾角是直線和它在平面上的投影的夾角 $\\theta=90^\\circ-\\varphi$，所以 $\\sin\\theta=\\cos\\varphi$。",
      lines: 4
    },
    {
      id: "map", q: "用箭頭畫出：哪幾列都降成第 1 列？哪兩列之間只差一個「取補角」？",
      ans: "2、3、4、5 都降成 1（2、3、5 加絕對值；4 再把 cos 換成 sin）。5 和 6 之間只差「看圖要不要取補角」。",
      lines: 3
    }
  ],
  pitfalls: [
    "線面夾角用了 cos：算出來的是和法向量的夾角，要再用 $90^\\circ$ 減，或直接用 sin。",
    "求兩直線的夾角沒加絕對值，答成鈍角；或反過來，求向量的夾角時加了絕對值。",
    "平面兩直線用斜角相減，差超過 $90^\\circ$ 忘了用 $180^\\circ$ 減；遇到鉛直線還硬套 $\\tan$ 公式。",
    "兩面角直接答法向量夾角：要看圖，題目要的可能是它的補角。",
    "以為歪斜線不能說「垂直」：方向向量內積為 $0$ 就是垂直（本專案採「方向垂直」的說法，段考題看選項措辭）。"
  ]
});
