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
  requestAnimationFrame(() => { renderDecision(result); renderWaterfall(result); });
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

/* ========== SHAP 决策图（标准 SHAP 细线样式） ========== */
function renderDecision(result) {
  const { c, w, h } = ctx('decisionPlot', 720, 520);
  const items = [...result.shap.contributions]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 20);

  const L = 195, R = w - 50, T = 28, B = h - 28;
  const rh = (B - T) / items.length;
  const baseV = result.shap.base_value;
  const predV = result.shap.prediction_explained;
  const pad = Math.abs(predV - baseV) * 0.3 + 0.08;
  const xMin = Math.min(baseV, predV) - pad;
  const xMax = Math.max(baseV, predV) + pad;
  const xf = (v) => L + ((v - xMin) / (xMax - xMin)) * (R - L);
  const cum = [baseV];
  for (let i = 0; i < items.length; i++) cum.push(cum[i] + items[i].shap_value);

  // 特征值归一化 -> 色阶
  const vals = items.map(it => (typeof it.value === 'number' && !Number.isNaN(it.value)) ? it.value : 0);
  const vMin = Math.min(...vals), vMax = Math.max(...vals), vRng = vMax - vMin || 1;
  function featureColor(v) {
    const t = Math.max(0, Math.min(1, (v - vMin) / vRng));
    const r = Math.round(30 + 225 * t);
    const g = Math.round(136 - 100 * t);
    const b_ = Math.round(229 - 205 * t);
    return `rgb(${r},${g},${b_})`;
  }

  c.clearRect(0, 0, w, h);

  // 浅灰竖网格
  c.strokeStyle = '#edf0ee'; c.lineWidth = 0.5;
  for (let i = 0; i <= 5; i++) {
    const gx = L + (R - L) * i / 5;
    c.beginPath(); c.moveTo(gx, T - 4); c.lineTo(gx, B + 4); c.stroke();
  }

  // 基线：黑色虚线
  const bx = xf(baseV);
  c.strokeStyle = '#222'; c.setLineDash([6, 5]); c.lineWidth = 1;
  c.beginPath(); c.moveTo(bx, T - 6); c.lineTo(bx, B + 2); c.stroke();
  c.setLineDash([]);

  // 细线路径：颜色=特征值
  for (let i = 0; i < items.length; i++) {
    const y = T + i * rh + rh / 2;
    const x0 = xf(cum[i]), x1 = xf(cum[i + 1]);
    c.strokeStyle = featureColor(items[i].value);
    c.lineWidth = 1.5; c.lineCap = 'butt';
    c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
  }

  // 终点小圆点
  const ex = xf(predV);
  c.fillStyle = '#111';
  c.beginPath(); c.arc(ex, T + (items.length - 1) * rh + rh / 2, 3.5, 0, Math.PI * 2); c.fill();

  // 特征标签（左侧）
  c.fillStyle = '#2c3e3a'; c.textAlign = 'right'; c.font = '10.5px system-ui';
  items.forEach((it, i) => {
    const y = T + i * rh + rh / 2;
    c.fillText(it.key.length > 18 ? it.key.slice(0, 17) + '…' : it.key, L - 7, y + 3.5);
  });

  // X轴刻度
  c.fillStyle = '#6b7f76'; c.textAlign = 'center'; c.font = '9.5px ui-monospace';
  for (let i = 0; i <= 5; i++) {
    const gx = L + (R - L) * i / 5;
    c.fillText((xMin + (xMax - xMin) * i / 5).toFixed(2), gx, B + 12);
  }

  // 底部标注
  c.fillStyle = '#2e4a3e'; c.font = 'bold 10px ui-monospace'; c.textAlign = 'right';
  c.fillText(`E[f(x)]=${fmt(baseV)}`, bx - 5, B - 1);
  c.fillText(`f(x)=${fmt(predV)}`, ex - 10, B - 10);

  // 色阶图例（右上）
  const lx = R - 70, lw = 50, lh = 7, ly = 6;
  const grd = c.createLinearGradient(lx, 0, lx + lw, 0);
  grd.addColorStop(0, SHAP_BLUE); grd.addColorStop(1, SHAP_RED);
  c.fillStyle = grd; c.fillRect(lx, ly, lw, lh);
  c.fillStyle = '#6b7f76'; c.textAlign = 'center'; c.font = '9px system-ui';
  c.fillText('低', lx - 12, ly + 8); c.fillText('高', lx + lw + 12, ly + 8);
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
