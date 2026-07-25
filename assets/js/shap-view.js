/* ---------- utils ---------- */
function fmt(v, d = 3) { return (v === null || v === undefined || Number.isNaN(Number(v))) ? '—' : Number(v).toFixed(d); }

/* ---------- canvas ---------- */
function canvasCtx(id, w, h) {
  const c = document.querySelector(`#${id}`);
  const r = window.devicePixelRatio || 1;
  const cw = c.clientWidth || w || 700;
  const ch = c.clientHeight || h || 400;
  c.width = cw * r; c.height = ch * r;
  c.style.width = cw + 'px'; c.style.height = ch + 'px';
  const ctx = c.getContext('2d');
  ctx.scale(r, r);
  return { ctx, w: cw, h: ch };
}

/* ---------- 显隐控制（纯 classList，不碰 hidden 属性） ---------- */
const panel = () => document.querySelector('#resultPanel');
const toggleBtn = () => document.querySelector('#toggleResult');

function showResult() {
  panel().classList.remove('hidden-panel');
  toggleBtn().textContent = '收起结果';
}

function hideResult() {
  panel().classList.add('hidden-panel');
  toggleBtn().textContent = '展开结果';
}

function toggleResultPanel() {
  const p = panel();
  const hidden = p.classList.contains('hidden-panel');
  if (hidden) {
    p.classList.remove('hidden-panel');
    toggleBtn().textContent = '收起结果';
    p.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    p.classList.add('hidden-panel');
    toggleBtn().textContent = '展开结果';
  }
}

