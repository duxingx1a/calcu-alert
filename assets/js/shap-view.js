function formatNumber(value, digits = 4) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  return Number(value).toFixed(digits);
}

function renderPrediction(result) {
  const probability = Number(result.probability);
  const positive = result.classification === '阳性';
  const items = result.feature_values.filter((item) => item.was_imputed);
  document.querySelector('#resultSummary').innerHTML = `
    <div class="result-lead ${positive ? 'positive' : 'negative'}">
      <div class="eyebrow">Stacking XGBoost · 未校准阳性概率</div>
      <strong>${(probability * 100).toFixed(2)}%</strong>
      <span>${result.classification}（阈值 ${result.threshold}）</span>
    </div>
    <dl class="result-facts">
      <div><dt>模型版本</dt><dd>${result.model_version}</dd></div>
      <div><dt>元模型输入</dt><dd>87 维</dd></div>
      <div><dt>SHAP 加性误差</dt><dd>${result.shap.additivity_error.toExponential(2)}</dd></div>
      <div><dt>自动插补字段</dt><dd>${items.length} 项</dd></div>
    </dl>`;
  document.querySelector('#imputationNote').textContent = items.length
    ? `本次有 ${items.length} 个选填字段未填写，已按训练阶段的众数/分性别均值进行真实插补。`
    : '本次未使用缺失值插补。';
  renderBaseProbabilities(result);
  renderShapTable(result);
  renderDecisionPlot(result);
  renderWaterfall(result);
  document.querySelector('#resultPanel').hidden = false;
  document.querySelector('#resultPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderBaseProbabilities(result) {
  document.querySelector('#baseProbabilities').innerHTML = result.base_model_order.map((name, index) => `<div class="prob-row"><span>${name}</span><b>${(result.base_model_probabilities[index] * 100).toFixed(2)}%</b></div>`).join('');
}

function renderShapTable(result) {
  const rows = [...result.shap.contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  document.querySelector('#shapTableBody').innerHTML = rows.map((item, index) => `<tr><td>${index + 1}</td><td>${item.label}</td><td>${item.source_type === 'base_model_probability' ? '基模型概率' : '临床直接项'}</td><td>${formatNumber(item.value)}</td><td class="${item.shap_value >= 0 ? 'contribution-positive' : 'contribution-negative'}">${item.shap_value >= 0 ? '+' : ''}${formatNumber(item.shap_value, 6)}</td></tr>`).join('');
}

function canvasContext(id) {
  const canvas = document.querySelector(`#${id}`);
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 700;
  const height = canvas.clientHeight || 360;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  const context = canvas.getContext('2d');
  context.scale(ratio, ratio);
  return { context, width, height };
}

function renderDecisionPlot(result) {
  const { context, width, height } = canvasContext('decisionPlot');
  const values = [...result.shap.contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  const left = Math.min(290, Math.max(205, width * 0.36)); const right = width - 32; const top = 40; const bottom = height - 34; const row = Math.max(15, (bottom - top) / values.length);
  const min = Math.min(result.shap.base_value, result.shap.prediction_explained, ...values.map((item) => item.shap_value));
  const max = Math.max(result.shap.base_value, result.shap.prediction_explained, ...values.map((item) => item.shap_value));
  const scale = (value) => left + ((value - min) / Math.max(max - min, 1e-9)) * (right - left);
  context.clearRect(0, 0, width, height); context.font = '11px system-ui'; context.textAlign = 'left'; context.fillStyle = '#50605d'; context.fillText('SHAP decision plot · 87 维元模型输入按绝对贡献排序', left, 18);
  let cumulative = result.shap.base_value;
  const baseX = scale(cumulative); const finalX = scale(result.shap.prediction_explained);
  context.strokeStyle = '#b7c4bd'; context.setLineDash([3, 3]); context.beginPath(); context.moveTo(baseX, top - 7); context.lineTo(baseX, bottom + 3); context.stroke(); context.setLineDash([]);
  values.forEach((item, index) => {
    const next = cumulative + item.shap_value; const y = top + index * row + 2; const x0 = scale(cumulative); const x1 = scale(next);
    context.strokeStyle = '#b7c4bd'; context.lineWidth = 1; context.beginPath(); context.moveTo(x0, y + 4); context.lineTo(x1, y + 4); context.stroke();
    context.fillStyle = item.shap_value >= 0 ? '#e8765f' : '#527b9c'; context.fillRect(Math.min(x0, x1), y, Math.max(Math.abs(x1 - x0), 1.2), 8);
    context.fillStyle = '#142221'; context.textAlign = 'right'; context.fillText(item.key, left - 9, y + 8);
    if (index < 14 || Math.abs(item.shap_value) > 0.08) { context.fillStyle = '#50605d'; context.textAlign = 'left'; context.fillText(formatNumber(item.shap_value, 3), Math.min(Math.max(x0, left) + 4, right - 28), y + 8); }
    cumulative = next;
  });
  context.strokeStyle = '#315c4d'; context.setLineDash([3, 3]); context.beginPath(); context.moveTo(finalX, top - 7); context.lineTo(finalX, bottom + 3); context.stroke(); context.setLineDash([]);
  context.fillStyle = '#315c4d'; context.textAlign = 'left'; context.fillText(`基线 ${formatNumber(result.shap.base_value, 3)}`, baseX + 5, bottom + 20); context.fillText(`输出 ${formatNumber(result.shap.prediction_explained, 3)}`, Math.min(finalX + 5, right - 78), bottom + 20);
}

function renderWaterfall(result) {
  const { context, width, height } = canvasContext('waterfallPlot');
  const values = [...result.shap.contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value)).slice(0, 12);
  const left = Math.min(250, Math.max(170, width * 0.33)); const right = width - 28; const top = 35; const row = Math.max(24, Math.min(30, (height - 55) / values.length));
  const max = Math.max(...values.map((item) => Math.abs(item.shap_value)), 1e-9);
  const center = left + (right - left) * 0.42;
  context.clearRect(0, 0, width, height); context.font = '11px system-ui'; context.fillStyle = '#50605d'; context.fillText('SHAP waterfall · 局部解释前12项（元模型原始边际）', left, 16);
  values.forEach((item, index) => {
    const y = top + index * row; const length = Math.abs(item.shap_value) / max * (right - left) * 0.33;
    context.fillStyle = '#526577'; context.textAlign = 'right'; context.fillText(item.key, left - 8, y + 13);
    context.fillStyle = item.shap_value >= 0 ? '#b54b43' : '#2d7190';
    context.fillRect(item.shap_value >= 0 ? center : center - length, y, length, 16);
    context.strokeStyle = '#d9e1e8'; context.beginPath(); context.moveTo(center, y - 3); context.lineTo(center, y + 19); context.stroke();
    context.fillStyle = '#34495e'; context.textAlign = item.shap_value >= 0 ? 'left' : 'right';
    context.fillText(`${item.shap_value >= 0 ? '+' : ''}${formatNumber(item.shap_value, 5)}`, item.shap_value >= 0 ? center + length + 5 : center - length - 5, y + 13);
  });
}

function clearResult() {
  document.querySelector('#resultPanel').hidden = true;
}

export { clearResult, renderPrediction };
