/* 架構重建卡 07：三角恆等式家族（學測範圍，高一下三角比、高二上和差角與疊合）。格式見 _scripts/frame_cards/FORMAT.md；數值例由 _scripts/frame_cards/verify_frame_batch2.py 驗算。
   範圍：商數與平方關係、餘角與廣義角化簡、和差角、二倍角、半角（降次）、正弦疊合。cot／sec／csc（加深加廣）、和差化積、積化和差不收。 */
FRAME({
  id: "trigid", stage: "hs", no: 7, n: "三角恆等式家族",
  scope: "學測（數A：高一下、高二上）；和差化積、積化和差不收",
  time: 15,
  intro: "高中的三角恆等式不是十幾條獨立的公式，而是從兩個源頭（畢氏定理的平方關係、兩點距離或旋轉推出的餘弦差角公式）一路長出來的家族樹。請寫出每一格的公式、怎麼從上一代推出來、以及什麼時候派上用場。每一格的「怎麼從上一代推出來」就是家族樹的一條邊，請同時寫出上一代是哪一格。想不出來就寫「?」。",
  sections: [
    {
      id: "base", title: "源頭與正餘弦和差角（角 $\\alpha$、$\\theta$ 是任意廣義角）", type: "table", rowH: 24,
      fields: [{ id: "formula", n: "公式" }, { id: "how", n: "怎麼從上一代推出來／口訣" }, { id: "use", n: "何時用（常搭配的變形）" }],
      rows: [
        {
          id: "1", fig: "ti-unit", n: "商數與平方關係",
          ans: {
            formula: "$\\tan\\theta=\\dfrac{\\sin\\theta}{\\cos\\theta}$（$\\cos\\theta\\ne0$）；$\\sin^2\\theta+\\cos^2\\theta=1$",
            how: "第一源頭：角 $\\theta$ 的終邊與單位圓交於 $(\\cos\\theta,\\sin\\theta)$，終邊所在直線的斜率就是 $\\tan\\theta$（縱坐標除以橫坐標，橫坐標不為 $0$），畢氏定理得平方和 $=1$",
            use: "知一求二（配合象限判正負）；遇 $\\sin\\theta\\pm\\cos\\theta$ 先平方：$( \\sin\\theta\\pm\\cos\\theta )^2=1\\pm2\\sin\\theta\\cos\\theta$"
          },
          reduce: [], reduceNote: "第一源頭：單位圓上的畢氏定理與斜率定義",
          tools: ["trig/identity/平方關係", "trig/def/單位圓（廣義角）定義"], kp: ["T-01", "T-02"],
          ex: [
            { id: "ti1a", q: "$\\sin\\theta+\\cos\\theta=\\dfrac{7}{5}$，求 $\\sin\\theta\\cos\\theta$", a: "$\\dfrac{12}{25}$", val: "12/25" },
            { id: "ti1b", q: "$\\theta$ 在第二象限且 $\\sin\\theta=\\dfrac{3}{5}$，求 $\\tan\\theta$", a: "$-\\dfrac{3}{4}$", val: "-3/4" }
          ]
        },
        {
          id: "2", fig: "ti-sym", n: "廣義角與餘角化簡",
          ans: {
            formula: "負角：$\\sin(-\\theta)=-\\sin\\theta$、$\\cos(-\\theta)=\\cos\\theta$、$\\tan(-\\theta)=-\\tan\\theta$；補角：$\\sin(180^\\circ-\\theta)=\\sin\\theta$、$\\cos(180^\\circ-\\theta)=-\\cos\\theta$；餘角：$\\sin(90^\\circ-\\theta)=\\cos\\theta$、$\\cos(90^\\circ-\\theta)=\\sin\\theta$",
            how: "奇變偶不變、正負看象限：$90^\\circ\\times k\\pm\\theta$（$k$ 是整數）中 $k$ 是奇數時 $\\sin\\leftrightarrow\\cos$ 互換，$k$ 是偶數時函數名不變；正負號看把 $\\theta$ 當銳角時原角所在的象限",
            use: "把任意大角、負角化回銳角；三角形內角 $A+B+C=180^\\circ$（角 $A$、$B$、$C$ 是內角）時，$\\sin(A+B)=\\sin C$、$\\cos(A+B)=-\\cos C$"
          },
          reduce: ["1"], reduceNote: "單位圓對稱點（對 $x$ 軸、$y$ 軸、原點、直線 $y=x$ 對稱）坐標互換或變號",
          tools: ["trig/def/參考角化簡", "trig/def/象限符號口訣"], kp: ["T-02"],
          ex: [
            { id: "ti2a", q: "求 $\\cos 120^\\circ+\\sin 210^\\circ+\\tan 315^\\circ$", a: "$-2$", val: "-2" },
            { id: "ti2b", q: "求 $\\sin^2 10^\\circ+\\sin^2 80^\\circ$", a: "$1$", val: "1" }
          ]
        },
        {
          id: "3", fig: "ti-cosdiff", n: "餘弦差角與和角",
          ans: {
            formula: "$\\cos(\\alpha-\\theta)=\\cos\\alpha\\cos\\theta+\\sin\\alpha\\sin\\theta$；$\\cos(\\alpha+\\theta)=\\cos\\alpha\\cos\\theta-\\sin\\alpha\\sin\\theta$",
            how: "第二源頭：在單位圓上取角 $\\alpha$、$\\theta$ 的終邊點，由兩點距離公式等於餘弦定理推得 $\\cos(\\alpha-\\theta)$；再把 $\\theta$ 換成 $-\\theta$（套②）得 $\\cos(\\alpha+\\theta)$",
            use: "口訣「餘餘、正正，中間變號」；求 $15^\\circ$、$75^\\circ$ 的餘弦，或已知兩角的正餘弦求夾角"
          },
          reduce: ["2"], reduceNote: "由 $\\cos(\\alpha-\\theta)$ 配上②的負角性質 $\\cos(-\\theta)=\\cos\\theta$、$\\sin(-\\theta)=-\\sin\\theta$ 推出和角",
          tools: ["trig/identity/和差角公式"], kp: ["T-04"],
          ex: [{ id: "ti3", q: "求 $\\cos 15^\\circ=\\cos(45^\\circ-30^\\circ)$", a: "$\\dfrac{\\sqrt6+\\sqrt2}{4}$", val: "sqrt(6)/4+sqrt(2)/4" }]
        },
        {
          id: "4", n: "正弦和角與差角",
          ans: {
            formula: "$\\sin(\\alpha+\\theta)=\\sin\\alpha\\cos\\theta+\\cos\\alpha\\sin\\theta$；$\\sin(\\alpha-\\theta)=\\sin\\alpha\\cos\\theta-\\cos\\alpha\\sin\\theta$",
            how: "用②餘角關係 $\\sin(\\alpha+\\theta)=\\cos\\bigl((90^\\circ-\\alpha)-\\theta\\bigr)$ 代入③展開即得；口訣「正餘、餘正，中間同號」",
            use: "求 $15^\\circ$、$75^\\circ$ 的正弦；把 $a\\sin\\theta+b\\cos\\theta$（$a$、$b$ 是常數）提出 $\\sqrt{a^2+b^2}$ 再倒用這條和角公式，就是⑧的正餘弦疊合"
          },
          reduce: ["3", "2"], reduceNote: "$\\sin(\\alpha+\\theta)=\\cos\\bigl((90^\\circ-\\alpha)-\\theta\\bigr)$，套③與②即得",
          tools: ["trig/identity/和差角公式"], kp: ["T-04"],
          ex: [{ id: "ti4", q: "求 $\\sin 75^\\circ=\\sin(45^\\circ+30^\\circ)$", a: "$\\dfrac{\\sqrt6+\\sqrt2}{4}$", val: "sqrt(6)/4+sqrt(2)/4" }]
        }
      ]
    },
    {
      id: "tree", title: "背面　正切和差角、倍角、半角與疊合（角 $\\alpha$、$\\theta$、$\\varphi$ 是任意角，$a$、$b$、$r$ 是常數）", type: "table", back: true, rowH: 17,
      fields: [{ id: "formula", n: "公式" }, { id: "how", n: "怎麼從上一代推出來" }, { id: "use", n: "何時用與常見陷阱" }],
      rows: [
        {
          id: "5", n: "正切和角與差角",
          ans: {
            formula: "$\\tan(\\alpha+\\theta)=\\dfrac{\\tan\\alpha+\\tan\\theta}{1-\\tan\\alpha\\tan\\theta}$；$\\tan(\\alpha-\\theta)=\\dfrac{\\tan\\alpha-\\tan\\theta}{1+\\tan\\alpha\\tan\\theta}$（$\\tan\\alpha$、$\\tan\\theta$ 有意義且分母 $\\ne0$）",
            how: "由①商數關係把④除以③，分子分母同除以 $\\cos\\alpha\\cos\\theta$ 化為正切",
            use: "（補充）兩直線斜率分別為 $\\tan\\alpha$、$\\tan\\theta$ 時，夾角 $\\phi$ 滿足 $\\tan\\phi=\\lvert\\tan(\\alpha-\\theta)\\rvert$；特殊值：$\\alpha+\\theta=45^\\circ\\implies(1+\\tan\\alpha)(1+\\tan\\theta)=2$"
          },
          reduce: ["4", "3", "1"], reduceNote: "由①的 $\\tan=\\dfrac{\\sin}{\\cos}$，把④除以③再同除以 $\\cos\\alpha\\cos\\theta$",
          tools: ["trig/identity/正切和差角", "geometry/line/兩直線的夾角"], kp: ["T-04", "G-01"],
          ex: [
            { id: "ti5a", q: "$\\tan\\alpha=\\dfrac12$、$\\tan\\theta=\\dfrac13$，求 $\\tan(\\alpha+\\theta)$", a: "$1$", val: "1" },
            { id: "ti5b", q: "求 $\\tan 15^\\circ=\\tan(45^\\circ-30^\\circ)$", a: "$2-\\sqrt3$", val: "2-sqrt(3)" }
          ]
        },
        {
          id: "6", n: "二倍角公式（三種餘弦二倍角）",
          ans: {
            formula: "$\\sin 2\\theta=2\\sin\\theta\\cos\\theta$；$\\cos 2\\theta=\\cos^2\\theta-\\sin^2\\theta=2\\cos^2\\theta-1=1-2\\sin^2\\theta$；$\\tan 2\\theta=\\dfrac{2\\tan\\theta}{1-\\tan^2\\theta}$（$\\tan\\theta$ 有意義且 $\\tan^2\\theta\\ne1$）",
            how: "在③、④、⑤中令 $\\alpha=\\theta$（兩角相等），再用①的 $\\sin^2\\theta+\\cos^2\\theta=1$ 換掉其中一項得後兩種寫法",
            use: "把 $2\\theta$ 與 $\\theta$ 統一成同一個角；$\\cos 2\\theta$ 只含 $\\cos$ 或只含 $\\sin$ 的後兩種寫法最常用來換元求二次式最值"
          },
          reduce: ["3", "4", "5", "1"], reduceNote: "令 $\\alpha=\\theta$ 得第一式，再用①的 $\\sin^2\\theta+\\cos^2\\theta=1$ 換成 $2\\cos^2\\theta-1$ 與 $1-2\\sin^2\\theta$",
          tools: ["trig/identity/倍角公式"], kp: ["T-04"],
          ex: [
            { id: "ti6a", q: "$\\cos\\theta=\\dfrac35$，求 $\\cos 2\\theta$", a: "$-\\dfrac{7}{25}$", val: "-7/25" },
            { id: "ti6b", q: "求 $2\\sin 15^\\circ\\cos 15^\\circ$", a: "$\\dfrac12$", val: "1/2" }
          ]
        },
        {
          id: "7", n: "半角公式（二次降次公式）",
          ans: {
            formula: "降次：$\\cos^2\\theta=\\dfrac{1+\\cos 2\\theta}{2}$、$\\sin^2\\theta=\\dfrac{1-\\cos 2\\theta}{2}$；半角：$\\cos\\dfrac{\\theta}{2}=\\pm\\sqrt{\\dfrac{1+\\cos\\theta}{2}}$、$\\sin\\dfrac{\\theta}{2}=\\pm\\sqrt{\\dfrac{1-\\cos\\theta}{2}}$",
            how: "把⑥的 $\\cos 2\\theta=2\\cos^2\\theta-1=1-2\\sin^2\\theta$ 移項解出平方項就是降次公式（次方除以 $2$、角度乘以 $2$）；再把 $\\theta$ 換成 $\\dfrac{\\theta}{2}$ 並開根號，就是半角公式",
            use: "看到 $\\sin^2\\theta$、$\\cos^2\\theta$ 要算週期或極值時先降成一次的 $\\cos 2\\theta$；半角開根號的正負號看 $\\dfrac{\\theta}{2}$ 的象限（不是 $\\theta$ 的象限）"
          },
          reduce: ["6"], reduceNote: "就是⑥的餘弦二倍角公式倒過來寫：次方除以 $2$、角度乘以 $2$",
          tools: ["trig/identity/半角（降次）公式"], kp: ["T-04"],
          ex: [{ id: "ti7", q: "$180^\\circ < \\theta < 270^\\circ$ 且 $\\cos\\theta=-\\dfrac7{25}$，求 $\\cos\\dfrac{\\theta}{2}$", a: "$-\\dfrac35$", val: "-3/5" }]
        },
        {
          id: "8", n: "正餘弦疊合",
          ans: {
            formula: "$a$、$b$ 不全為 $0$，令振幅 $r=\\sqrt{a^2+b^2}$、輔助角 $\\varphi$ 滿足 $\\cos\\varphi=\\dfrac{a}{r}$、$\\sin\\varphi=\\dfrac{b}{r}$，則 $a\\sin\\theta+b\\cos\\theta=r\\sin(\\theta+\\varphi)$",
            how: "把 $a\\sin\\theta+b\\cos\\theta$ 提出 $r=\\sqrt{a^2+b^2}$，因 $\\left(\\dfrac{a}{r}\\right)^2+\\left(\\dfrac{b}{r}\\right)^2=1$（①），倒用④的正弦和角公式合為一項",
            use: "把同一角的 $\\sin\\theta$、$\\cos\\theta$ 一次組合合成一個波，立刻讀出最大值 $r$、最小值 $-r$ 與週期"
          },
          reduce: ["4", "1"], reduceNote: "提出 $r=\\sqrt{a^2+b^2}$ 後，由①配出輔助角 $\\varphi$，再倒用④的正弦和角公式",
          tools: ["trig/graph/正弦疊合"], kp: ["T-05"],
          ex: [{ id: "ti8", q: "求 $\\sqrt3\\sin\\theta-\\cos\\theta$ 的最大值", a: "$2$", val: "2" }]
        }
      ]
    }
  ],
  final: [
    {
      id: "root", q: "默寫推導鏈：從 $\\cos(\\alpha-\\theta)$ 出發，怎麼依序推出 $\\cos(\\alpha+\\theta)$、$\\sin(\\alpha+\\theta)$、$\\cos 2\\theta$ 的三種寫法、以及半角公式？",
      ans: "① 在 $\\cos(\\alpha-\\theta)$ 把 $\\theta$ 換成 $-\\theta$ 得 $\\cos(\\alpha+\\theta)$；② 用餘角 $\\sin(\\alpha+\\theta)=\\cos\\bigl((90^\\circ-\\alpha)-\\theta\\bigr)$ 推出 $\\sin(\\alpha+\\theta)$；③ 令 $\\alpha=\\theta$ 得 $\\cos 2\\theta=\\cos^2\\theta-\\sin^2\\theta$，再用 $\\sin^2\\theta+\\cos^2\\theta=1$ 換成 $2\\cos^2\\theta-1$ 與 $1-2\\sin^2\\theta$；④ 把後兩式移項解出 $\\cos^2\\theta$、$\\sin^2\\theta$（降次公式），再把 $\\theta$ 換成 $\\dfrac{\\theta}{2}$ 並開根號就是半角公式。",
      lines: 3
    },
    {
      id: "unify", q: "解三角方程式或求三角函數最值時，看到 $\\sin^2 x+\\cos x$、$a\\sin x+b\\cos x$、$\\sin 2x+\\cos x$ 各用哪一格統一？",
      ans: "$\\sin^2 x+\\cos x$ 用①把 $\\sin^2 x$ 換成 $1-\\cos^2 x$（化為 $\\cos x$ 的二次式）；$a\\sin x+b\\cos x$ 用⑧疊合成 $r\\sin(x+\\varphi)$（$r=\\sqrt{a^2+b^2}$、$\\varphi$ 是輔助角）；$\\sin 2x+\\cos x$ 用⑥把 $\\sin 2x$ 拆成 $2\\sin x\\cos x$ 提出 $\\cos x$。",
      lines: 3
    }
  ],
  pitfalls: [
    "餘弦和差角正負號記反：$\\cos(\\alpha+\\theta)$ 中間是減號，口訣「餘餘正正、中間變號」。",
    "半角公式開根號忘了看 $\\dfrac{\\theta}{2}$ 的象限：若 $180^\\circ < \\theta < 270^\\circ$，則 $90^\\circ < \\dfrac{\\theta}{2} < 135^\\circ$ 在第二象限，$\\cos\\dfrac{\\theta}{2} < 0$。",
    "已知 $\\sin\\theta+\\cos\\theta$ 求 $\\sin\\theta-\\cos\\theta$ 時開根號漏判正負：$\\sin\\theta-\\cos\\theta>0$ 等價於 $\\sin\\theta>\\cos\\theta$，即 $\\theta$ 的終邊在直線 $y=x$ 上方（$45^\\circ < \\theta < 225^\\circ$）。",
    "正切和角公式分子分母的加減號搞混：分子和括號內同號，分母和括號內反號（和角是 $1-\\tan\\alpha\\tan\\theta$、差角是 $1+\\tan\\alpha\\tan\\theta$）。",
    "$\\cos 2\\theta$ 和 $2\\cos\\theta$ 混為一談：角度不能直接提出括號外。"
  ]
});
