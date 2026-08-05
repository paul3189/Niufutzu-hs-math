/* 長公式自動換列（MathFit）
 *
 * KaTeX 的展示型數學（$$…$$）不會自己斷行，太長就只能左右拉捲軸——手機上尤其難用。
 * 這支檔案在算式的「自然停頓點」把它切成好幾列，包進 aligned 重畫，讓公式一次看完整。
 * 切點依序是：
 *
 *   ① 分號 ;                        ② \quad \qquad
 *   ③ 關係符號 \iff \Rightarrow …    ④ 頂層的逗號
 *   ⑤ 等號前                        ⑥ 加減號前（課本的標準斷法）
 *   ⑦ \text{} 裡的中文標點 、，；。：）」
 *
 * 真的切不開的（例如一整句沒有標點的敘述）才退而求其次縮小字級，總之不留橫向捲軸。
 *
 * 原始 LaTeX 直接從 KaTeX 產生的 MathML annotation 讀回來，所以資料檔完全不用改；
 * 拿掉這支檔案，全部會退回原本「可以左右拉」的樣子，不會壞掉。
 */
(function () {
  "use strict";

  var ATTR = "data-tex0";        // 記住原始式子，轉螢幕方向時才能重新排

  /* 在「頂層」（不在括號、不在 \begin…\end 裡）切開 */
  function splitTeX(tex, level) {
    var SEP_CMD2 = ["\\quad", "\\qquad"];
    var SEP_REL = ["\\iff", "\\Rightarrow", "\\Longrightarrow", "\\Leftrightarrow", "\\to"];
    var cmdSeps = [].concat(level >= 2 ? SEP_CMD2 : [], level >= 3 ? SEP_REL : []);
    var chSeps = [";"].concat(level >= 4 ? [","] : []);
    var preCh = [].concat(level >= 5 ? ["="] : [], level >= 6 ? ["+", "-"] : []);
    var out = [], cur = "", depth = 0, env = 0, i = 0;

    function push(s) {
      s = s.trim();
      if (s.slice(-1) === "\\") s = s.slice(0, -1).trim();   // 別留下孤零零的反斜線（\␣ 的空白被 trim 掉）
      if (s) out.push(s);
    }
    while (i < tex.length) {
      var c = tex[i];
      if (c === "\\") {
        var be = /^\\(begin|end)\{[^}]*\}/.exec(tex.slice(i));
        if (be) { env += (be[1] === "begin" ? 1 : -1); cur += be[0]; i += be[0].length; continue; }
        var tok = (/^\\[a-zA-Z]+|^\\[\s\S]/.exec(tex.slice(i)) || ["\\"])[0];
        if (tok === "\\left" || tok === "\\right") { cur += tok; i += tok.length; continue; }
        if (depth === 0 && env === 0 && cmdSeps.indexOf(tok) >= 0) {
          // 關係符號留到「下一列的開頭」比較好讀；\quad 只是空白，直接丟掉
          if (SEP_REL.indexOf(tok) >= 0) { push(cur); cur = tok + " "; }
          else { push(cur); cur = ""; }
          i += tok.length; continue;
        }
        cur += tok; i += tok.length; continue;
      }
      if (c === "{" || c === "(" || c === "[") { depth++; cur += c; i++; continue; }
      if (c === "}" || c === ")" || c === "]") { depth--; cur += c; i++; continue; }
      if (depth === 0 && env === 0 && chSeps.indexOf(c) >= 0) { push(cur + c); cur = ""; i++; continue; }
      if (depth === 0 && env === 0 && preCh.indexOf(c) >= 0 && cur.trim()) {
        var prev = cur.replace(/\s+$/, "").slice(-1);
        if ("+-=<>,;({[".indexOf(prev) < 0) { push(cur); cur = c + " "; i++; continue; }   // 正負號不是斷點
      }
      cur += c; i++;
    }
    push(cur);
    return out;
  }

  /* 把一列再依 \text{} 裡的中文標點拆成更小的單位 */
  function textAtoms(row) {
    var out = [], cur = "", i = 0;
    while (i < row.length) {
      if (row.slice(i, i + 6) === "\\text{") {
        var j = i + 6, d = 1;
        while (j < row.length && d > 0) {
          if (row[j] === "{") d++; else if (row[j] === "}") d--;
          if (d > 0) j++;
        }
        var parts = row.slice(i + 6, j).split(/(?<=[、，；。：）」])/);
        if (parts.length > 1) {
          if (cur.trim()) { out.push(cur); cur = ""; }
          parts.forEach(function (p) { if (p) out.push("\\text{" + p + "}"); });
        } else cur += row.slice(i, j + 1);
        i = j + 1; continue;
      }
      cur += row[i]; i++;
    }
    if (cur.trim()) out.push(cur);
    return out;
  }

  function buildAligned(rows, indent) {
    return "\\begin{aligned}" + rows.map(function (r, k) {
      // 續行（以關係／運算符號開頭）縮排，獨立子句不縮排 —— 讀起來才像課本
      var cont = indent && k > 0 &&
        /^(=|\+|-|\\iff|\\Rightarrow|\\Longrightarrow|\\Leftrightarrow|\\to)/.test(r);
      return (cont ? "&\\quad " : "&") + r;
    }).join("\\\\") + "\\end{aligned}";
  }

  /* 把 holder 重畫成 tex，回傳「是否塞得下」 */
  function tryRender(holder, tex) {
    try { window.katex.render(tex, holder, { displayMode: true, throwOnError: true }); }
    catch (e) { return false; }
    var inner = holder.querySelector(".katex-display") || holder;
    return inner.scrollWidth <= inner.clientWidth + 1;
  }

  /* 貪心地把小片段併回「塞得下」的列，像文字自動換行那樣 */
  function pack(holder, pieces, joiner) {
    var rows = [], cur = "";
    pieces.forEach(function (p) {
      if (!cur) { cur = p; return; }
      var merged = cur + (joiner || "") + p;
      if (tryRender(holder, buildAligned([merged], false))) cur = merged;
      else { rows.push(cur); cur = p; }
    });
    if (cur) rows.push(cur);
    return rows;
  }

  /* 重排單一個 holder（裡面裝著一個 .katex-display） */
  function reflow(holder, tex) {
    holder.style.fontSize = "";
    var hasEnv = /\\begin\{/.test(tex);   // 有 cases／matrix 等環境時不能亂拆 \text{}

    // ① 依序嘗試各級切點
    //    lv 1–4（分號、\quad、關係符號、逗號）是「語意」斷點，一個子句一列；
    //    lv 5–6（等號、加減號）是「排版」斷點，要像文字換行那樣併滿再換，
    //    否則會變成每個加號都自成一列，反而更難讀。
    var best = null;
    for (var lv = 1; lv <= 6; lv++) {
      var rows = splitTeX(tex, lv);
      if (rows.length < 2) continue;
      if (lv >= 5) rows = pack(holder, rows, " ");
      best = rows;
      if (rows.length < 2) continue;
      if (tryRender(holder, buildAligned(rows, true))) return;
      if (tryRender(holder, buildAligned(rows, false))) return;
    }

    // ② 還太寬 → 把每一列再依中文標點拆細，一樣併回塞得下的列
    var packed = [];
    if (!hasEnv) {
      (best || [tex]).forEach(function (r) {
        var at = textAtoms(r);
        if (at.length < 2) { packed.push(r); return; }
        pack(holder, at, "").forEach(function (x) { packed.push(x); });
      });
      if (packed.length > 1 && tryRender(holder, buildAligned(packed, false))) return;
    }

    // ③ 真的切不開（整句沒有標點、或括號裡的長算式）→ 縮小字級，總之不留橫向捲軸
    var finalTex = packed.length > 1 ? buildAligned(packed, false)
      : (best && best.length > 1 ? buildAligned(best, false) : tex);
    var scales = [1, .95, .9, .85, .8, .75, .7];
    for (var s = 0; s < scales.length; s++) {
      holder.style.fontSize = scales[s] === 1 ? "" : (scales[s] * 100) + "%";
      if (tryRender(holder, finalTex) || s === scales.length - 1) return;
    }
  }

  /* 對 root 底下所有溢出的展示型數學自動換列 */
  function fit(root) {
    root = root || document.body;
    if (!root || !window.katex) return;

    // 已經重排過、但視窗變窄（例如手機轉直）而又溢出的，用原始式子重排一次。
    // 變寬時不主動還原成單列——維持已經排好的樣子，不會有「排版跳來跳去」的問題。
    [].slice.call(root.querySelectorAll("[" + ATTR + "]")).forEach(function (holder) {
      var inner = holder.querySelector(".katex-display");
      if (inner && inner.scrollWidth <= inner.clientWidth + 1) return;
      reflow(holder, holder.getAttribute(ATTR));
    });

    [].slice.call(root.querySelectorAll(".katex-display")).forEach(function (disp) {
      if (disp.parentNode && disp.parentNode.hasAttribute && disp.parentNode.hasAttribute(ATTR)) return;
      if (disp.scrollWidth <= disp.clientWidth + 1) return;
      var ann = disp.querySelector('annotation[encoding="application/x-tex"]');
      if (!ann) return;
      var tex = ann.textContent;
      var holder = document.createElement("div");
      holder.setAttribute(ATTR, tex);
      disp.parentNode.replaceChild(holder, disp);
      reflow(holder, tex);
    });
  }

  window.MathFit = { fit: fit, split: splitTeX };

  /* KaTeX 的 auto-render 是 defer 執行的，等 DOM 與字型都就緒再排一次 */
  function autoFit() { try { fit(document.body); } catch (e) {} }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoFit);
  else autoFit();
  window.addEventListener("load", autoFit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(autoFit);

  /* 轉螢幕方向／改變視窗大小時重排（節流） */
  var t = null;
  function later() { clearTimeout(t); t = setTimeout(autoFit, 200); }
  window.addEventListener("resize", later);
  window.addEventListener("orientationchange", later);
})();
