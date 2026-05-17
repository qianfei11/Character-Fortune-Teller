/**
 * renderMd regex test suite
 * Run via: node tests/fortune.test.js
 */

// Copy of renderMd extracted from fortune.js for Node testing
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
      if (inTable) { tblLines.push(line); return null; }
      return line;
    }
    if (/^\|([^|]+\|)+/.test(line)) {
      inTable = true;
      tblLines.push(line);
      return null;
    }
    if (inTable) {
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

function assert(condition, msg) {
  if (!condition) throw new Error('FAIL: ' + msg)
  console.log('PASS: ' + msg)
}

function is(value) {
  return { toBe: (expected) => assert(value === expected, `${JSON.stringify(value)} === ${JSON.stringify(expected)}`) }
}

let tests = 0

// ── List wrapping ─────────────────────────────────────────────────────────────
tests++
const listInput = `- 项目一
- 项目二
- 项目三`
const listHtml = renderMd(listInput)
assert(listHtml.includes('<ul>'), 'dash list wrapped in <ul>')
assert(listHtml.includes('<li>项目一</li>'), 'dash list has first item')
assert(!listHtml.includes('</li><ul>'), 'no orphan closing tag from greedy regex')

tests++
const starInput = `* 甲
* 乙
* 丙`
const starHtml = renderMd(starInput)
assert(starHtml.includes('<ul>'), 'star list wrapped in <ul>')
assert(starHtml.includes('<li>甲</li>'), 'star list has first item')

// ── Table parsing ────────────────────────────────────────────────────────────
tests++
const tableInput = `| 甲 | 乙 | 丙 |
|---|---|---|
| 子 | 丑 | 寅 |
| 卯 | 辰 | 巳 |`
const tableHtml = renderMd(tableInput)
assert(tableHtml.includes('<table>'), 'table HTML generated')
assert(tableHtml.includes('<thead>'), 'thead present')
assert(tableHtml.includes('<tbody>'), 'tbody present')
assert(tableHtml.includes('<th>甲</th>'), 'th cell rendered')
assert(tableHtml.includes('<td>子</td>'), 'td cell rendered')
assert(!tableHtml.includes('|甲|'), 'pipe delimiters stripped from cells')

tests++
const wideCellInput = `| 操作类型 | 说明 |
|---|---|
| 官星旺 | 主事业顺利 |`
const wideCellHtml = renderMd(wideCellInput)
assert(wideCellHtml.includes('<td>官星旺</td>'), 'wide cell with space preserved')
assert(wideCellHtml.includes('<td>主事业顺利</td>'), 'wide cell with Chinese text')

// ── Block-level elements not double-wrapped ─────────────────────────────────
tests++
const h2Input = `## 二、日主与五行格局
这是一段正文。`
const h2Html = renderMd(h2Input)
assert(h2Html.includes('<h2>'), 'h2 not double-wrapped in <p>')
assert(!h2Html.includes('<p><h2>'), 'no <p><h2> orphan')

tests++
const hrInput = `---
下面是内容`
const hrHtml = renderMd(hrInput)
assert(hrHtml.includes('<hr>'), 'hr rendered')
assert(!hrHtml.includes('<p><hr>'), 'no <p><hr> orphan')

tests++
const ulInput = `- 列表项

普通段落`
const ulHtml = renderMd(ulInput)
assert(ulHtml.includes('<ul>'), 'ul not double-wrapped')
assert(!ulHtml.includes('<p><ul>'), 'no <p><ul> orphan')

// ── Paragraphs with newlines preserved ──────────────────────────────────────
tests++
const paraInput = `第一行
第二行
第三行`
const paraHtml = renderMd(paraInput)
assert(paraHtml.includes('<p>'), 'paragraph created')
assert(paraHtml.includes('<br>'), 'newline becomes <br>')
assert(!paraHtml.includes('</p><p>'), 'single paragraph for single block')

tests++
const blankSepInput = `第一段文字。

第二段文字。`
const blankSepHtml = renderMd(blankSepInput)
assert(blankSepHtml.includes('<p>'), 'paragraphs created from blank-separaetd blocks')
assert(blankSepHtml.split('<p>').length - 1 === 2, 'exactly two paragraphs')

// ── HTML entities ────────────────────────────────────────────────────────────
tests++
const entityInput = `3 < 5 & 5 > 3`
const entityHtml = renderMd(entityInput)
assert(entityHtml.includes('&lt;'), 'less-than escaped')
assert(entityHtml.includes('&gt;'), 'greater-than escaped')
assert(entityHtml.includes('&amp;'), 'ampersand escaped')

// ── Bold / Italic ───────────────────────────────────────────────────────────
tests++
const boldInput = `这是**粗体**文字`
const boldHtml = renderMd(boldInput)
assert(boldHtml.includes('<strong>粗体</strong>'), 'bold rendered')

tests++
const italicInput = `这是*斜体*文字`
const italicHtml = renderMd(italicInput)
assert(italicHtml.includes('<em>斜体</em>'), 'italic rendered')

// ── Full markdown output smoke test ─────────────────────────────────────────
tests++
const fullInput = `# 标题

## 子标题

**粗体**和*斜体*混用。

- 条目一
- 条目二

| 列1 | 列2 |
|---|---|
| A | B |

---

结尾分隔线。`
const fullHtml = renderMd(fullInput)
assert(fullHtml.includes('<h1>'), 'h1 rendered in full test')
assert(fullHtml.includes('<h2>'), 'h2 rendered in full test')
assert(fullHtml.includes('<table>'), 'table rendered in full test')
assert(fullHtml.includes('<hr>'), 'hr rendered in full test')

console.log(`\n✓ ${tests} tests passed`)