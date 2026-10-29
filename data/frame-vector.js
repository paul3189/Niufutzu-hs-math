/* 架構重建卡 05：向量運算（學測範圍）。格式見 _scripts/frame_cards/FORMAT.md；數值例由 _scripts/frame_cards/verify_frame_vector.py 驗算。 */
FRAME({
  id: "vector", stage: "hs", no: 5, n: "向量運算",
  scope: "學測（數A：高二上平面向量、高二下空間向量）",
  time: 15,
  intro: "高中的向量只有六種運算。下表每一列寫四件事：坐標怎麼算（平面、空間都寫）、它在圖上是什麼（平行四邊形？投影？面積？體積？）、拿來判斷或計算什麼、平面和空間是不是都有。想不出來就寫「?」。背面再反過來查：要判斷平行、垂直、共面，要算面積、體積，各用哪一種運算。",
  sections: [
    {
      id: "main", title: "六種運算（$\\vec a=(a_1,a_2,a_3)$、$\\vec b=(b_1,b_2,b_3)$ 是向量，$\\vec c=(c_1,c_2,c_3)$ 是第三個向量；平面向量去掉第三個分量。$\\theta$ 是 $\\vec a$ 與 $\\vec b$ 的夾角）",
      type: "props", rowH: 25,
      fields: [{ id: "formula", n: "坐標怎麼算" }, { id: "geo", n: "幾何意義" }, { id: "judge", n: "用來判斷／計算什麼" }, { id: "dim", n: "平面、空間都有嗎" }],
      rows: [
        {
          id: "1", n: "加減",
          ans: {
            formula: "$\\vec a\\pm\\vec b=(a_1\\pm b_1,a_2\\pm b_2,a_3\\pm b_3)$；兩點 $A$、$B$：$\\overrightarrow{AB}$＝$B$ 的坐標減 $A$ 的坐標（終點減始點）",
            geo: "平行四邊形：共起點的兩邊，$\\vec a+\\vec b$ 是從起點出發的對角線，$\\vec a-\\vec b$ 是另一條（$\\vec b$ 的終點指向 $\\vec a$ 的終點）",
            judge: "$A$、$B$、$C$、$D$ 是四點，依序圍成平行四邊形 $\\iff\\overrightarrow{AB}=\\overrightarrow{DC}$；拆路徑 $\\overrightarrow{AC}=\\overrightarrow{AB}+\\overrightarrow{BC}$",
            dim: "都有（空間多一個分量）"
          },
          reduce: ["2"], reduceNote: "減法就是加上 $(-1)$ 倍：$\\vec a-\\vec b=\\vec a+(-1)\\vec b$",
          tools: ["vector/vbasic/向量的表示與加減"], kp: ["G-05", "G-07"],
          ex: [
            { id: "vo1", q: "$A(1,2,3)$、$B(4,0,5)$，求 $\\overrightarrow{AB}$", a: "$(3,-2,2)$", val: "(3,-2,2)" },
            { id: "vo2", q: "$A(1,0)$、$B(4,1)$、$C(5,3)$，$ABCD$ 是平行四邊形，求 $D$", a: "$(2,2)$", val: "(2,2)" }
          ]
        },
        {
          id: "2", n: "係數積（實數乘向量）",
          ans: {
            formula: "$t$ 是實數：$t\\vec a=(ta_1,ta_2,ta_3)$；單位向量 $\\dfrac{\\vec a}{\\lvert\\vec a\\rvert}$",
            geo: "伸縮：$t>0$ 同向、$t<0$ 反向，長度乘 $\\lvert t\\rvert$；再配上加法就是線性組合",
            judge: "平行：$\\vec b=t\\vec a$（分量成比例）；分點、三點共線：$A$、$B$ 是兩點，$O$ 是任一點，點 $P$ 在直線 $AB$ 上 $\\iff\\overrightarrow{OP}=(1-t)\\overrightarrow{OA}+t\\overrightarrow{OB}$（係數和 $1$）",
            dim: "都有"
          },
          reduce: [],
          tools: ["vector/vbasic/共線判定", "vector/vbasic/分點與係數和定理", "vector/vbasic/單位向量與方向"], kp: ["G-05", "G-07"],
          ex: [
            { id: "vo3", q: "$(2,-1,k)$ 與 $(-4,2,6)$ 平行，求 $k$", a: "$-3$", val: "-3" },
            { id: "vo4", q: "與 $(2,-1,2)$ 同向的單位向量", a: "$\\left(\\frac23,-\\frac13,\\frac23\\right)$", val: "(2/3,-1/3,2/3)" }
          ]
        },
        {
          id: "3", n: "內積",
          ans: {
            formula: "$\\vec a\\cdot\\vec b=a_1b_1+a_2b_2+a_3b_3=\\lvert\\vec a\\rvert\\lvert\\vec b\\rvert\\cos\\theta$（結果是一個數）；$\\lvert\\vec a\\rvert^2=\\vec a\\cdot\\vec a$",
            geo: "投影：$\\vec a$ 在 $\\vec b$ 上的正射影向量是 $\\dfrac{\\vec a\\cdot\\vec b}{\\lvert\\vec b\\rvert^2}\\vec b$，正射影長是 $\\dfrac{\\lvert\\vec a\\cdot\\vec b\\rvert}{\\lvert\\vec b\\rvert}$；內積＝$\\lvert\\vec b\\rvert$ 乘上有正負的正射影長",
            judge: "垂直：$\\vec a\\cdot\\vec b=0$；正負判銳角、鈍角；長度：展開 $\\lvert\\vec a+\\vec b\\rvert^2$；柯西 $(\\vec a\\cdot\\vec b)^2\\le\\lvert\\vec a\\rvert^2\\lvert\\vec b\\rvert^2$ 求最大最小（等號：平行）",
            dim: "都有"
          },
          reduce: [],
          tools: ["vector/dot/內積的兩種算法", "vector/dot/垂直判定", "vector/dot/正射影", "vector/dot/柯西不等式（向量形式）"], kp: ["G-05", "G-07"],
          ex: [
            { id: "vo5", q: "$(3,1,2)$ 在 $(1,1,1)$ 上的正射影向量", a: "$(2,2,2)$", val: "(2,2,2)" },
            { id: "vo6", q: "$x^2+y^2+z^2=9$，$x+2y+2z$ 的最大值", a: "$9$", val: "9" }
          ]
        },
        {
          id: "4", n: "外積",
          ans: {
            formula: "$\\vec a\\times\\vec b=\\left(\\begin{vmatrix}a_2&a_3\\\\ b_2&b_3\\end{vmatrix},\\begin{vmatrix}a_3&a_1\\\\ b_3&b_1\\end{vmatrix},\\begin{vmatrix}a_1&a_2\\\\ b_1&b_2\\end{vmatrix}\\right)$（結果是一個向量；第二個分量順序最容易寫反）",
            geo: "方向：同時垂直 $\\vec a$、$\\vec b$（右手定則）；長度 $\\lvert\\vec a\\times\\vec b\\rvert=\\lvert\\vec a\\rvert\\lvert\\vec b\\rvert\\sin\\theta$＝$\\vec a$、$\\vec b$ 張成的平行四邊形面積，三角形取一半",
            judge: "求法向量（平面方程式、兩平面交線的方向）；求面積；平行：$\\vec a\\times\\vec b=\\vec 0$",
            dim: "只有空間（平面上的版本是二階行列式）"
          },
          reduce: ["5", "3"], reduceNote: "三個分量都是二階行列式（遮住第 $1$、$2$、$3$ 行）；長度也能只用內積算：$\\lvert\\vec a\\times\\vec b\\rvert^2=\\lvert\\vec a\\rvert^2\\lvert\\vec b\\rvert^2-(\\vec a\\cdot\\vec b)^2$",
          tools: ["vector/cross/外積的定義", "vector/cross/外積的長度＝面積"], kp: ["G-07", "G-08"],
          ex: [
            { id: "vo7", q: "與 $(1,2,0)$、$(0,1,3)$ 都垂直的向量", a: "$(6,-3,1)$ 的非零倍", val: "(6,-3,1)" },
            { id: "vo8", q: "$A(1,0,0)$、$B(0,2,0)$、$C(0,0,3)$，$\\triangle ABC$ 面積", a: "$\\frac72$", val: "7/2" }
          ]
        },
        {
          id: "5", n: "二階行列式",
          ans: {
            formula: "平面向量 $\\vec a=(a_1,a_2)$、$\\vec b=(b_1,b_2)$：$\\begin{vmatrix}a_1&a_2\\\\ b_1&b_2\\end{vmatrix}=a_1b_2-a_2b_1$",
            geo: "$\\vec a$、$\\vec b$ 張成的平行四邊形的有向面積：絕對值是面積（三角形取一半），$\\vec a$ 逆時針轉到 $\\vec b$（轉不到 $180^\\circ$）時為正",
            judge: "平行：行列式 $=0$；平面上求面積；（矩陣章）係數行列式不為 $0$，二元一次聯立恰一組解",
            dim: "平面"
          },
          reduce: ["4"], reduceNote: "平面向量補第三個分量 $0$：$\\vec a\\times\\vec b=(0,0,a_1b_2-a_2b_1)$，所以二階行列式的絕對值＝外積的長度",
          tools: ["vector/cross/行列式的幾何意義", "vector/matrix/行列式與面積比"], kp: ["G-05"],
          ex: [
            { id: "vo9", q: "$O(0,0)$、$A(3,1)$、$B(1,2)$，$\\triangle OAB$ 面積", a: "$\\frac52$", val: "5/2" },
            { id: "vo10", q: "$(3,1)$ 逆時針轉到 $(1,2)$ 的有向面積（行列式的值）", a: "$5$", val: "5" }
          ]
        },
        {
          id: "6", n: "三階行列式",
          ans: {
            formula: "$\\begin{vmatrix}a_1&a_2&a_3\\\\ b_1&b_2&b_3\\\\ c_1&c_2&c_3\\end{vmatrix}=\\vec a\\cdot(\\vec b\\times\\vec c)$（三重積）；可按第一列展開成三個二階行列式",
            geo: "$\\vec a$、$\\vec b$、$\\vec c$ 張成的平行六面體的有向體積：絕對值是體積，四面體是它的 $\\frac16$",
            judge: "共平面：行列式 $=0$；求體積；體積法求點到平面的距離（體積 $\\times3\\div$ 底面積）；（矩陣章）係數行列式不為 $0$，三元一次聯立恰一組解",
            dim: "只有空間"
          },
          reduce: ["4", "3", "5"], reduceNote: "$\\vec a\\cdot(\\vec b\\times\\vec c)$：先做外積再做內積，也就是底面積乘高；按一列展開就是三個二階行列式",
          tools: ["vector/cross/純量三重積＝體積", "vector/cross/行列式的幾何意義"], kp: ["G-07"],
          ex: [
            { id: "vo11", q: "以 $(1,1,0)$、$(0,1,1)$、$(1,0,1)$ 為三邊的平行六面體體積", a: "$2$", val: "2" },
            { id: "vo12", q: "$(1,2,3)$、$(2,1,k)$、$(0,1,1)$ 共平面，求 $k$", a: "$3$", val: "3" }
          ]
        }
      ]
    },
    {
      id: "use", title: "背面　反過來查：要做這件事，用哪一種運算？（$\\vec a$、$\\vec b$、$\\vec c$ 是向量；$A$、$B$、$C$、$D$ 是點）", type: "props", back: true, rowH: 9,
      fields: [{ id: "flat", n: "平面上怎麼做" }, { id: "space", n: "空間中怎麼做" }],
      rows: [
        {
          id: "7", n: "判斷平行（三點共線）",
          ans: {
            flat: "$\\vec b=t\\vec a$（分量成比例），或二階行列式 $=0$；三點共線看 $\\overrightarrow{AB}$、$\\overrightarrow{AC}$ 平行",
            space: "$\\vec b=t\\vec a$，或外積 $\\vec a\\times\\vec b=\\vec 0$（分量有 $0$ 時比較不會出錯）"
          },
          reduce: ["2", "5", "4"],
          tools: ["vector/vbasic/共線判定"], kp: ["G-05", "G-07"],
          ex: [{ id: "vo13", q: "$A(1,2,3)$、$B(2,4,7)$、$C(4,8,k)$ 共線，求 $k$", a: "$15$", val: "15" }]
        },
        {
          id: "8", n: "判斷垂直",
          ans: { flat: "內積 $\\vec a\\cdot\\vec b=0$", space: "同樣是內積 $=0$" },
          reduce: ["3"],
          tools: ["vector/dot/垂直判定"], kp: ["G-05", "G-07"],
          ex: [{ id: "vo14", q: "$(1,k,2)$ 與 $(3,-1,k)$ 垂直，求 $k$", a: "$-3$", val: "-3" }]
        },
        {
          id: "9", n: "判斷共面",
          ans: { flat: "（平面上的點本來就共平面，不用判斷）", space: "三階行列式 $=0$；四點 $A$、$B$、$C$、$D$ 共面看 $\\overrightarrow{AB}$、$\\overrightarrow{AC}$、$\\overrightarrow{AD}$" },
          reduce: ["6"],
          tools: ["vector/cross/純量三重積＝體積", "vector/vbasic/線性組合與唯一分解"], kp: ["G-07"],
          ex: [{ id: "vo15", q: "$A(1,0,0)$、$B(0,1,0)$、$C(0,0,1)$、$D(1,1,k)$ 共面，求 $k$", a: "$-1$", val: "-1" }]
        },
        {
          id: "10", n: "三角形面積",
          ans: {
            flat: "$\\frac12$ 乘 $\\overrightarrow{AB}$、$\\overrightarrow{AC}$ 的二階行列式的絕對值",
            space: "$\\frac12\\lvert\\overrightarrow{AB}\\times\\overrightarrow{AC}\\rvert$；平面、空間都能用 $\\frac12\\sqrt{\\lvert\\overrightarrow{AB}\\rvert^2\\lvert\\overrightarrow{AC}\\rvert^2-(\\overrightarrow{AB}\\cdot\\overrightarrow{AC})^2}$"
          },
          reduce: ["5", "4", "3"],
          tools: ["vector/cross/外積的長度＝面積", "vector/cross/行列式的幾何意義"], kp: ["G-05", "G-07"],
          ex: [{ id: "vo16", q: "$A(1,1)$、$B(4,2)$、$C(2,5)$，$\\triangle ABC$ 面積", a: "$\\frac{11}2$", val: "11/2" }]
        },
        {
          id: "11", n: "四面體體積",
          ans: { flat: "（平面沒有體積）", space: "$\\frac16$ 乘 $\\overrightarrow{AB}$、$\\overrightarrow{AC}$、$\\overrightarrow{AD}$ 的三階行列式的絕對值" },
          reduce: ["6"],
          tools: ["vector/cross/純量三重積＝體積"], kp: ["G-07"],
          ex: [{ id: "vo17", q: "$O(0,0,0)$、$A(1,2,0)$、$B(0,1,2)$、$C(2,0,1)$ 的四面體體積", a: "$\\frac32$", val: "3/2" }]
        }
      ]
    }
  ],
  final: [
    {
      id: "map", q: "用箭頭畫出：二階行列式、外積、內積、三階行列式，誰是誰的平面版？誰是誰組合出來的？",
      ans: "⑤ 是 ④ 的平面版（平面向量補第三個分量 $0$，外積只剩第三個分量，就是二階行列式）；④ 的三個分量都是 ⑤；④ 的長度可由 ③ 算出；⑥＝先 ④ 再 ③（$\\vec a\\cdot(\\vec b\\times\\vec c)$，底面積乘高），按一列展開又是三個 ⑤。所以面積的三個公式是同一件事，體積的公式是面積再乘高。",
      lines: 3
    },
    {
      id: "why", q: "為什麼判斷垂直用內積、判斷平行用外積（或二階行列式）？",
      ans: "內積裡有 $\\cos\\theta$，$\\cos90^\\circ=0$，所以垂直時內積 $=0$；外積長度（二階行列式的絕對值）裡有 $\\sin\\theta$，$\\sin0^\\circ=\\sin180^\\circ=0$，所以平行時為 $0$。幾何上：垂直時正射影縮成一點，平行時平行四邊形壓扁成面積 $0$。",
      lines: 2
    },
    {
      id: "area", q: "空間中 $\\triangle ABC$ 的面積，寫出三種算法（只寫式子）。哪一種平面上也能用？",
      ans: "$\\frac12\\lvert\\overrightarrow{AB}\\rvert\\lvert\\overrightarrow{AC}\\rvert\\sin A$；$\\frac12\\sqrt{\\lvert\\overrightarrow{AB}\\rvert^2\\lvert\\overrightarrow{AC}\\rvert^2-(\\overrightarrow{AB}\\cdot\\overrightarrow{AC})^2}$；$\\frac12\\lvert\\overrightarrow{AB}\\times\\overrightarrow{AC}\\rvert$。前兩種平面上也能用；平面上第三種換成二階行列式。",
      lines: 2
    }
  ],
  pitfalls: [
    "外積第二個分量寫反號：照「遮住第 $2$ 行」算要再乘 $-1$，或直接寫成 $a_3b_1-a_1b_3$。算完用內積檢查：結果和 $\\vec a$、$\\vec b$ 的內積都要是 $0$。",
    "平面向量寫外積：外積只在空間有，平面上求面積用二階行列式。",
    "行列式算出負數直接當面積或體積：要取絕對值；三角形是平行四邊形的 $\\frac12$，四面體是平行六面體的 $\\frac16$。",
    "正射影長和正射影向量分不清：長度要取絕對值，向量要再乘上 $\\vec b$ 方向的單位向量。",
    "內積是數、外積是向量：$\\vec a\\cdot\\vec b\\cdot\\vec c$ 沒有意義；$\\vec a\\times\\vec b$ 和 $\\vec b\\times\\vec a$ 差一個負號。",
    "柯西不等式取最大值時沒檢查等號：要 $\\vec a$、$\\vec b$ 平行時才取得到。",
    "分量成比例判平行時遇到 $0$ 分量就亂除：改用外積 $=\\vec 0$ 判斷比較穩。"
  ]
});
