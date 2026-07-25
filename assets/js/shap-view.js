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

/* ---------- 显隐控制 ---------- */
const panel  = () => document.querySelector('#resultPanel');
const bar    = () => document.querySelector('#resultToggleBar');
const btn    = () => document.querySelector('#toggleResult');

function showResult() {
  // 面板显示
  panel().classList.remove('result-hidden');
  // 切换条始终显示
  bar().classList.remove('result-hidden');
  btn().textContent = '收起结果';
}

// 仅切换面板，切换条保持可见
function toggleResultPanel() {
  if (panel().classList.contains('result-hidden')) {
    panel().classList.remove('result-hidden');
    btn().textContent = '收起结果';
    panel().scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    panel().classList.add('result-hidden');
    btn().textContent = '展开结果';
  }
  // bar 不变，始终可见
}

function clearResult() {
  panel().classList.add('result-hidden');
  bar().classList.add('result-hidden');
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

/* ---------- 概率水平条 ---------- */
function renderProbs(result) {
  const models = result.base_model_order.map((name, i) => ({ name, pct: result.base_model_probabilities[i] * 100 }));
  document.querySelector('#baseProbabilities').innerHTML = models.map(m => {
    const w = Math.max(m.pct, 4);
    const color = m.pct >= 50 ? '#d95a3e' : '#377699';
    return `<div class="prob-row"><span class="prob-label">${m.name}</span><div class="prob-bar-track"><div class="prob-bar-fill" style="width:${w}%;background:${color}"></div></div><strong class="prob-val">${m.pct.toFixed(1)}%</strong></div>`;
  }).join('');
}

/* ---------- 贡献表 ---------- */
function renderTable(result) {
  const rows = [...result.shap.contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  document.querySelector('#shapTableBody').innerHTML = rows.map((item, i) => `<tr><td>${i + 1}</td><td>${item.label}</td><td>${item.source_type === 'base_model_probability' ? '基模型概率' : '临床直接项'}</td><td>${fmt(item.value)}</td><td class="${item.shap_value >= 0 ? 'contribution-positive' : 'contribution-negative'}">${item.shap_value >= 0 ? '+' : ''}${fmt(item.shap_value, 5)}</td></tr>`).join('');
}

/* ========== SHAP 决策路径（阶梯折线） ========== */
function renderDecision(result) {
  const { c, w, h } = ctx('decisionPlot', 720, 520);
  const items = [...result.shap.contributions]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 20);

  const L = 200, R = w - 32, T = 38, B = h - 34;
  const rh = Math.max(21, (B - T) / items.length);
  const baseV = result.shap.base_value;
  const predV = result.shap.prediction_explained;
  const xMin = Math.min(baseV, predV) - 0.2;
  const xMax = Math.max(baseV, predV) + 0.2;
  const xf = (v) => L + ((v - xMin) / (xMax - xMin)) * (R - L);
  const cum = [baseV];
  for (let i = 0; i < items.length; i++) cum.push(cum[i] + items[i].shap_value);

  c.clearRect(0, 0, w, h);

  // 竖网格
  c.strokeStyle = '#e7ece8'; c.lineWidth = 0.6;
  for (let i = 0; i <= 5; i++) {
    const gx = L + (R - L) * i / 5;
    c.beginPath(); c.moveTo(gx, T - 6); c.lineTo(gx, B + 2); c.stroke();
  }
  c.fillStyle = '#869889'; c.textAlign = 'center'; c.font = '10px ui-monospace';
  for (let i = 0; i <= 5; i++)
    c.fillText((xMin + (xMax - xMin) * i / 5).toFixed(2), L + (R - L) * i / 5, B + 15);

  // 基线虚线
  const bx = xf(baseV);
  c.strokeStyle = '#b4c4b9'; c.setLineDash([5, 5]); c.lineWidth = 1;
  c.beginPath(); c.moveTo(bx, T - 10); c.lineTo(bx, B + 3); c.stroke();
  c.setLineDash([]);

  // 背景色条 + 特征名
  for (let i = 0; i < items.length; i++) {
    const y = T + i * rh;
    const x0 = xf(cum[i]), x1 = xf(cum[i + 1]);
    const rx = Math.min(x0, x1), rw = Math.max(Math.abs(x1 - x0), 2);
    c.fillStyle = items[i].shap_value >= 0 ? 'rgba(232,118,95,0.18)' : 'rgba(82,123,156,0.18)';
    c.fillRect(rx, y + 3, rw, rh - 6);

    c.fillStyle = '#1f2e2c'; c.textAlign = 'right'; c.font = '11px system-ui';
    const lbl = items[i].key;
    c.fillText(c.measureText(lbl).width > (L - 14) ? lbl.slice(0, 12) + '…' : lbl, L - 8, y + rh * 0.6);
  }

  // 阶梯折线
  c.strokeStyle = '#112b23'; c.lineWidth = 2.4; c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath();
  c.moveTo(bx, T);
  for (let i = 0; i < items.length; i++) {
    const y = T + i * rh + rh / 2;
    c.lineTo(xf(cum[i]), y);
    c.lineTo(xf(cum[i + 1]), y);
  }
  c.lineTo(xf(predV), B);
  c.stroke();

  // 终点圆
  c.fillStyle = '#0d1f19';
  c.beginPath(); c.arc(xf(predV), B, 4.5, 0, Math.PI * 2); c.fill();

  c.fillStyle = '#2a5a46'; c.font = 'bold 11px ui-monospace'; c.textAlign = 'left';
  c.fillText(`输出 ${fmt(predV)}`, xf(predV) + 10, B + 3);
  c.fillStyle = '#778f81'; c.font = '10px ui-monospace'; c.textAlign = 'right';
  c.fillText(`基线 ${fmt(baseV)}`, bx - 8, B + 3);
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
    c.fillStyle = pos ? '#c45142' : '#327596';
    c.fillRect(pos ? midX : midX - barW, y + 3, barW, rh - 6);

    c.fillStyle = '#334155'; c.textAlign = 'right'; c.font = '11px system-ui';
    c.fillText(it.key, L - 8, y + rh * 0.62);

    c.fillStyle = '#37474f'; c.font = '10px ui-monospace';
    if (pos) { c.textAlign = 'left'; c.fillText(`+${fmt(it.shap_value, 4)}`, midX + barW + 5, y + rh * 0.62); }
    else     { c.textAlign = 'right'; c.fillText(fmt(it.shap_value, 4), midX - barW - 5, y + rh * 0.62); }
  });
}

export { clearResult, renderPrediction, toggleResultPanel };