/* ---------- 主渲染 ---------- */
function renderPrediction(result) {
  const prob = Number(result.probability);
  const pos = result.classification === '阳性';
  document.querySelector('#resultSummary').innerHTML = `<div class="result-lead ${pos ? 'positive' : 'negative'}"><div class="eyebrow">尿路结石患病风险概率</div><strong>${(prob * 100).toFixed(1)}%</strong><span>${result.classification}（阈值 ${result.threshold}）</span></div>`;
  document.querySelector('#imputationNote').hidden = true;
  renderBaseProbs(result);
  renderShapTable(result);
  showResult();
  requestAnimationFrame(() => {
    renderDecision(result);
    renderWaterfall(result);
  });
  panel().scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- 概率水平条形图 ---------- */
function renderBaseProbs(result) {
  const models = result.base_model_order.map((name, i) => ({
    name, pct: result.base_model_probabilities[i] * 100
  }));
  document.querySelector('#baseProbabilities').innerHTML = models.map(m => {
    const w = Math.max(m.pct, 4);
    const color = m.pct >= 50 ? '#d95a3e' : '#377699';
    return `<div class="prob-row"><span class="prob-label">${m.name}</span><div class="prob-bar-track"><div class="prob-bar-fill" style="width:${w}%;background:${color}"></div></div><strong class="prob-val">${m.pct.toFixed(1)}%</strong></div>`;
  }).join('');
}

/* ---------- SHAP 数据表 ---------- */
function renderShapTable(result) {
  const rows = [...result.shap.contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  document.querySelector('#shapTableBody').innerHTML = rows.map((item, i) => `<tr><td>${i + 1}</td><td>${item.label}</td><td>${item.source_type === 'base_model_probability' ? '基模型概率' : '临床直接项'}</td><td>${fmt(item.value)}</td><td class="${item.shap_value >= 0 ? 'contribution-positive' : 'contribution-negative'}">${item.shap_value >= 0 ? '+' : ''}${fmt(item.shap_value, 5)}</td></tr>`).join('');
}

/* ========== SHAP 决策路径（阶梯折线） ========== */
function renderDecision(result) {
  const { ctx, w, h } = canvasCtx('decisionPlot', 720, 520);
  const items = [...result.shap.contributions]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 20);

  const left = 200, right = w - 30, top = 36, bot = h - 32;
  const rowH = Math.max(21, (bot - top) / items.length);

  const baseVal = result.shap.base_value;
  const predVal = result.shap.prediction_explained;
  const xMin = Math.min(baseVal, predVal) - 0.2;
  const xMax = Math.max(baseVal, predVal) + 0.2;
  const toX = (v) => left + ((v - xMin) / (xMax - xMin)) * (right - left);

  ctx.clearRect(0, 0, w, h);
  ctx.font = '11px system-ui';

  // 网格
  ctx.strokeStyle = '#e6ece8'; ctx.lineWidth = 0.6;
  const ticks = [xMin, (xMin + xMax) / 2, xMax];
  // 额外刻度
  for (let i = 0; i <= 5; i++) {
    const x = left + (right - left) * i / 5;
    ctx.beginPath(); ctx.moveTo(x, top - 6); ctx.lineTo(x, bot + 2); ctx.stroke();
  }
  // 数值刻度
  ctx.fillStyle = '#869889'; ctx.textAlign = 'center'; ctx.font = '10px ui-monospace';
  for (let i = 0; i <= 5; i++) {
    const v = xMin + (xMax - xMin) * i / 5;
    ctx.fillText(v.toFixed(2), left + (right - left) * i / 5, bot + 14);
  }

  // 基线竖线
  const baseX = toX(baseVal);
  ctx.strokeStyle = '#b4c4b9'; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(baseX, top - 10); ctx.lineTo(baseX, bot + 3); ctx.stroke();
  ctx.setLineDash([]);

  // ---------- 背景条 + 特征名 ----------
  const cum = [baseVal];
  for (let i = 0; i < items.length; i++) cum.push(cum[i] + items[i].shap_value);

  for (let i = 0; i < items.length; i++) {
    const y = top + i * rowH;
    const x0 = toX(cum[i]);
    const x1 = toX(cum[i + 1]);
    const isPos = items[i].shap_value >= 0;
    const rectX = Math.min(x0, x1);
    const rectW = Math.max(Math.abs(x1 - x0), 2);

    ctx.fillStyle = isPos ? 'rgba(232,118,95,0.18)' : 'rgba(82,123,156,0.18)';
    ctx.fillRect(rectX, y + 3, rectW, rowH - 6);

    ctx.fillStyle = '#1f2e2c'; ctx.textAlign = 'right'; ctx.font = '11px system-ui';
    const label = items[i].key;
    const maxW = left - 14;
    const displayLabel = ctx.measureText(label).width > maxW ? label.slice(0, 12) + '…' : label;
    ctx.fillText(displayLabel, left - 8, y + rowH * 0.6);
  }

  // ---------- 阶梯折线 ----------
  ctx.strokeStyle = '#112b23'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(baseX, top);
  for (let i = 0; i < items.length; i++) {
    const y = top + i * rowH + rowH / 2;
    const x = toX(cum[i + 1]);
    ctx.lineTo(toX(cum[i]), y);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(toX(cum[cum.length - 1]), bot);
  ctx.stroke();

  // 圆点标记
  ctx.fillStyle = '#0d1f19';
  ctx.beginPath(); ctx.arc(toX(predVal), bot, 4.5, 0, Math.PI * 2); ctx.fill();

  // 输出标注
  ctx.fillStyle = '#2a5a46'; ctx.font = 'bold 11px ui-monospace'; ctx.textAlign = 'left';
  ctx.fillText(`输出 ${fmt(predVal)}`, toX(predVal) + 10, bot + 3);
  // 基线标注
  ctx.fillStyle = '#778f81'; ctx.font = '10px ui-monospace'; ctx.textAlign = 'right';
  ctx.fillText(`基线 ${fmt(baseVal)}`, baseX - 8, bot + 3);
}

/* ========== SHAP 瀑布图 ========== */
function renderWaterfall(result) {
  const { ctx, w, h } = canvasCtx('waterfallPlot', 720, 400);
  const items = [...result.shap.contributions]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 14);

  const left = 200, right = w - 24, top = 28, bot = h - 20;
  const rowH = Math.max(23, (bot - top) / items.length);
  const maxVal = Math.max(...items.map(i => Math.abs(i.shap_value)), 1e-9);
  const midX = left + (right - left) * 0.42;
  const barMaxW = (right - left) * 0.32;

  ctx.clearRect(0, 0, w, h);

  // 中线
  ctx.strokeStyle = '#dfe6e1'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(midX, top - 6); ctx.lineTo(midX, bot + 4); ctx.stroke();

  items.forEach((item, i) => {
    const y = top + i * rowH;
    const barW = (Math.abs(item.shap_value) / maxVal) * barMaxW;
    const isPos = item.shap_value >= 0;
    const barX = isPos ? midX : midX - barW;

    // 条
    ctx.fillStyle = isPos ? '#c45142' : '#327596';
    ctx.fillRect(barX, y + 3, barW, rowH - 6);

    // 特征名
    ctx.fillStyle = '#334155'; ctx.textAlign = 'right'; ctx.font = '11px system-ui';
    ctx.fillText(item.key, left - 8, y + rowH * 0.62);

    // 数值
    ctx.fillStyle = '#37474f'; ctx.font = '10px ui-monospace';
    const sign = isPos ? '+' : '';
    if (isPos) {
      ctx.textAlign = 'left';
      ctx.fillText(`${sign}${fmt(item.shap_value, 4)}`, midX + barW + 5, y + rowH * 0.62);
    } else {
      ctx.textAlign = 'right';
      ctx.fillText(`${fmt(item.shap_value, 4)}`, midX - barW - 5, y + rowH * 0.62);
    }
  });
}

/* ========== 导出 ========== */
function clearResult() {
  panel().classList.add('hidden-panel');
  toggleBtn().textContent = '展开结果';
}

export { clearResult, renderPrediction, toggleResultPanel };
