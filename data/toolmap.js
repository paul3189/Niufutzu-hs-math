/* 高中數學｜工具地圖資料骨架
 * 各領域資料由 data/tm-*.js 依序呼叫 TM(...) 註冊。
 *
 * 領域 domain = {
 *   id, n(名稱), icon, color, ask(這個領域回答什麼問題),
 *   topics: [ {
 *      id, n(主題), kw:[觸發關鍵字], flow(破題思路一句), ref(章節連結), refName,
 *      tools: [ { n(工具名), f(公式 LaTeX), w(什麼時候用), l(限制/前提), t(常見錯誤), x(延伸), ref, refName } ]
 *   } ]
 * }
 */
window.TOOLMAP = { domains: [] };
window.TM = function (d) { window.TOOLMAP.domains.push(d); };
