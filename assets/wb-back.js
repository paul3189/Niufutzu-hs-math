/* 「← 回錯題本」按鈕（2026-10-18）
 * 從牛夫子錯題本（wrongbook.niufutzu.com）連過來才顯示，其他人看不到。
 * 判斷：網址帶 ?wb=頁名（錯題本連出來時加的，例如 wb=wrongbook-analysis），或上一頁是錯題本網域；
 * 記在 sessionStorage，在這個網站裡換頁也會一直顯示，按下就回到原本那一頁。
 * 國中工具地圖、高中工具地圖、高中練習本共用同一份（內容要一致）。 */
(function () {
  "use strict";
  var KEY = "wb.back", WB = "https://wrongbook.niufutzu.com/", back = null;
  try {
    var m = /[?&]wb=([a-z][a-z-]{0,30})\b/.exec(location.search);
    if (m) { back = WB + (m[1] === "index" ? "" : m[1]); sessionStorage.setItem(KEY, back); }
    else back = sessionStorage.getItem(KEY);
    if (!back && /^https:\/\/wrongbook\.niufutzu\.com\//.test(document.referrer || "")) {
      back = document.referrer.replace(/\/$/, "/wrongbook");
      sessionStorage.setItem(KEY, back);
    }
  } catch (e) {}
  if (!back) return;
  function add() {
    if (document.getElementById("wbBack")) return;
    var a = document.createElement("a");
    a.id = "wbBack"; a.href = back; a.textContent = "← 回錯題本";
    a.setAttribute("style", "position:fixed;left:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:9999;" +
      "background:#5c222b;color:#fff;padding:8px 14px;border-radius:999px;font:600 14px/1.2 'Noto Sans TC','Microsoft JhengHei',sans-serif;" +
      "text-decoration:none;box-shadow:0 2px 10px rgba(0,0,0,.25);opacity:.95");
    document.body.appendChild(a);
  }
  if (document.body) add(); else document.addEventListener("DOMContentLoaded", add);
})();
