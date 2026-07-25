/* ---------- SHAP 红/蓝 ---------- */
const SHAP_RED   = '#FF0D57';
const SHAP_BLUE  = '#1E88E5';
const SHAP_RED_BG   = 'rgba(255,13,87,0.10)';
const SHAP_BLUE_BG  = 'rgba(30,136,229,0.10)';

/* ---------- utils ---------- */
function fmt(v, d) { return (v === null || v === undefined || Number.isNaN(Number(v))) ? '—' : Number(v).toFixed(d || 3); }

/* ---------- canvas ---------- */
function ctx(id, cw, ch) {
  const c = document.querySelector(`#${id}`);
  const r = window.devicePixelRatio || 1;
  const w = c.clientWidth || cw || 700;
  const h = c.clientHeight || ch || 400;
  c.width = w * r; c.height = h * r;
  c.style.width = w + 'px'; c.style.height = h + 'px';
  c.getContext('2d').scale(r, r);
  return { c: c.getContext('2d'), w, h };
}

/* ---------- 显隐控制（纯 style.display，与选填特征完全一致） ---------- */
const panel  = () => document.querySelector('#resultPanel');
const bar    = () => document.querySelector('#resultToggleBar');
const btn    = () => document.querySelector('#toggleResult');

function showResult() {
  panel().style.display = '';
  bar().style.display = '';
  btn().textContent = '收起结果';
}

function toggleResultPanel() {
  if (panel().style.display === 'none') {
    panel().style.display = '';
    btn().textContent = '收起结果';
    panel().scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    panel().style.display = 'none';
    btn().textContent = '展开结果';
  }
}

function clearResult() {
  panel().style.display = 'none';
  bar().style.display = 'none';
}

