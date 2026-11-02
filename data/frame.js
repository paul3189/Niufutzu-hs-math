/* 架構重建卡：資料總入口（2026-10-29 起）
 * 每張卡一個檔 data/frame-<id>.js，內容是 FRAME({...})。格式說明見 _scripts/frame_cards/FORMAT.md。
 * 紙本（_scripts/frame_cards/build_print.js）、之後的地圖新頁型、道場「填架構」都讀同一份資料。
 * 國中也用同一套格式（stage: "jh"）。
 */
window.FRAMES = window.FRAMES || {};
window.FRAME = function (f) { window.FRAMES[f.id] = f; };
