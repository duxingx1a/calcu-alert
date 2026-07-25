/* ================================================================
 * CalcuAlert · SHAP 可视化模块
 * 后端 shap 库 + matplotlib 生成 PNG 图片，前端仅负责加载展示
 * ================================================================ */

/* ---------- 工具 ---------- */
function fmt(v, d) { return (v === null || v === undefined || Number.isNaN(Number(v))) ? '—' : Number(v).toFixed(d || 3); }

/* ---------- 颜色常量 ---------- */
const SHAP_RED  = '#FF0D57';
const SHAP_BLUE = '#1E88E5';

/* ---------- 结果面板 ---------- */
function panel() { return document.querySelector('#resultPanel'); }
function toggleBar() { return document.querySelector('#resultToggleBar'); }

export function toggleResultPanel(show) {
  const p = panel();
  const t = toggleBar();
  const btn = document.querySelector('#toggleResult');

  const isToggle = typeof show !== 'boolean';
  if (isToggle) {
    // 切换模式：根据当前面板状态反转，按钮栏始终可见
    show = p.style.display === 'none';
  }

  const s = show ? '' : 'none';
  p.style.display = s;
  // 按钮栏始终可见（切换时不隐藏），仅在清空时隐藏
  if (!isToggle) {
    t.style.display = s;
  }

  if (btn) {
    btn.textContent = show ? 'Collapse Results' : 'Expand Results';
  }
}

/* ---------- 核心：渲染预测结果 ---------- */
export function renderPrediction(result) {
  const isPos = result.classification === '阳性';
  const classificationEn = isPos ? 'Positive' : 'Negative';
  /* 概要 */
  document.querySelector('#resultSummary').innerHTML = `
    <div class="result-card${isPos ? ' positive' : ''}">
      <strong>Disease Probability</strong>
      <span class="prob-big">${(result.probability * 100).toFixed(1)}%</span>
      <span class="badge ${isPos ? 'pos' : 'neg'}">${classificationEn}</span>
      <span class="threshold-note">Threshold: ${(result.threshold * 100).toFixed(1)}%</span>
    </div>`;

  /* 基模型概率 */
  const baseHtml = (result.base_model_probabilities || [])
    .map((p, i) =>
      `<div class="prob-cell">
        <span class="prob-label">${(result.base_model_order || [])[i] || `M${i}`}</span>
        <div class="prob-bar"><div class="prob-fill" style="width:${(p * 100).toFixed(0)}%;background:${p >= 0.5281 ? SHAP_RED : SHAP_BLUE}"></div></div>
        <span class="prob-val">${(p * 100).toFixed(1)}%</span>
      </div>`)
    .join('');
  document.querySelector('#baseProbabilities').innerHTML = baseHtml;

  /* 插补提示 */
  const fillNote = document.querySelector('#imputationNote');
  if (result.imputed_count && result.imputed_count > 0) {
    fillNote.textContent = `Note: ${result.imputed_count} missing value(s) imputed with median.`;
    fillNote.style.display = '';
  } else {
    fillNote.style.display = 'none';
  }
  document.querySelector('#featureCount').textContent = `Input Features: ${result.feature_values.length}`;

  /* ---- SHAP 贡献表格 ---- */
  const contributions = result.shap?.contributions || [];
  const sorted = [...contributions].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
  const tbody = sorted.map((it, i) => {
    const cls = it.shap_value >= 0 ? 'contribution-positive' : 'contribution-negative';
    const typeMap = { base_model_probability: 'Base Model Prob.', clinical_direct: 'Clinical Feature' };
    const val = it.value !== undefined && it.value !== null ? (typeof it.value === 'number' ? fmt(it.value) : String(it.value)) : '—';
    return `<tr>
      <td>${i + 1}</td><td>${it.key}</td><td>${typeMap[it.source_type] || it.source_type || '—'}</td>
      <td>${val}</td>
      <td class="${cls}">${it.shap_value >= 0 ? '+' : ''}${fmt(it.shap_value, 6)}</td>
    </tr>`;
  }).join('');

  const additivity = result.shap?.additivity_error;
  const addRow = additivity !== undefined && Math.abs(additivity) > 1e-6
    ? `<tr><td colspan="4" style="color:var(--muted)">Additivity Error</td><td style="color:var(--muted)">${fmt(additivity, 6)}</td></tr>` : '';
  document.querySelector('#shapTableBody').innerHTML = tbody + addRow;

  /* ---- SHAP 图片（shap 库原生生成） ---- */
  renderShapImages(result);

  /* 显示面板 */
  panel().offsetHeight;
  toggleResultPanel(true);
}

/* ---------- 加载 shap 库生成的原生图片 ---------- */
function renderShapImages(result) {
  const images = result.shap_images || {};

  // Waterfall
  const wfImg = document.querySelector('#waterfallPlotImg');
  if (wfImg) {
    if (images.waterfall) {
      wfImg.src = images.waterfall;
      wfImg.style.display = 'block';
      wfImg.onerror = () => {
        wfImg.style.display = 'none';
        console.warn('Waterfall 图片加载失败');
      };
    } else {
      wfImg.style.display = 'none';
      console.warn('后端未返回 Waterfall 图片');
    }
  }
}

/* ---------- 清空结果 ---------- */
export function clearResult() {
  toggleResultPanel(false);
  document.querySelector('#resultSummary').innerHTML = '';
  document.querySelector('#baseProbabilities').innerHTML = '';
  document.querySelector('#featureCount').textContent = '';
  document.querySelector('#imputationNote').style.display = 'none';
  document.querySelector('#shapTableBody').innerHTML = '';

  // 清除图片
  const wfImg = document.querySelector('#waterfallPlotImg');
  if (wfImg) { wfImg.src = ''; wfImg.style.display = 'none'; }
}
