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

/* ========== SHAP 决策图（标准 SHAP 样式：特征值红蓝连续染色） ========== */
function renderDecision(result) {
  const { c, w, h } = ctx('decisionPlot', 720, 520);
  const items = [...result.shap.contributions]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 20);

  const L = 200, R = w - 38, T = 34, B = h - 34;
  const rh = Math.max(22, (B - T) / items.length);
  const baseV = result.shap.base_value;
  const predV = result.shap.prediction_explained;
  const pad = Math.abs(predV - baseV) * 0.3 + 0.1;
  const xMin = Math.min(baseV, predV) - pad;
  const xMax = Math.max(baseV, predV) + pad;
  const xf = (v) => L + ((v - xMin) / (xMax - xMin)) * (R - L);
  const cum = [baseV];
  for (let i = 0; i < items.length; i++) cum.push(cum[i] + items[i].shap_value);

  // 归一化特征值 -> [0,1] 用于红蓝色阶
  const vals = items.map(it => typeof it.value === 'number' && !Number.isNaN(it.value) ? it.value : 0);
  const vMin = Math.min(...vals), vMax = Math.max(...vals);
  const vRng = vMax - vMin || 1;
  const norm = (v) => (v - vMin) / vRng;

  // SHAP 特征值色阶：低值=蓝，高值=红
  function featureColor(v) {
    const t = norm(v);
    const r = Math.round(30 + (225) * t);    // 30→255
    const g = Math.round(136 - (100) * t);    // 136→36
    const b_ = Math.round(229 - (205) * t);    // 229→24
    return `rgb(${r},${g},${b_})`;
  }

  c.clearRect(0, 0, w, h);

  // 网格
  c.strokeStyle = '#e9edea'; c.lineWidth = 0.5; c.setLineDash([4, 6]);
  for (let i = 0; i <= 4; i++) {
    const gx = L + (R - L) * i / 4;
    c.beginPath(); c.moveTo(gx, T - 6); c.lineTo(gx, B + 6); c.stroke();
  }
  c.setLineDash([]);

  // 基线虚线（SHAP 风格：黑色虚线）
  const bx = xf(baseV);
  c.strokeStyle = '#000'; c.setLineDash([5, 4]); c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(bx, T - 8); c.lineTo(bx, B + 4); c.stroke();
  c.setLineDash([]);

  // 每特征：水平线段，颜色=特征值（红高蓝低）
  for (let i = 0; i < items.length; i++) {
    const y = T + i * rh + rh / 2;
    const x0 = xf(cum[i]), x1 = xf(cum[i + 1]);
    c.strokeStyle = featureColor(items[i].value);
    c.lineWidth = 7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
  }

  // 终点标记
  const ex = xf(predV);
  c.fillStyle = '#000';
  c.beginPath(); c.arc(ex, B - rh / 2 + 2, 5, 0, Math.PI * 2); c.fill();

  // 特征标签
  c.fillStyle = '#2c3e3a'; c.textAlign = 'right'; c.font = '11px system-ui';
  items.forEach((it, i) => {
    const y = T + i * rh + rh / 2;
    const lbl = it.key.length > 16 ? it.key.slice(0, 15) + '…' : it.key;
    c.fillText(lbl, L - 8, y + 4);
  });

  // X轴标签
  c.fillStyle = '#5c6f68'; c.textAlign = 'center'; c.font = '10px ui-monospace';
  for (let i = 0; i <= 4; i++) {
    const gx = L + (R - L) * i / 4;
    c.fillText((xMin + (xMax - xMin) * i / 4).toFixed(2), gx, B + 10);
  }

  // 底部标注
  c.fillStyle = '#374f45'; c.font = 'bold 10px ui-monospace'; c.textAlign = 'right';
  c.fillText(`E[f(x)]=${fmt(baseV)}`, bx - 6, B - 4);
  c.fillText(`f(x)=${fmt(predV)}`, ex - 12, B - 14);

  // 色阶图例
  const lx = R - 80, lw = 60, lh = 8, ly = 8;
  const grd = c.createLinearGradient(lx, 0, lx + lw, 0);
  grd.addColorStop(0, SHAP_BLUE); grd.addColorStop(1, SHAP_RED);
  c.fillStyle = grd;
  c.fillRect(lx, ly, lw, lh);
  c.strokeStyle = '#ccc'; c.lineWidth = 0.5; c.strokeRect(lx, ly, lw, lh);
  c.fillStyle = '#5c6f68'; c.textAlign = 'center'; c.font = '9px system-ui';
  c.fillText('低', lx - 10, ly + 9);
  c.fillText('高', lx + lw + 10, ly + 9);
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
