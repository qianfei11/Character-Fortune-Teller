/* ══════════════════════════════════════════════
   providers.js — LLM provider registry & API callers
   ══════════════════════════════════════════════ */

const PROVIDERS = {
  anthropic: {
    keyLabel:       'API Key（sk-ant-...）',
    keyPlaceholder: '输入您的 Anthropic API Key',
    showUrl:        false,
    models:         ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'],
    defaultModel:   'claude-opus-4-6',
    hint:           'Key 仅存于浏览器本地，不会上传至任何服务器。<a href="https://console.anthropic.com/settings/keys" target="_blank">获取 API Key →</a>',
    call:           callAnthropic
  },
  openai: {
    keyLabel:       'API Key（sk-...）',
    keyPlaceholder: '输入您的 OpenAI API Key',
    showUrl:        true,
    defaultUrl:     'https://api.openai.com/v1',
    models:         ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o3-mini', 'o1-mini'],
    defaultModel:   'gpt-4o',
    hint:           'Key 仅存于浏览器本地，不会上传至任何服务器。<a href="https://platform.openai.com/api-keys" target="_blank">获取 API Key →</a>',
    call:           callOpenAI
  },
  custom: {
    keyLabel:       'API Key（可留空）',
    keyPlaceholder: '输入 API Key',
    showUrl:        true,
    defaultUrl:     '',
    models:         null,
    defaultModel:   '',
    hint:           '支持任意 OpenAI 兼容接口，如 DeepSeek、Moonshot/Kimi、通义千问、智谱 GLM 等，填写对应 Base URL 与模型名即可。',
    call:           callOpenAI
  }
};

let currentProtocol = 'anthropic';

/* ── Protocol switcher ── */
function setProtocol(proto) {
  currentProtocol = proto;
  localStorage.setItem('llm_protocol', proto);
  const p = PROVIDERS[proto];

  ['anthropic', 'openai', 'custom'].forEach(id =>
    document.getElementById('proto-' + id).classList.toggle('active', id === proto)
  );

  document.getElementById('keyLabel').textContent  = p.keyLabel;
  document.getElementById('apiKey').placeholder    = p.keyPlaceholder;
  document.getElementById('apiKey').value          = localStorage.getItem('llm_key_' + proto) || '';

  const urlField = document.getElementById('urlField');
  urlField.style.display = p.showUrl ? '' : 'none';
  if (p.showUrl) {
    document.getElementById('baseUrl').value =
      localStorage.getItem('llm_url_' + proto) ?? p.defaultUrl ?? '';
  }

  const sel = document.getElementById('modelSelect');
  const inp = document.getElementById('modelInput');
  if (p.models) {
    sel.style.display = ''; inp.style.display = 'none';
    sel.innerHTML = p.models.map(m => `<option value="${m}">${m}</option>`).join('');
    sel.value = localStorage.getItem('llm_model_' + proto) || p.defaultModel;
  } else {
    sel.style.display = 'none'; inp.style.display = '';
    inp.value = localStorage.getItem('llm_model_' + proto) || '';
  }

  document.getElementById('providerHint').innerHTML = p.hint;
}

/* ── Save / clear config ── */
function saveConfig() {
  const proto = currentProtocol;
  const p     = PROVIDERS[proto];
  const key   = document.getElementById('apiKey').value.trim();
  if (!key && proto !== 'custom') { showError('请先输入 API Key'); return; }
  localStorage.setItem('llm_key_' + proto, key);
  if (p.showUrl)
    localStorage.setItem('llm_url_' + proto, document.getElementById('baseUrl').value.trim());
  const model = p.models
    ? document.getElementById('modelSelect').value
    : document.getElementById('modelInput').value.trim();
  localStorage.setItem('llm_model_' + proto, model);
  showError('', '✓ 配置已保存');
}

function clearConfig() {
  const proto = currentProtocol;
  localStorage.removeItem('llm_key_'   + proto);
  localStorage.removeItem('llm_url_'   + proto);
  localStorage.removeItem('llm_model_' + proto);
  setProtocol(proto);
}

/* ── Anthropic API caller ── */
async function callAnthropic(prompt, key, model, _baseUrl) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':   'application/json',
      'x-api-key':       key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model, max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return data.content?.[0]?.text || '';
}

/* ── OpenAI-compatible API caller ── */
async function callOpenAI(prompt, key, model, baseUrl) {
  const url  = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '') + '/chat/completions';
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model, max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || '';
}

/* ── Unified LLM dispatcher ── */
async function callLLM(prompt) {
  const proto = currentProtocol;
  const p     = PROVIDERS[proto];
  const key   = document.getElementById('apiKey').value.trim()
                  || localStorage.getItem('llm_key_' + proto) || '';
  if (!key && proto !== 'custom') throw new Error('请先输入 API Key');
  const model = p.models
    ? document.getElementById('modelSelect').value
    : document.getElementById('modelInput').value.trim();
  if (!model) throw new Error('请输入或选择模型名称');
  const baseUrl = p.showUrl
    ? (document.getElementById('baseUrl').value.trim()
        || localStorage.getItem('llm_url_' + proto)
        || p.defaultUrl || '')
    : '';
  return p.call(prompt, key, model, baseUrl);
}
