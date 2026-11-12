/* 牛夫子單色線條圖示（2026-11-07 起取代 emoji；老師裁定「工具分類畫線條圖示，主題深酒紅」）
 * 16×16、線寬 1.5、currentColor；樣式在 theme-cow.css 的 svg.ic／svg.ic-dom。
 *   NFZ_IC.svg(key)   → '<svg class="ic ic-dom">…</svg>'，key 可以是領域 id（number…）或資料裡原本的 emoji（🔢…）；認不得就回 ''
 *   NFZ_IC.label(icon, name) → 圖示＋名稱（HTML）；NFZ_IC.text(name) 給畫布、純文字用，不帶圖示
 * 資料檔 data/tm-*.js 的 icon 欄位先不改（錯題本也讀這幾檔），畫面一律經過這裡轉成線條圖示。 */
(function () {
  var P = {
    number:   'M5.5 2 4 14M12 2l-1.5 12M2.5 5.5h11M2 10.5h11',                                   // 數與式：井字
    equation: 'M8 2.5v10M5 13.5h6M3 4.5h10M3 4.5 1.5 8.5h3zM13 4.5l-1.5 4h3z',                     // 方程式與不等式：天平
    function: 'M2 2v12h12M3.5 12C6 4 9 3.5 13.5 3',                                                // 函數與圖形：座標軸＋曲線
    trig:     'M2.5 13.5h11L2.5 3zM2.5 10.5h3v3',                                                  // 三角：直角三角形
    geometry: 'M8 1.5v13M1.5 8h13M12.5 8a4.5 4.5 0 1 1-9 0a4.5 4.5 0 1 1 9 0',                     // 坐標幾何：座標＋圓
    vector:   'M2.5 13.5 13 3M7.5 3H13v5.5',                                                       // 向量：箭頭
    sequence: 'M2.5 14v-2.5M6 14V9M9.5 14V6M13 14V2.5',                                            // 數列：遞增長條
    prob:     'M3 3h10v10H3zM5.8 5.8h.01M10.2 10.2h.01M8 8h.01M10.2 5.8h.01M5.8 10.2h.01',          // 機率：骰子
    calculus: 'M10.5 2.5c-1.5-.8-2.5 0-2.7 1.5L6.8 12c-.2 1.5-1.2 2.3-2.7 1.5'                      // 微積分：積分號
  };
  var EMOJI = { '🔢': 'number', '⚖': 'equation', '📈': 'function', '📐': 'trig', '🧭': 'geometry', '➡': 'vector', '🔁': 'sequence', '🎲': 'prob', '∫': 'calculus' };
  function key(k) {
    k = String(k || '').replace(/️/g, '').trim();
    return P[k] ? k : (EMOJI[k] || '');
  }
  function svg(k) {
    k = key(k);
    return k ? '<svg class="ic ic-dom" viewBox="0 0 16 16" aria-hidden="true"><path d="' + P[k] + '"/></svg>' : '';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  window.NFZ_IC = {
    svg: svg,
    key: key,
    label: function (icon, name) { return svg(icon) + esc(name); },
    text: function (name) { return String(name == null ? '' : name); },
    /* 拿掉字串開頭的 emoji（含 FE0F 與後面的空白），給沒辦法改資料的地方用 */
    strip: function (s) { return String(s == null ? '' : s).replace(/^(?:[←-⇿⌀-➿⬀-⯿☀-⛿]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF])️?\s*/, ''); }
  };
})();
