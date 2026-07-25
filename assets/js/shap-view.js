function formatNumber(value, digits = 3) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toFixed(digits);
}

function renderPrediction(result) {
  const probability = Number(result.probability);
  const positive = result.classification === '阳性';
  document.querySelector('#resultSummary').innerHTML = `
    <div class="result-lead ${positive ? 'positive' : 'negative'}">
      <div class="eyebrow">尿路结石患病风险概率</div>
      <strong>${(probability * 100).toFixed(1)}%</strong>
      <span>${result.classification}（阈值 ${result.threshold}）</span>
    </div>`;
  document.querySelector('#imputationNote').hidden = true;
  renderBaseProbabilities(result);
  renderShapTable(result);
  document.querySelector('#resultPanel').style.display = '';
  document.querySelector('#resultPanel').hidden = false;
  document.querySelector('#toggleResult').textContent = '收起结果';
  // 延迟渲染图表，确保 resultPanel 已被浏览器布局
  requestAnimationFrame(() => {
    renderDecisionPlot(result);
    renderWaterfall(result);
  });
  document.querySelector('#resultPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderBaseProbabilities(result) {
  document.querySelector('#baseProbabilities').innerHTML = result.base_model_order
    .map((name, index) => {
      const pct = (result.base_model_probabilities[index] * 100).toFixed(1);
      return `<div class="prob-card"><span>${name}</span><strong>${pct}%</strong></div>`;
    }).join('');
}

function renderShapTable(result) {
  const rows = [...result.shap.contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  document.querySelector('#shapTableBody').innerHTML = rows.map((item, index) => `<tr><td>${index + 1}</td><td>${item.label}</td><td>${item.source_type === 'base_model_probability' ? '基模型概率' : '临床直接项'}</td><td>${formatNumber(item.value)}</td><td class="${item.shap_value >= 0 ? 'contribution-positive' : 'contribution-negative'}">${item.shap_value >= 0 ? '+' : ''}${formatNumber(item.shap_value, 5)}</td></tr>`).join('');
}

function canvasContext(id, defaultWidth, defaultHeight) {
  const canvas = document.querySelector(`#${id}`);
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || defaultWidth || 700;
  const height = canvas.clientHeight || defaultHeight || 400;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const context = canvas.getContext('2d');
  context.scale(ratio, ratio);
  return { context, width, height };
}

function renderDecisionPlot(result) {
  const { context, width, height } = canvasContext('decisionPlot', 700, 520);
  // 取前 25 项，避免 87 项挤在一起
  const values = [...result.shap.contributions]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 25);
  const left = 210; const right = width - 32; const top = 34; const bottom = height - 28;
  const row = Math.max(18, (bottom - top) / values.length);
  const min = Math.min(result.shap.base_value, result.shap.prediction_explained, ...values.map((item) => item.shap_value));
  const max = Math.max(result.shap.base_value, result.shap.prediction_explained, ...values.map((item) => item.shap_value));
  const scale = (value) => left + ((value - min) / Math.max(max - min, 1e-9)) * (right - left);

  context.clearRect(0, 0, width, height);
  context.font = '12px system-ui'; context.textAlign = 'left'; context.fillStyle = '#50605d';
  context.fillText('SHAP 决策图 · 按贡献绝对值排序前25项', left, 20);

  let cumulative = result.shap.base_value;
  const baseX = scale(cumulative); const finalX = scale(result.shap.prediction_explained);

  // 基线和输出线
  context.strokeStyle = '#b7c4bd'; context.setLineDash([3, 3]);
  context.beginPath(); context.moveTo(baseX, top - 7); context.lineTo(baseX, bottom + 3); context.stroke();
  context.setLineDash([]);
  context.strokeStyle = '#315c4d'; context.setLineDash([3, 3]);
  context.beginPath(); context.moveTo(finalX, top - 7); context.lineTo(finalX, bottom + 3); context.stroke();
  context.setLineDash([]);

  values.forEach((item, index) => {
    const next = cumulative + item.shap_value;
    const y = top + index * row;
    const x0 = scale(cumulative); const x1 = scale(next);
    const barW = Math.max(Math.abs(x1 - x0), 1.5);

    // 连接线
    context.strokeStyle = '#d0d9d4'; context.lineWidth = 0.8;
    context.beginPath(); context.moveTo(x0, y + row * 0.5); context.lineTo(x1, y + row * 0.5); context.stroke();
    // 色条
    context.fillStyle = item.shap_value >= 0 ? '#e8765f' : '#527b9c';
    context.fillRect(Math.min(x0, x1), y + 3, barW, row - 6);
    // 特征名
    context.fillStyle = '#142221'; context.textAlign = 'right'; context.font = '11px system-ui';
    context.fillText(item.key, left - 8, y + row * 0.6);
    // SHAP 值
    if (index < 8 || Math.abs(item.shap_value) > 0.06) {
      context.fillStyle = '#50605d'; context.textAlign = 'left'; context.font = '10px ui-monospace';
      context.fillText(formatNumber(item.shap_value), Math.min(Math.max(x0, left) + 5, right - 34), y + row * 0.6);
    }
    cumulative = next;
  });

  // 底部标注
  context.fillStyle = '#315c4d'; context.textAlign = 'left'; context.font = '10px ui-monospace';
  context.fillText(`基线 ${formatNumber(result.shap.base_value)}`, baseX + 5, height - 10);
  context.fillText(`输出 ${formatNumber(result.shap.prediction_explained)}`, Math.min(finalX + 5, right - 78), height - 10);
}

function renderWaterfall(result) {
  const { context, width, height } = canvasContext('waterfallPlot', 700, 400);
  const values = [...result.shap.contributions]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 14);
  const left = 200; const right = width - 24; const top = 32;
  const row = Math.max(24, (height - 52) / values.length);
  const max = Math.max(...values.map((item) => Math.abs(item.shap_value)), 1e-9);
  const center = left + (right - left) * 0.40;

  context.clearRect(0, 0, width, height);
  context.font = '12px system-ui'; context.fillStyle = '#50605d'; context.textAlign = 'left';
  context.fillText('SHAP 瀑布图 · 局部解释前14项', left, 18);

  values.forEach((item, index) => {
    const y = top + index * row;
    const length = Math.abs(item.shap_value) / max * (right - left) * 0.35;
    const barX = item.shap_value >= 0 ? center : center - length;
    const isPositive = item.shap_value >= 0;

    // 中线
    context.strokeStyle = '#e3eae6'; context.lineWidth = 1;
    context.beginPath(); context.moveTo(center, y); context.lineTo(center, y + row - 2); context.stroke();

    // 条
    context.fillStyle = isPositive ? '#b54b43' : '#2d7190';
    context.fillRect(barX, y + 4, length, row - 8);

    // 特征名
    context.fillStyle = '#3a4a5c'; context.textAlign = 'right'; context.font = '11px system-ui';
    context.fillText(item.key, left - 8, y + row * 0.6);

    // 数值
    context.fillStyle = '#34495e'; context.textAlign = isPositive ? 'left' : 'right'; context.font = '10px ui-monospace';
    const vx = isPositive ? center + length + 5 : center - length - 5;
    context.fillText(`${isPositive ? '+' : ''}${formatNumber(item.shap_value, 4)}`, vx, y + row * 0.6);
  });
}

function clearResult() {
  const panel = document.querySelector('#resultPanel');
  panel.hidden = true;
  panel.style.display = 'none';
  document.querySelector('#toggleResult').textContent = '展开结果';
}

function toggleResultPanel() {
  const panel = document.querySelector('#resultPanel');
  const isHidden = panel.style.display === 'none';
  panel.style.display = isHidden ? '' : 'none';
  panel.hidden = !isHidden; // 同步 hidden 属性
  document.querySelector('#toggleResult').textContent = isHidden ? '收起结果' : '展开结果';
  if (isHidden) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export { clearResult, renderPrediction, toggleResultPanel };