/* ---------- 主渲染 ---------- */
function renderPrediction(result) {
  const prob = Number(result.probability);
  const pos = result.classification === '阳性';
  document.querySelector('#resultSummary').innerHTML = `<div class="result-lead ${pos ? 'positive' : 'negative'}"><div class="eyebrow">尿路结石患病风险概率</div><strong>${(prob * 100).toFixed(1)}%</strong><span>${result.classification}（阈值 ${result.threshold}）</span></div>`;
  document.querySelector('#imputationNote').hidden = true;
  renderProbs(result);
  renderTable(result);
  showResult();
  requestAnimationFrame(() => { renderForcePlot(result); renderWaterfall(result); });
  panel().scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- 概率水平条（SHAP 红/蓝） ---------- */
function renderProbs(result) {
  const models = result.base_model_order.map((name, i) => ({ name, pct: result.base_model_probabilities[i] * 100 }));
  document.querySelector('#baseProbabilities').innerHTML = models.map(m => {
    const w = Math.max(m.pct, 3);
    const color = m.pct >= 50 ? SHAP_RED : SHAP_BLUE;
    return `<div class="prob-row"><span class="prob-label">${m.name}</span><div class="prob-bar-track"><div class="prob-bar-fill" style="width:${w}%;background:${color}"></div></div><strong class="prob-val">${m.pct.toFixed(1)}%</strong></div>`;
  }).join('');
}

/* ---------- 贡献表 ---------- */
function renderTable(result) {
  const rows = [...result.shap.contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  document.querySelector('#shapTableBody').innerHTML = rows.map((item, i) => `<tr><td>${i + 1}</td><td>${item.label}</td><td>${item.source_type === 'base_model_probability' ? '基模型概率' : '临床直接项'}</td><td>${fmt(item.value)}</td><td class="${item.shap_value >= 0 ? 'contribution-positive' : 'contribution-negative'}">${item.shap_value >= 0 ? '+' : ''}${fmt(item.shap_value, 5)}</td></tr>`).join('');
}

/* ========== SHAP Force Plot（单样本标准红蓝推力图） ========== */
function renderForcePlot(result) {
  const { c, w, h } = ctx('forcePlot', 720, 130);
  const items = [...result.shap.contributions]
    .sort((a, b) => a.shap_value - b.shap_value); // 负→正
  if (!items.length) return;

  const baseV = result.shap.base_value;
  const cum = [baseV];
  for (let i = 0; i < items.length; i++) cum.push(cum[i] + items[i].shap_value);
  const xMin = cum[0], xMax = cum[cum.length - 1];
  const pad = Math.max((xMax - xMin) * 0.08, 0.02);
  const L = 28, R = w - 28, barT = 44, barH = 36;
  const xf = (v) => L + ((v - xMin + pad) / (xMax - xMin + 2 * pad)) * (R - L);

  c.clearRect(0, 0, w, h);

  // 细灰底条
  c.fillStyle = '#eef1f0'; c.beginPath();
  c.roundRect(L, barT, R - L, barH, 3); c.fill();

  // 红/蓝特征段
  for (let i = 0; i < items.length; i++) {
    const x0 = xf(cum[i]), x1 = xf(cum[i + 1]);
    if (Math.abs(x1 - x0) < 0.5) continue;
    c.fillStyle = items[i].shap_value >= 0 ? SHAP_RED : SHAP_BLUE;
    c.beginPath(); c.roundRect(x0, barT, x1 - x0, barH, 2); c.fill();

    // 段内标签（如果能放下）
    const segW = Math.abs(x1 - x0);
    if (segW > 28) {
      const midX = (x0 + x1) / 2;
      c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = '9px system-ui';
      const lbl = items[i].key.length > 10 ? items[i].key.slice(0, 9) + '…' : items[i].key;
      c.fillText(lbl, midX, barT + barH / 2 + 3);
    }
  }

  // 基线值竖线 + 标签
  const bx = xf(baseV);
  c.strokeStyle = '#222'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(bx, barT - 6); c.lineTo(bx, barT + barH + 6); c.stroke();
  c.fillStyle = '#222'; c.textAlign = 'center'; c.font = 'bold 10px ui-monospace';
  c.fillText(`E[f(x)]=${fmt(baseV)}`, bx, barT - 10);

  // 输出值标注（最右端）
  const ex = xf(cum[cum.length - 1]);
  c.fillStyle = '#111'; c.textAlign = 'center'; c.font = 'bold 10px ui-monospace';
  c.fillText(`f(x)=${fmt(cum[cum.length - 1])}`, ex, barT + barH + 16);

  // X轴
  c.fillStyle = '#6b7f76'; c.textAlign = 'center'; c.font = '9px ui-monospace';
  for (let i = 0; i <= 5; i++) {
    const gx = L + (R - L) * i / 5;
    c.fillText((xMin - pad + (xMax - xMin + 2 * pad) * i / 5).toFixed(2), gx, barT + barH + 28);
  }
}

/* ========== SHAP 瀑布图 ========== */
function renderWaterfall(result) {
  const { c, w, h } = ctx('waterfallPlot', 720, 400);
  const items = [...result.shap.contributions]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 14);

  const L = 200, R = w - 24, T = 28, B = h - 20;
  const rh = Math.max(23, (B - T) / items.length);
  const mx = Math.max(...items.map(i => Math.abs(i.shap_value)), 1e-9);
  const midX = L + (R - L) * 0.42;
  const bw = (R - L) * 0.32;

  c.clearRect(0, 0, w, h);
  c.strokeStyle = '#dfe6e1'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(midX, T - 6); c.lineTo(midX, B + 4); c.stroke();

  items.forEach((it, i) => {
    const y = T + i * rh;
    const barW = (Math.abs(it.shap_value) / mx) * bw;
    const pos = it.shap_value >= 0;
    c.fillStyle = pos ? SHAP_RED : SHAP_BLUE;
    c.fillRect(pos ? midX : midX - barW, y + 3, barW, rh - 6);

    c.fillStyle = '#334155'; c.textAlign = 'right'; c.font = '11px system-ui';
    c.fillText(it.key, L - 8, y + rh * 0.62);

    c.fillStyle = '#37474f'; c.font = '10px ui-monospace';
    if (pos) { c.textAlign = 'left'; c.fillText(`+${fmt(it.shap_value, 4)}`, midX + barW + 5, y + rh * 0.62); }
    else     { c.textAlign = 'right'; c.fillText(fmt(it.shap_value, 4), midX - barW - 5, y + rh * 0.62); }
  });
}

export { clearResult, renderPrediction, toggleResultPanel };
