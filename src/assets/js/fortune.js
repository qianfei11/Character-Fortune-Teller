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
    .replace(/(<li>(?:(?!<\/li>).)*<\/li>)/g, m => '<ul>' + m + '</ul>');
  // Table parsing: process line-by-line to handle ^ anchor correctly in multiline strings
  const tableLines = h.split('\n');
  let inTable = false;
  let tblLines = [];
  h = tableLines.map(line => {
    if (/^\|[\s\-:|]+\|$/.test(line)) {
      // Separator row
      if (inTable) { tblLines.push(line); return null; }
      return line;
    }
    if (/^\|([^|]+\|)+/.test(line)) {
      inTable = true;
      tblLines.push(line);
      return null;
    }
    if (inTable) {
      // Flush accumulated table rows
      inTable = false;
      const sepIdx = tblLines.findIndex(l => /^\|[\s\-:|]+\|$/.test(l));
      if (sepIdx < 0) { const r = tblLines.join('\n'); tblLines = []; return r; }
      const parseRow = (l, tag) => {
        const cells = l.split('|').slice(1, -1).map(c => c.trim());
        return '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
      };
      const heads = tblLines.slice(0, sepIdx);
      const rows  = tblLines.slice(sepIdx + 1);
      let tbl = '<table>';
      if (heads.length) tbl += '<thead>' + heads.map(l => parseRow(l, 'th')).join('') + '</thead>';
      if (rows.length)  tbl += '<tbody>' + rows.map(l => parseRow(l, 'td')).join('') + '</tbody>';
      tbl += '</table>';
      tblLines = [];
      return tbl;
    }
    return line;
  }).join('\n');
  // Flush any trailing table
  if (inTable && tblLines.length) {
    const sepIdx = tblLines.findIndex(l => /^\|[\s\-:|]+\|$/.test(l));
    const parseRow = (l, tag) => {
      const cells = l.split('|').slice(1, -1).map(c => c.trim());
      return '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
    };
    const heads = tblLines.slice(0, sepIdx < 0 ? 0 : sepIdx);
    const rows  = tblLines.slice(sepIdx < 0 ? 0 : sepIdx + 1);
    let tbl = '<table>';
    if (heads.length) tbl += '<thead>' + heads.map(l => parseRow(l, 'th')).join('') + '</thead>';
    if (rows.length)  tbl += '<tbody>' + rows.map(l => parseRow(l, 'td')).join('') + '</tbody>';
    tbl += '</table>';
    h += '\n' + tbl;
  }
  h = h
    .replace(/\n{2,}/g, '\n\n')
    .split(/\n\n/)
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (/^<(h[123]|hr|ul|ol|table|blockquote)/.test(block)) return block;
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('');
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

列出完整的年柱、月柱、日柱、时柱，并标注每个天干地支对应的五行属性、阴阳。

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

请在分析报告的末尾，以纯文本形式返回以下JSON对象（不 markdown 代码块包裹）：
{"year":["天干","地支"],"month":["天干","地支"],"day":["天干","地支"],"hour":["天干","地支"]}
例如：{"year":["甲","子"],"month":["丙","寅"],"day":["戊","戌"],"hour":["辛","酉"]}

---

请用中文作答，语言流畅、深入浅出，兼顾传统文化底蕴与现代生活实用性。`;
}
