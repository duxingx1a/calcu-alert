import { getExamples, getHealth, getMetadata, predict } from './api-client.js?v=250739';
import { collapseAllSections, fillValues, readValues, renderForm, SAMPLES, validate } from './feature-schema.js?v=250739';
import { clearResult, renderPrediction, toggleResultPanel } from './shap-view.js?v=250739';

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
  button.textContent = value ? '正在计算…' : '计算风险并解释';
}

function highlightSample(index) {
  document.querySelectorAll('.sample-card').forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
}

async function initialise() {
  try {
    metadata = await getMetadata();
    renderForm(metadata);
    document.querySelector('#featureCount').textContent = `${metadata.features.length} 个临床特征`;
    setStatus(true, '计算引擎已就绪');

    let examples = SAMPLES;
    try {
      const remote = await getExamples();
      if (remote && remote.examples && remote.examples.length) {
        examples = remote.examples;
      }
    } catch (e) {
      console.warn('远程示例不可用，使用本地预置示例');
    }

    const samplesEl = document.querySelector('#samples');
    samplesEl.innerHTML = examples.map((item, index) => `<button type="button" class="sample-card" data-sample="${index}" title="填充示例病例">${item.name || ('示例' + (index + 1))}</button>`).join('');
    document.querySelectorAll('[data-sample]').forEach((button) => {
      button.addEventListener('click', () => {
        const idx = Number(button.dataset.sample);
        fillValues(metadata, examples[idx].values);
        highlightSample(idx);
      });
    });
    document.querySelector('#calculatorForm').addEventListener('submit', submitForm);
    document.querySelector('#resetButton').addEventListener('click', () => { document.querySelector('#calculatorForm').reset(); clearResult(); });
    document.querySelector('#toggleResult').addEventListener('click', toggleResultPanel);

    // 默认填充病例 #1 并高亮
    fillValues(metadata, examples[0].values);
    highlightSample(0);

    // 滚动到计算按钮区域，让用户一进来就能计算
    document.querySelector('.quickbar').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    collapseAllSections();
  } catch (error) {
    document.querySelector('#resultSummary').innerHTML = `<div class="error-box">${error.message}</div>`;
    document.querySelector('#resultPanel').style.display = '';
  } finally {
    setBusy(false);
  }
}

initialise();
