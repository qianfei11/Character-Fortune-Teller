/* ══════════════════════════════════════════════
   fortune.js — BaZi (八字) logic
   Prompt building · pillar parsing · markdown rendering
   ══════════════════════════════════════════════ */

/* ── Lightweight Markdown renderer ── */
function renderMd(raw) {
  let h = raw
    .replace(/&/g,  '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/^---+$/gm,       '<hr>')
    .replace(/^[\*\-] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, m => '<ul>' + m + '</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g,     '<br>');
  h = '<p>' + h + '</p>';
  h = h.replace(/<p>\s*(<h[123]>|<hr>|<ul>)/g,       '$1');
  h = h.replace(/(<\/h[123]>|<\/ul>|<hr>)\s*<\/p>/g, '$1');
  return h;
}

/* ── Collect selected question topics ── */
function getTopics() {
  const active = [...document.querySelectorAll('.tag.active')].map(t => t.textContent.trim());
  const extra  = document.getElementById('question').value.trim();
  const parts  = [];
  if (active.length) parts.push(active.join('、'));
  if (extra)         parts.push(extra);
  return parts.join('；') || '综合命格总览';
}

/* ── Read manual-mode pillar inputs ── */
function getManualPillars() {
  const get = id => document.getElementById(id).value;
  const ys = get('yearStem'),  yb = get('yearBranch');
  const ms = get('monStem'),   mb = get('monBranch');
  const ds = get('dayStem'),   db = get('dayBranch');
  const hs = get('hourStem'),  hb = get('hourBranch');
  if (!ys || !yb || !ms || !mb || !ds || !db) return null;
  return {
    year:  [ys, yb],
    month: [ms, mb],
    day:   [ds, db],
    hour:  hs && hb ? [hs, hb] : ['（未知）', '（未知）']
  };
}

/* ── Render pillar cards in the result area ── */
function showPillars(p) {
  if (!p) { document.getElementById('pillarDisplay').style.display = 'none'; return; }
  document.getElementById('pillarDisplay').style.display = 'flex';
  document.getElementById('pYS').textContent = p.year[0];
  document.getElementById('pYB').textContent = p.year[1];
  document.getElementById('pMS').textContent = p.month[0];
  document.getElementById('pMB').textContent = p.month[1];
  document.getElementById('pDS').textContent = p.day[0];
  document.getElementById('pDB').textContent = p.day[1];
  document.getElementById('pHS').textContent = p.hour[0];
  document.getElementById('pHB').textContent = p.hour[1];
}

/* ── Build the LLM prompt ── */
function buildPrompt(info, topics) {
  return `你是一位精通中国传统命理的八字大师，拥有深厚的易学功底。请根据以下信息进行详细、专业的命格分析。

【基本信息】
${info}

【所问方面】
${topics}

请按以下结构详细作答（使用 Markdown 格式）：

## 一、八字排盘

列出完整的年柱、月柱、日柱、时柱（若通过生辰日期推算，请先完成推算再分析），并标注每个天干地支对应的五行属性、阴阳。

## 二、日主与五行格局

- 日主天干及五行属性
- 整体五行强弱分布（金木水火土各占比例/强弱）
- 命格格局（如正官格、财官格、食神格、伤官格、印绶格等）

## 三、大运流年（简要）

推算出当前所在大运柱，并说明当下的运势走向。

## 四、针对所问的重点解读

根据用户提问的方面，结合命局给出具体、有针对性的分析（300字以上）。

## 五、开运建议

- 喜用神（对命主有利的五行）
- 忌神（需要规避的五行）
- 开运方位、颜色、数字
- 适合的职业方向

---

请用中文作答，语言流畅、深入浅出，兼顾传统文化底蕴与现代生活实用性。`;
}
