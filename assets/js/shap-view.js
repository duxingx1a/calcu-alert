/* ================================================================
 * CalcuAlert · SHAP Visualization Module
 * Backend shap + matplotlib generates PNGs; frontend loads & displays
 * ================================================================ */

/* ---------- Utilities ---------- */
function fmt(v, d) { return (v === null || v === undefined || Number.isNaN(Number(v))) ? '—' : Number(v).toFixed(d || 3); }

/* ---------- Color Constants ---------- */
const SHAP_RED  = '#FF0D57';
const SHAP_BLUE = '#1E88E5';

/* ---------- Result Panel ---------- */
function panel() { return document.querySelector('#resultPanel'); }
function toggleBar() { return document.querySelector('#resultToggleBar'); }

export function toggleResultPanel(show) {
  const p = panel();
  const t = toggleBar();
  const btn = document.querySelector('#toggleResult');

  const isToggle = typeof show !== 'boolean';
  if (isToggle) {
    show = p.style.display === 'none';
  }

  const s = show ? '' : 'none';
  p.style.display = s;
  if (!isToggle) {
    t.style.display = s;
  }

  if (btn) {
    btn.textContent = show ? 'Collapse Results' : 'Expand Results';
  }
}

/* ---------- Core: Render Prediction Result ---------- */
export function renderPrediction(result, realLabel) {
  const isPos = result.classification === 'Positive';
  const classificationEn = isPos ? 'Positive' : 'Negative';
  const isPosGround = realLabel === 1;
  const groundTruth = realLabel !== null && realLabel !== undefined
    ? (isPosGround ? 'Stone (Positive)' : 'No Stone (Negative)') : '';
  const labelHtml = (realLabel !== null && realLabel !== undefined)
    ? `<div class="gt-card${isPosGround ? ' positive' : ''}">
        <strong>Ground Truth</strong>
        <span class="badge ${isPosGround ? 'pos' : 'neg'}">${groundTruth}</span>
      </div>`
    : '';

  document.querySelector('#resultSummary').innerHTML = `
    <div class="result-card${isPos ? ' positive' : ''}">
      <strong>Disease Probability</strong>
      <span class="prob-big">${(result.probability * 100).toFixed(1)}%</span>
      <span class="badge ${isPos ? 'pos' : 'neg'}">${classificationEn}</span>
      <span class="threshold-note">Threshold: ${(result.threshold * 100).toFixed(1)}%</span>
    </div>
    ${labelHtml}`;

  /* Base model probabilities */
  const baseHtml = (result.base_model_probabilities || [])
    .map((p, i) =>
      `<div class="prob-cell">
        <span class="prob-label">${(result.base_model_order || [])[i] || `M${i}`}</span>
        <div class="prob-bar"><div class="prob-fill" style="width:${(p * 100).toFixed(0)}%;background:${p >= 0.5281 ? SHAP_RED : SHAP_BLUE}"></div></div>
        <span class="prob-val">${(p * 100).toFixed(1)}%</span>
      </div>`)
    .join('');
  document.querySelector('#baseProbabilities').innerHTML = baseHtml;

  /* Imputation note */
  const fillNote = document.querySelector('#imputationNote');
  if (result.imputed_count && result.imputed_count > 0) {
    fillNote.textContent = `Note: ${result.imputed_count} missing value(s) imputed with median.`;
    fillNote.style.display = '';
  } else {
    fillNote.style.display = 'none';
  }
  document.querySelector('#featureCount').textContent = `Input Features: ${result.feature_values.length}`;

  /* ---- SHAP Contribution Table ---- */
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

  /* ---- SHAP Images ---- */
  renderShapImages(result);

  /* Show panel */
  panel().offsetHeight;
  toggleResultPanel(true);
}

/* ---------- Load SHAP Images ---------- */
function renderShapImages(result) {
  const images = result.shap_images || {};

  const wfImg = document.querySelector('#waterfallPlotImg');
  if (wfImg) {
    if (images.waterfall) {
      wfImg.src = images.waterfall;
      wfImg.style.display = 'block';
      wfImg.onerror = () => {
        wfImg.style.display = 'none';
        console.warn('Waterfall image failed to load');
      };
    } else {
      wfImg.style.display = 'none';
      console.warn('Backend did not return a Waterfall image');
    }
  }
}

/* ---------- Clear Results ---------- */
export function clearResult() {
  toggleResultPanel(false);
  document.querySelector('#resultSummary').innerHTML = '';
  document.querySelector('#baseProbabilities').innerHTML = '';
  document.querySelector('#featureCount').textContent = '';
  document.querySelector('#imputationNote').style.display = 'none';
  document.querySelector('#shapTableBody').innerHTML = '';

  const wfImg = document.querySelector('#waterfallPlotImg');
  if (wfImg) { wfImg.src = ''; wfImg.style.display = 'none'; }
}
