/* ══════════════════════════════════════════════
   app.js — Main application logic
   Bubble background · UI state · submit handler
   ══════════════════════════════════════════════ */

/* ── Floating pastel bubble background ── */
(function () {
  const canvas = document.getElementById('bubbles');
  const ctx    = canvas.getContext('2d');

  // RGB triplets matching the macaron palette
  const COLORS = [
    [109, 204, 170],  // mint
    [184, 158, 224],  // lavender
    [245, 215, 110],  // yellow
    [240, 160, 192],  // pink
    [249, 192, 154],  // peach
  ];

  let bubbles = [];

  function newBubble(atBottom) {
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x:           Math.random() * canvas.width,
      y:           atBottom ? canvas.height + 45 : Math.random() * canvas.height,
      r:           Math.random() * 30 + 8,
      vy:          Math.random() * 0.38 + 0.12,
      alpha:       Math.random() * 0.16 + 0.04,
      wobble:      Math.random() * Math.PI * 2,
      wobbleSpeed: (Math.random() - 0.5) * 0.018,
      c,
    };
  }

  function resize() {
    canvas.width  = innerWidth;
    canvas.height = innerHeight;
    bubbles = Array.from({ length: 20 }, () => newBubble(false));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const b of bubbles) {
      b.y      -= b.vy;
      b.wobble += b.wobbleSpeed;
      const x   = b.x + Math.sin(b.wobble * 2.5) * 18;
      if (b.y + b.r < -40) Object.assign(b, newBubble(true));
      ctx.beginPath();
      ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${b.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
})();

/* ── Birth-info tab switch ── */
function switchTab(t) {
  document.getElementById('panel-date').style.display   = t === 'date'   ? '' : 'none';
  document.getElementById('panel-manual').style.display = t === 'manual' ? '' : 'none';
  document.getElementById('tab-date').classList.toggle('active',   t === 'date');
  document.getElementById('tab-manual').classList.toggle('active', t === 'manual');
}

/* ── Question tag toggle ── */
function toggleTag(el) {
  el.classList.toggle('active');
}

/* ── Collapsible API config panel ── */
function toggleApiConfig() {
  const grid   = document.getElementById('apiBodyGrid');
  const header = document.getElementById('apiToggle');
  const isOpen = grid.classList.contains('open');
  grid.classList.toggle('open',   !isOpen);
  header.classList.toggle('open', !isOpen);
  header.setAttribute('aria-expanded', String(!isOpen));
}

/* ── Error / info feedback ── */
function showError(msg, info = '') {
  const box = document.getElementById('errorBox');
  if (msg) {
    box.textContent = msg;
    box.style.background   = '';
    box.style.borderColor  = '';
    box.style.color        = '';
    box.classList.add('show');
  } else if (info) {
    box.textContent = info;
    box.style.background  = 'var(--mint-light)';
    box.style.borderColor = 'var(--mint)';
    box.style.color       = 'var(--mint-dark)';
    box.classList.add('show');
    setTimeout(() => box.classList.remove('show'), 2500);
  } else {
    box.classList.remove('show');
  }
}

/* ── Main submit handler ── */
async function submit() {
  showError('');

  const isManual = document.getElementById('tab-manual').classList.contains('active');
  let info    = '';
  let pillars = null;

  if (isManual) {
    pillars = getManualPillars();
    if (!pillars) { showError('请至少填写年柱、月柱、日柱的天干地支'); return; }
    const gender = document.getElementById('gender2').value;
    info = `性别：${gender}\n八字：年柱【${pillars.year.join('')}】月柱【${pillars.month.join('')}】日柱【${pillars.day.join('')}】时柱【${pillars.hour.join('')}】`;
  } else {
    const date = document.getElementById('birthDate').value;
    if (!date) { showError('请选择出生日期'); return; }
    const hourVal = document.getElementById('birthHour').value;
    const hourStr = hourVal
      ? document.getElementById('birthHour').selectedOptions[0].text
      : '时辰不详（以子时计算）';
    const gender = document.getElementById('gender').value;
    const place  = document.getElementById('birthPlace').value.trim();
    info = `性别：${gender}\n出生日期：${date}\n出生时辰：${hourStr}${place ? '\n出生地：' + place : ''}`;
  }

  const topics = getTopics();

  document.querySelector('.btn-submit').disabled = true;
  document.getElementById('loading').classList.add('show');
  document.getElementById('result').classList.remove('show');

  try {
    const text = await callLLM(buildPrompt(info, topics));

    // Try to extract pillar characters from AI text (date mode only)
    if (!isManual) {
      const m = text.match(
        /年柱[：:【\s]*([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])[^月]*月柱[：:【\s]*([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])[^日]*日柱[：:【\s]*([甲乙丙丁戊己庚辛壬癸])([子丑寅卯辰巳午未申酉戌亥])[^时]*时柱[：:【\s]*([甲乙丙丁戊己庚辛壬癸]?)([子丑寅卯辰巳午未申酉戌亥]?)/
      );
      if (m) {
        pillars = {
          year:  [m[1], m[2]], month: [m[3], m[4]],
          day:   [m[5], m[6]], hour:  [m[7] || '—', m[8] || '—']
        };
      }
    }

    showPillars(pillars);
    document.getElementById('resultSub').textContent =
      info.split('\n')[0] + ' · ' + new Date().toLocaleDateString('zh-CN');
    document.getElementById('resultBody').innerHTML = renderMd(text);
    document.getElementById('result').classList.add('show');
    document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (e) {
    showError('解析失败：' + e.message);
  } finally {
    document.querySelector('.btn-submit').disabled = false;
    document.getElementById('loading').classList.remove('show');
  }
}

/* ── Initialise on DOM ready ── */
window.addEventListener('DOMContentLoaded', () => {
  // Migrate legacy anthropic_key if present
  const legacy = localStorage.getItem('anthropic_key');
  if (legacy && !localStorage.getItem('llm_key_anthropic')) {
    localStorage.setItem('llm_key_anthropic', legacy);
  }
  setProtocol(localStorage.getItem('llm_protocol') || 'anthropic');
});
