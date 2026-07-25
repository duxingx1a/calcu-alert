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
  // 只用 style.display 控制显隐，不碰 hidden 属性
  document.querySelector('#resultPanel').removeAttribute('hidden');
  document.querySelector('#resultPanel').style.display = '';
  document.querySelector('#toggleResult').textContent = '收起结果';
  requestAnimationFrame(() => {
    renderDecisionPlot(result);
    renderWaterfall(result);
  });
  document.querySelector('#resultPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderBaseProbabilities(result) {
  const models = result.base_model_order.map((name, index) => ({
    name,
    pct: result.base_model_probabilities[index] * 100
  }));
  const total = models.length;

  document.querySelector('#baseProbabilities').innerHTML = models.map((m, idx) => {
    const widthPct = Math.max(m.pct, 4);
    const barFill = m.pct >= 50 ? '#e8765f' : '#527b9c';
    return `<div class="prob-row">
      <span class="prob-label">${m.name}</span>
      <div class="prob-bar-track"><div class="prob-bar-fill" style="width:${widthPct}%;background:${barFill};"></div></div>
      <strong class="prob-val">${m.pct.toFixed(1)}%</strong>
    </div>`;
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
  const { context, width, height } = canvasContext('decisionPlot', 700, 500);

  // 按贡献绝对值排序，取前 20 项作为路径节点
  const values = [...result.shap.contributions]
    .sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value))
    .slice(0, 20);

  const left = 195; const right = width - 36; const top = 28; const bottom = height - 26;
  const rowH = Math.max(20, (bottom - top) / values.length);

  // X 轴范围：base_value 到 prediction_explained，留一点边距
  const xMin = Math.min(result.shap.base_value, result.shap.prediction_explained) - 0.15;
  const xMax = Math.max(result.shap.base_value, result.shap.prediction_explained) + 0.15;
  const xScale = (v) => left + ((v - xMin) / (xMax - xMin)) * (right - left);

  context.clearRect(0, 0, width, height);

  // 网格线
  context.strokeStyle = '#e8eeea'; context.lineWidth = 0.6;
  for (let i = 0; i <= 4; i++) {
    const x = left + (right - left) * i / 4;
    context.beginPath(); context.moveTo(x, top - 4); context.lineTo(x, bottom + 2); context.stroke();
  }

  // 基线虚线
  const baseX = xScale(result.shap.base_value);
  const predX = xScale(result.shap.prediction_explained);
  context.strokeStyle = '#b7c4bd'; context.setLineDash([4, 4]); context.lineWidth = 1.2;
  context.beginPath(); context.moveTo(baseX, top - 5); context.lineTo(baseX, bottom + 4); context.stroke();
  context.setLineDash([]);

  // X 轴刻度标签
  context.fillStyle = '#82928a'; context.font = '10px ui-monospace'; context.textAlign = 'center';
  for (let i = 0; i <= 4; i++) {
    const v = xMin + (xMax - xMin) * i / 4;
    context.fillText(v.toFixed(2), left + (right - left) * i / 4, bottom + 14);
  }

  // 构建累积路径点
  const pathPoints = [];
  let cumulative = result.shap.base_value;
  pathPoints.push({ y: top - 6, x: xScale(cumulative), label: '基线', key: '基线' });
  for (let idx = 0; idx < values.length; idx++) {
    const prevCum = cumulative;
    cumulative += values[idx].shap_value;
    const y = top + idx * rowH;
    // 每个特征占两个点：特征名所在行中间（step 的中点）
    pathPoints.push({
      y: y + rowH / 2,
      x: xScale(prevCum),
      label: values[idx].key,
      shap: values[idx].shap_value
    });
    pathPoints.push({
      y: y + rowH / 2,
      x: xScale(cumulative),
      label: values[idx].key,
      shap: values[idx].shap_value
    });
  }
  pathPoints.push({ y: bottom + 5, x: xScale(cumulative), label: '输出', key: '输出' });

  // 绘制阶梯路径线（深色主曲线）
  // 先找垂直段方向
  const mid = (left + right) / 2;

  // 绘制阶梯连线
  context.strokeStyle = '#1a3a32'; context.lineWidth = 2.2; context.lineJoin = 'round'; context.lineCap = 'round';
  context.beginPath();
  let lastX = xScale(result.shap.base_value);
  let lastY = top - 6;
  context.moveTo(lastX, lastY);
  for (let idx = 0; idx < values.length; idx++) {
    const y = top + idx * rowH + rowH / 2;
    const afterX = xScale(result.shap.base_value + values.slice(0, idx + 1).reduce((s, v) => s + v.shap_value, 0));
    // 垂直下移
    context.lineTo(lastX, y);
    // 水平移动到新累积值
    context.lineTo(afterX, y);
    lastX = afterX;
    lastY = y;
  }
  context.lineTo(lastX, bottom + 5);
  context.stroke();

  // 渐变色填充区域（红/蓝）
  for (let idx = 0; idx < values.length; idx++) {
    const y = top + idx * rowH;
    const x0 = xScale(result.shap.base_value + values.slice(0, idx).reduce((s, v) => s + v.shap_value, 0));
    const x1 = xScale(result.shap.base_value + values.slice(0, idx + 1).reduce((s, v) => s + v.shap_value, 0));
    const isPositive = values[idx].shap_value >= 0;
    const halfW = 6;
    context.fillStyle = isPositive ? 'rgba(232,118,95,0.22)' : 'rgba(82,123,156,0.22)';
    context.fillRect(Math.min(x0, x1), y + 2, Math.abs(x1 - x0), rowH - 4);
    // 特征名
    context.fillStyle = '#142221'; context.textAlign = 'right'; context.font = '11px system-ui';
    context.fillText(values[idx].key, left - 8, y + rowH * 0.6);
  }

  // 输出值标注
  context.fillStyle = '#315c4d'; context.font = 'bold 11px ui-monospace'; context.textAlign = 'left';
  const outLabel = `输出 ${formatNumber(result.shap.prediction_explained)}`;
  context.fillText(outLabel, Math.min(predX + 8, right - 110), bottom + 4);

  // 基线标注
  context.fillStyle = '#82928a'; context.font = '10px ui-monospace'; context.textAlign = 'right';
  context.fillText(`基线 ${formatNumber(result.shap.base_value)}`, baseX - 6, bottom + 4);
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
  panel.style.display = 'none';
  panel.setAttribute('hidden', '');
  document.querySelector('#toggleResult').textContent = '展开结果';
}

function toggleResultPanel() {
  const panel = document.querySelector('#resultPanel');
  const isVisible = panel.style.display !== 'none';
  panel.style.display = isVisible ? 'none' : '';
  if (isVisible) {
    panel.setAttribute('hidden', '');
  } else {
    panel.removeAttribute('hidden');
  }
  document.querySelector('#toggleResult').textContent = isVisible ? '展开结果' : '收起结果';
  if (!isVisible) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export { clearResult, renderPrediction, toggleResultPanel };
