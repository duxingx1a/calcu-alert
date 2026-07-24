import { getExamples, getHealth, getMetadata, predict } from './api-client.js';
import { fillValues, readValues, renderForm, validate } from './feature-schema.js';
import { clearResult, renderPrediction } from './shap-view.js';

let metadata;
let busy = false;

function setStatus(ok, text) {
  const dot = document.querySelector('#apiDot');
  dot.className = ok ? 'status-dot ready' : 'status-dot';
  document.querySelector('#apiText').textContent = text;
}

function setBusy(value) {
  busy = value;
  const button = document.querySelector('#calculateButton');
  button.disabled = value;
  button.textContent = value ? '正在执行真实推理…' : '计算风险并解释';
}

async function initialise() {
  try {
    metadata = await getMetadata();
    renderForm(metadata);
    document.querySelector('#featureCount').textContent = `${metadata.features.length} 个临床特征 → 10 个基模型概率 + 77 个直接项 = 87 维`;
    setStatus(true, `计算引擎已就绪 · ${metadata.model_id} · ${metadata.features.length} 项输入`);
    const examples = (await getExamples()).examples;
    document.querySelector('#samples').innerHTML = examples.map((item, index) => `<button type="button" class="sample-card" data-sample="${index}" title="填充真实外部验证病例"><strong>${item.name}</strong></button>`).join('');
    document.querySelectorAll('[data-sample]').forEach((button) => button.addEventListener('click', () => fillValues(metadata, examples[Number(button.dataset.sample)].values)));
    document.querySelector('#calculatorForm').addEventListener('submit', submitForm);
    document.querySelector('#resetButton').addEventListener('click', () => { document.querySelector('#calculatorForm').reset(); clearResult(); });
    document.querySelector('#closeResult').addEventListener('click', clearResult);
  } catch (error) {
    setStatus(false, `计算引擎未就绪：${error.message}`);
  }
}

async function submitForm(event) {
  event.preventDefault();
  if (busy) return;
  const values = readValues(metadata);
  if (validate(values, metadata).length) {
    document.querySelector('.field.invalid input, .field.invalid select')?.focus();
    return;
  }
  setBusy(true); clearResult();
  try {
    renderPrediction(await predict(values));
  } catch (error) {
    document.querySelector('#resultSummary').innerHTML = `<div class="error-box">${error.message}</div>`;
    document.querySelector('#resultPanel').hidden = false;
  } finally {
    setBusy(false);
  }
}

initialise();
