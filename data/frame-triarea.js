/* 架構重建卡 11：三角形面積的多條路（學測範圍，高一下三角比、高二上正餘弦定理與平面向量、高二下空間向量）。格式見 _scripts/frame_cards/FORMAT.md；數值例由 _scripts/frame_cards/verify_frame_batch2.py 驗算。 */
FRAME({
  id: "triarea", stage: "hs", no: 11, n: "三角形面積的多條路",
  scope: "學測（數A：高一下、高二上、高二下）",
  time: 15,
  intro: "高中學了七種三角形面積公式，看似分散在三角函數、平面向量與空間向量三章，其實全部都是從小學的「底 $\\times$ 高 $\\div 2$」一步步換出來的。請寫出：看到題目給什麼條件就選哪一條、公式怎麼寫、以及它怎麼推回上一條。想不出來就寫「?」。",
  sections: [
    {
      id: "trig", title: "邊角與圓半徑的五條路（$\\triangle ABC$ 中，$A,B,C$ 是三頂點，也代表三個內角；$a,b,c$ 是它們的對邊長；$S$ 是面積、$h_a$ 是 $a$ 邊上的高、$s=\\dfrac{a+b+c}{2}$ 是半周長、$r$ 是內切圓半徑、$R$ 是外接圓半徑）", type: "table", rowH: 20,
      fields: [{ id: "when", n: "看到題目給什麼條件" }, { id: "formula", n: "公式" }, { id: "use", n: "怎麼用／反求什麼" }],
      rows: [
        {
          id: "1", fig: "ta-base", n: "底乘高除以 $2$",
          ans: {
            when: "已知底邊長 $a$ 與這條底邊上的高 $h_a$（或頂點到直線的距離）",
            formula: "$S=\\dfrac12 a h_a$",
            use: "所有面積公式的源頭；常反過來用「等面積法」：先用別招算出面積 $S$，再除以 $\\dfrac12 a$ 反求高 $h_a$"
          },
          reduce: [], reduceNote: "基準列：兩個全等三角形拼成一個平行四邊形，面積取一半",
          tools: ["trig/solvetri/三角形面積公式群", "geometry/line/點到直線的距離"], kp: ["T-03", "G-01"],
          ex: [{ id: "ta1", q: "底邊 $a=8$、高 $h_a=5$，求面積 $S$", a: "$20$", val: "20" }]
        },
        {
          id: "2", fig: "ta-sas", n: "兩邊夾一角",
          ans: {
            when: "已知兩邊長 $a,b$ 與它們的夾角 $C$（或三邊配餘弦定理先算出 $\\cos C$，再轉 $\\sin C=\\sqrt{1-\\cos^2 C}$）",
            formula: "$S=\\dfrac12 ab\\sin C=\\dfrac12 bc\\sin A=\\dfrac12 ca\\sin B$",
            use: "最核心的橋梁公式；角平分線題常把大三角形拆成「左面積＋右面積＝總面積」列式求角平分線長"
          },
          reduce: ["1"], reduceNote: "由直角三角比，高 $h_a=b\\sin C$（$C$ 為鈍角時高落在 $BC$ 延長線上，$h_a=b\\sin(180^\\circ-C)=b\\sin C$ 仍成立），代入①的 $\\dfrac12 a h_a$ 即得 $\\dfrac12 ab\\sin C$",
          tools: ["trig/solvetri/三角形面積公式群", "trig/solvetri/中線與角平分線"], kp: ["T-03"],
          ex: [{ id: "ta2", q: "$a=6$、$b=8$、$\\angle C=60^\\circ$，求 $\\triangle ABC$ 面積", a: "$12\\sqrt3$", val: "12*sqrt(3)" }]
        },
        {
          id: "3", n: "海龍公式（已知三邊長）",
          ans: {
            when: "已知三邊長 $a,b,c$（任何能構成三角形的三邊都適用）；三邊是整數、半周長 $s=\\dfrac{a+b+c}{2}$ 好算時最划算，邊長帶根號則改走②",
            formula: "半周長 $s=\\dfrac{a+b+c}{2}$，面積 $S=\\sqrt{s(s-a)(s-b)(s-c)}$",
            use: "三邊為整數時直接秒殺面積，再配①求高、配④求內切圓半徑 $r$、配⑤求外接圓半徑 $R$；若邊長帶根號，改用餘弦定理求 $\\cos C\\to\\sin C$ 代②更快"
          },
          reduce: ["2"], reduceNote: "把②平方並將 $\\sin^2 C=1-\\cos^2 C=1-\\left(\\dfrac{a^2+b^2-c^2}{2ab}\\right)^2$ 因式分解即得",
          tools: ["trig/solvetri/三角形面積公式群", "trig/solvetri/餘弦定理"], kp: ["T-03"],
          ex: [{ id: "ta3", q: "三邊長 $a=5$、$b=6$、$c=7$，求 $\\triangle ABC$ 面積", a: "$6\\sqrt6$", val: "6*sqrt(6)" }]
        },
        {
          id: "4", fig: "ta-in", n: "內切圓半徑公式",
          ans: {
            when: "題目提到「內切圓半徑 $r$」或「內心到三邊的距離」",
            formula: "半周長 $s=\\dfrac{a+b+c}{2}$，面積 $S=r\\cdot s=\\dfrac12 r(a+b+c)$",
            use: "本身不常單獨算面積，而是先由②或③算出面積 $S$ 與半周長 $s$，再用 $r=\\dfrac{S}{s}$ 反求內切圓半徑 $r$"
          },
          reduce: ["1"], reduceNote: "連內心與三頂點，拆成三個以 $a,b,c$ 為底、內切圓半徑 $r$ 為高的小三角形，套①相加：$\\dfrac12 ar+\\dfrac12 br+\\dfrac12 cr=rs$",
          tools: ["trig/solvetri/三角形面積公式群", "geometry/line/三角形的心"], kp: ["T-03", "G-04"],
          ex: [{ id: "ta4", q: "三邊長 $5,12,13$ 的直角三角形，求內切圓半徑 $r$", a: "$2$", val: "2" }]
        },
        {
          id: "5", fig: "ta-circ", n: "外接圓半徑公式",
          ans: {
            when: "題目給三邊長 $a,b,c$，要求外接圓半徑 $R$（而又不想單獨算某個角的 $\\sin$）",
            formula: "$S=\\dfrac{abc}{4R}$，移項得 $R=\\dfrac{abc}{4S}$",
            use: "配合③海龍公式算出 $S$ 後，直接用 $R=\\dfrac{abc}{4S}$ 求出外接圓半徑（但若已知一角與對邊，直接用正弦定理 $\\dfrac{a}{\\sin A}=2R$ 更快）"
          },
          reduce: ["2"], reduceNote: "由正弦定理 $\\dfrac{c}{\\sin C}=2R\\implies\\sin C=\\dfrac{c}{2R}$，代入②的 $\\dfrac12 ab\\sin C$ 即得 $\\dfrac{abc}{4R}$",
          tools: ["trig/solvetri/三角形面積公式群", "trig/solvetri/正弦定理"], kp: ["T-03"],
          ex: [{ id: "ta5", q: "三邊長 $5,6,7$，求外接圓半徑 $R$", a: "$\\dfrac{35\\sqrt6}{24}$", val: "35*sqrt(6)/24" }]
        }
      ]
    },
    {
      id: "vec", title: "背面　向量與坐標的兩條路（$A,B,C$ 是三頂點、$S$ 是面積；$\\vec u=\\overrightarrow{AB}$、$\\vec v=\\overrightarrow{AC}$ 是從頂點 $A$ 出發的兩夾邊向量；$\\theta$ 是 $\\vec u$ 與 $\\vec v$ 的夾角，即 $\\angle A$；$x_1,y_1,z_1$、$x_2,y_2,z_2$ 分別是 $\\vec u$、$\\vec v$ 的坐標分量）", type: "table", back: true, rowH: 22,
      fields: [{ id: "when", n: "看到題目給什麼條件" }, { id: "formula", n: "公式" }, { id: "use", n: "平面與空間的差別" }],
      rows: [
        {
          id: "6", fig: "ta-vec", n: "向量長度與內積公式＋平面二階行列式",
          ans: {
            when: "已知兩夾邊向量的長度 $\\lvert\\vec u\\rvert,\\lvert\\vec v\\rvert$ 與內積 $\\vec u\\cdot\\vec v$；或已知平面上三頂點坐標",
            formula: "$S=\\dfrac12\\sqrt{\\lvert\\vec u\\rvert^2\\lvert\\vec v\\rvert^2-(\\vec u\\cdot\\vec v)^2}$；若在平面上 $\\vec u=(x_1,y_1)$、$\\vec v=(x_2,y_2)$，展開化簡就是二階行列式絕對值的一半：$S=\\dfrac12\\bigl\\lvert\\begin{vmatrix}x_1&y_1\\\\ x_2&y_2\\end{vmatrix}\\bigr\\rvert=\\dfrac12\\lvert x_1y_2-x_2y_1\\rvert$",
            use: "根號內積式在平面和空間都能用；二階行列式是平面坐標給三頂點時最快的算法（先以一個頂點為起點，用終點減起點求出兩夾邊向量，再套行列式）"
          },
          reduce: ["2"], reduceNote: "把②寫成 $\\dfrac12\\lvert\\vec u\\rvert\\lvert\\vec v\\rvert\\sin\\theta$（兩夾邊 $b=\\lvert\\vec v\\rvert$、$c=\\lvert\\vec u\\rvert$、夾角 $\\theta=\\angle A$），再把 $\\sin\\theta=\\sqrt{1-\\cos^2\\theta}$ 代入，將 $\\lvert\\vec u\\rvert\\lvert\\vec v\\rvert\\cos\\theta$ 換成內積 $\\vec u\\cdot\\vec v$ 即得",
          tools: ["trig/solvetri/坐標下的面積", "vector/cross/行列式的幾何意義"], kp: ["G-05", "T-03"],
          ex: [
            { id: "ta6a", q: "$\\lvert\\vec u\\rvert=3$、$\\lvert\\vec v\\rvert=4$、$\\vec u\\cdot\\vec v=6$，求三角形面積", a: "$3\\sqrt3$", val: "3*sqrt(3)" },
            { id: "ta6b", q: "平面上 $A(1,2)$、$B(5,4)$、$C(3,8)$，求 $\\triangle ABC$ 面積", a: "$10$", val: "10" }
          ]
        },
        {
          id: "7", fig: "v-cross", n: "空間向量外積公式",
          ans: {
            when: "已知空間中三頂點坐標 $A,B,C$，或兩夾邊空間向量 $\\vec u=(x_1,y_1,z_1)$、$\\vec v=(x_2,y_2,z_2)$",
            formula: "$S=\\dfrac12\\lvert\\vec u\\times\\vec v\\rvert$（外積向量長度的一半；平行四邊形面積則不乘 $\\dfrac12$）",
            use: "只有空間三維向量才能算外積；算完外積順便拿到平面的法向量，可接著寫平面方程式或配四面體體積求高"
          },
          reduce: ["2", "6"], reduceNote: "因為外積長度定義就是 $\\lvert\\vec u\\times\\vec v\\rvert=\\lvert\\vec u\\rvert\\lvert\\vec v\\rvert\\sin\\theta$，乘 $\\dfrac12$ 就是②；若把平面向量補 $z=0$ 代入外積，就退化成⑥的二階行列式",
          tools: ["vector/cross/外積的長度＝面積"], kp: ["G-07"],
          ex: [{ id: "ta7", q: "空間中 $A(1,1,0)$、$B(3,2,2)$、$C(2,3,1)$，求 $\\triangle ABC$ 面積", a: "$\\dfrac{3\\sqrt2}{2}$", val: "3*sqrt(2)/2" }]
        }
      ]
    }
  ],
  final: [
    {
      id: "map", q: "畫出推導圖：②、③、④、⑤、⑥、⑦ 怎麼全部從 ①「底 $\\times$ 高 $\\div 2$」長出來？",
      ans: "① $\\to$ ④（分成三個以 $r$ 為高的小三角形相加）；① $\\to$ ②（把高寫成 $b\\sin C$）；② $\\to$ ⑤（用正弦定理把 $\\sin C$ 換成 $\\dfrac{c}{2R}$）；② $\\to$ ③（用餘弦定理把 $\\sin C=\\sqrt{1-\\cos^2 C}$ 換成三邊長因式分解）；② $\\to$ ⑥（把 $\\lvert\\vec u\\rvert\\lvert\\vec v\\rvert\\cos\\theta$ 換成內積，展開坐標得二階行列式）；② $\\to$ ⑦（空間外積長度就是 $\\lvert\\vec u\\rvert\\lvert\\vec v\\rvert\\sin\\theta$）。",
      lines: 5
    },
    {
      id: "pick", q: "三邊長為 $5,6,7$ 與三邊長為 $\\sqrt5,\\sqrt6,\\sqrt7$，求面積時各選哪一招最快？為什麼？",
      ans: "三邊為整數 $5,6,7$ 時，半周長 $s=9$ 是整數，直接代③海龍公式 $\\sqrt{9\\cdot4\\cdot3\\cdot2}=6\\sqrt6$ 最快；三邊帶根號 $\\sqrt5,\\sqrt6,\\sqrt7$ 時，$s$ 有三個根號相加很難算，但三邊平方 $a^2=5,b^2=6,c^2=7$ 是整數，先用餘弦定理算 $\\cos C=\\dfrac{5+6-7}{2\\sqrt{30}}=\\dfrac{2}{\\sqrt{30}}$，再算 $\\sin C=\\sqrt{1-\\dfrac{4}{30}}=\\sqrt{\\dfrac{13}{15}}$，代②得 $S=\\dfrac12\\sqrt{30}\\sqrt{\\dfrac{13}{15}}=\\dfrac{\\sqrt{26}}{2}$（或用⑥根號內積式）快得多。",
      lines: 4
    }
  ],
  pitfalls: [
    "邊長帶根號還硬代海龍公式 $s=\\dfrac{a+b+c}{2}$，算到一半卡死：看到根號邊長先平方用餘弦定理。",
    "二階行列式或外積算完忘了乘 $\\dfrac12$（沒乘 $\\dfrac12$ 算出來的是平行四邊形面積），或忘了加絕對值。",
    "平面上三頂點 $A,B,C$ 直接把點坐標塞進二階行列式：必須先相減求出兩夾邊向量 $\\overrightarrow{AB}$、$\\overrightarrow{AC}$ 再放進行列式。",
    "求外接圓半徑 $R$ 時，明明已知一角 $A$ 與對邊 $a$ 可以直接用正弦定理 $\\dfrac{a}{\\sin A}=2R$，卻繞遠路去算 $S=\\dfrac{abc}{4R}$。"
  ]
});
