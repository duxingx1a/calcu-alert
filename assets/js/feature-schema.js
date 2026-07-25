const TOP_10 = [
  'Gender', 'Uric_WBC', 'Age', 'Uric_specific_gravity', 'Uric_conductivity',
  'Uric_RBC', 'Waist_to_hip_ratio', 'Uric_PH', 'BRI', 'Systolic_BP'
];

const GROUPS = {
  urinalysis: '尿常规', blood: '血常规', liver: '肝功能', renal: '肾功能',
  lipids: '血脂', anthrop: '人体测量', vitals: '生命体征与生活方式'
};

const LABELS = {
  Gender: ['性别', '男/女', 'category'], Uric_WBC: ['尿白细胞', '/μL', 'number'],
  Age: ['年龄', '岁', 'number'], Uric_specific_gravity: ['尿比重', '', 'number'],
  Uric_conductivity: ['尿电导率', 'mS/cm', 'number'], Uric_RBC: ['尿红细胞', '/μL', 'number'],
  Waist_to_hip_ratio: ['腰臀比', '', 'number'], Uric_PH: ['尿液 pH', '', 'number'],
  BRI: ['身体圆度指数', '', 'number'], Systolic_BP: ['收缩压', 'mmHg', 'number'],
  Uric_bacteria: ['尿细菌', '/μL', 'number'], Uric_epithelium: ['尿上皮细胞', '/μL', 'number'],
  RBC: ['红细胞计数', '×10¹²/L', 'number'], MCV: ['平均红细胞体积', 'fL', 'number'],
  HCT: ['血细胞比容', 'L/L', 'number'], 'RDW(CV)': ['RDW-CV', '%', 'number'],
  'RDW(SD)': ['RDW-SD', '', 'number'], HB: ['血红蛋白', 'g/L', 'number'], MCH: ['平均红细胞血红蛋白量', 'pg', 'number'],
  MCHC: ['平均红细胞血红蛋白浓度', 'g/L', 'number'], WBC: ['白细胞计数', '×10⁹/L', 'number'],
  Neutrophil_count: ['中性粒细胞计数', '×10⁹/L', 'number'], Neutrophil_percentage: ['中性粒细胞百分比', '%', 'number'],
  Lymphocytes_percentage: ['淋巴细胞百分比', '%', 'number'], Lymphocytes_count: ['淋巴细胞计数', '×10⁹/L', 'number'],
  Monocytes_count: ['单核细胞计数', '×10⁹/L', 'number'], Monocytes_percentage: ['单核细胞百分比', '%', 'number'],
  Eosinophil_count: ['嗜酸性粒细胞计数', '×10⁹/L', 'number'], Eosinophil_percentage: ['嗜酸性粒细胞百分比', '%', 'number'],
  Basophil_count: ['嗜碱性粒细胞计数', '×10⁹/L', 'number'], Basophil_percentage: ['嗜碱性粒细胞百分比', '%', 'number'],
  platelets_count: ['血小板计数', '×10⁹/L', 'number'], NLR: ['中性粒/淋巴细胞比', '', 'number'], BLR: ['嗜碱性粒/淋巴细胞比', '', 'number'],
  ELR: ['嗜酸性粒/淋巴细胞比', '', 'number'], MLR: ['单核/淋巴细胞比', '', 'number'], PLR: ['血小板/淋巴细胞比', '', 'number'],
  AST: ['天冬氨酸氨基转移酶', 'U/L', 'number'], ALT: ['丙氨酸氨基转移酶', 'U/L', 'number'], AST_to_ALT_ratio: ['AST/ALT 比值', '', 'number'],
  GGT: ['γ-谷氨酰转肽酶', 'U/L', 'number'], AKP: ['碱性磷酸酶', 'U/L', 'number'], Albumin: ['白蛋白', 'g/L', 'number'],
  Globulin: ['球蛋白', 'g/L', 'number'], ALB_to_GLO_ratio: ['白球比', '', 'number'], Total_protein: ['总蛋白', 'g/L', 'number'],
  TBIL: ['总胆红素', 'μmol/L', 'number'], DBIL: ['直接胆红素', 'μmol/L', 'number'], IBIL: ['间接胆红素', 'μmol/L', 'number'],
  'α-HBDH': ['α-HBDH', 'U/L', 'number'], LDH: ['乳酸脱氢酶', 'U/L', 'number'], CK: ['肌酸激酶', 'U/L', 'number'],
  'Cystatin-C': ['胱抑素 C', 'mg/L', 'number'], Creatinine: ['肌酐', 'μmol/L', 'number'], Serum_Urea: ['尿素', 'mmol/L', 'number'],
  Serum_Uric_acid: ['血尿酸', 'μmol/L', 'number'], eGFR: ['eGFR', 'mL/min', 'number'], Fasting_blood_glucose: ['空腹血糖', 'mmol/L', 'number'],
  Triglycerides: ['甘油三酯', 'mmol/L', 'number'], Cholesterol: ['总胆固醇', 'mmol/L', 'number'], HDL: ['高密度脂蛋白', 'mmol/L', 'number'], LDL: ['低密度脂蛋白', 'mmol/L', 'number'],
  Weight: ['体重', 'kg', 'number'], Height: ['身高', 'cm', 'number'], BMI: ['体重指数', 'kg/m²', 'number'], Waistline: ['腰围', 'cm', 'number'], Hips: ['臀围', 'cm', 'number'],
  ABSI: ['ABSI', '', 'number'], Diastolic_BP: ['舒张压', 'mmHg', 'number'],   Smoke: ['吸烟', '否/是', 'category'], Alcohol: ['饮酒', '否/是/曾有', 'category'],
  Hypertension: ['高血压', '否/是', 'category'], Diabete: ['糖尿病', '否/是', 'category'], stone_history: ['结石史', '否/是', 'category'],
  AgeGroup: ['年龄分组', '年龄段', 'category'], BMIGroup: ['BMI 分组', '体型分类', 'category'], 'Central obesity': ['中心性肥胖', '否/是', 'category']
};

const CATEGORY_OPTIONS = {
  Gender: [['0', '女'], ['1', '男']], Smoke: [['0', '否'], ['1', '是']], Alcohol: [['0', '否'], ['1', '是'], ['2', '曾有']],
  Hypertension: [['0', '否'], ['1', '是']], Diabete: [['0', '否'], ['1', '是']], stone_history: [['0', '否'], ['1', '是']],
  AgeGroup: [['0', '≤24岁'], ['1', '25–34岁'], ['2', '35–44岁'], ['3', '45–54岁'], ['4', '55–64岁'], ['5', '≥65岁']],
  BMIGroup: [['0', '偏瘦'], ['1', '正常'], ['2', '超重'], ['3', '肥胖']], 'Central obesity': [['0', '否'], ['1', '是']]
};

const SAMPLES = [
  { name: '病例 A', values: { Gender: 0, Uric_WBC: 0, Age: 31, Uric_specific_gravity: 1.013, Uric_conductivity: 14.2, Uric_RBC: 0, Waist_to_hip_ratio: 0.92, Uric_PH: 6.5, BRI: 4.36, Systolic_BP: 118 } },
  { name: '病例 B', values: { Gender: 1, Uric_WBC: 1, Age: 54, Uric_specific_gravity: 1.01, Uric_conductivity: 25, Uric_RBC: 0, Waist_to_hip_ratio: 0.96, Uric_PH: 7.5, BRI: 4.8, Systolic_BP: 164 } },
  { name: '病例 C', values: { Gender: 0, Uric_WBC: 28, Age: 45, Uric_specific_gravity: 1.02, Uric_conductivity: 18.5, Uric_RBC: 5, Waist_to_hip_ratio: 0.88, Uric_PH: 6.0, BRI: 5.2, Systolic_BP: 135 } },
  { name: '病例 D', values: { Gender: 1, Uric_WBC: 3, Age: 62, Uric_specific_gravity: 1.005, Uric_conductivity: 8.7, Uric_RBC: 0, Waist_to_hip_ratio: 0.99, Uric_PH: 7.0, BRI: 6.1, Systolic_BP: 148 } },
  { name: '病例 E', values: { Gender: 0, Uric_WBC: 12, Age: 38, Uric_specific_gravity: 1.018, Uric_conductivity: 21.3, Uric_RBC: 2, Waist_to_hip_ratio: 0.85, Uric_PH: 5.5, BRI: 3.9, Systolic_BP: 110 } }
];

function featureLabel(key) {
  return LABELS[key] || [key, '', 'number'];
}

function defaultValue(definition) {
  if (definition.default === null || definition.default === undefined) return '';
  if (typeof definition.default === 'object') {
    return definition.default['1'] ?? definition.default['0'] ?? '';
  }
  return definition.default;
}

function renderField(definition, index) {
  const key = definition.key;
  const detail = featureLabel(key);
  const required = TOP_10.includes(key);
  const options = CATEGORY_OPTIONS[key];
  const raw = defaultValue(definition);
  const fallback = required ? '' : (raw === '' || raw === null || raw === undefined ? '' : Number(raw).toFixed(3));
  const control = options
    ? `<select id="feature-${index}" data-key="${key}" data-default="${typeof definition.default === 'object' ? 'gender' : ''}" data-autofill="${required ? 'false' : 'true'}" aria-label="${detail[0]}"><option value="">请选择</option>${options.map(([value, label]) => `<option value="${value}" ${String(fallback) === value ? 'selected' : ''}>${label}</option>`).join('')}</select>`
    : `<input id="feature-${index}" data-key="${key}" data-default="${typeof definition.default === 'object' ? 'gender' : ''}" data-autofill="${required ? 'false' : 'true'}" value="${fallback}" type="number" step="any" inputmode="decimal" aria-label="${detail[0]}" />`;
  return `<div class="field ${required ? 'field-required' : ''}"><label for="feature-${index}">${detail[0]} ${required ? '<b>必填</b>' : ''}<small>${detail[1]}</small></label>${control}<p class="field-error" id="error-${index}"></p></div>`;
}

function renderForm(metadata) {
  const groups = {};
  metadata.features.forEach((definition, index) => {
    const group = TOP_10.includes(definition.key) ? 'required' : (definition.group || 'other');
    if (!groups[group]) groups[group] = [];
    groups[group].push({ ...definition, index });
  });
  const required = groups.required.sort((a, b) => (a.rank || 99) - (b.rank || 99));
  const others = Object.entries(groups).filter(([group]) => group !== 'required').flatMap(([, definitions]) => definitions);
  document.querySelector('#requiredFields').innerHTML = required.map((definition) => renderField(definition, definition.index)).join('');
  const grouped = {};
  others.forEach((definition) => {
    const key = definition.group || 'other';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(definition);
  });
  document.querySelector('#optionalFields').innerHTML = Object.entries(grouped).map(([group, definitions]) => `<section class="optional-section"><button type="button" class="section-toggle" aria-expanded="false"><span>${GROUPS[group] || group}</span><span>展开</span></button><div class="optional-grid" style="display:none">${definitions.map((definition) => renderField(definition, definition.index)).join('')}</div></section>`).join('');
  document.querySelectorAll('.section-toggle').forEach((button) => button.addEventListener('click', () => {
    const panel = button.nextElementSibling;
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    button.lastElementChild.textContent = expanded ? '展开' : '收起';
    panel.style.display = expanded ? 'none' : 'grid';
  }));
  const gender = metadata.features.find((item) => item.key === 'Gender');
  const genderIndex = metadata.features.indexOf(gender);
  const genderElement = document.querySelector(`#feature-${genderIndex}`);
  if (genderElement) genderElement.addEventListener('change', () => {
    const selectedGender = genderElement.value;
    metadata.features.forEach((definition, index) => {
      if (typeof definition.default !== 'object') return;
      const element = document.querySelector(`#feature-${index}`);
      if (element && element.dataset.autofill === 'true' && selectedGender in definition.default) element.value = definition.default[selectedGender];
    });
  });
  document.querySelectorAll('[data-autofill="true"]').forEach((element) => element.addEventListener('input', () => {
    element.dataset.autofill = 'false';
  }));
}

function readValues(metadata) {
  const values = {};
  metadata.features.forEach((definition, index) => {
    const element = document.querySelector(`#feature-${index}`);
    if (element && element.value !== '') values[definition.key] = Number(element.value);
  });
  return values;
}

function fillValues(metadata, values) {
  metadata.features.forEach((definition, index) => {
    if (!(definition.key in values)) return;
    const element = document.querySelector(`#feature-${index}`);
    if (element) element.value = values[definition.key];
  });
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach((element) => { element.textContent = ''; });
  document.querySelectorAll('.field.invalid').forEach((element) => element.classList.remove('invalid'));
}

function validate(values, metadata) {
  clearErrors();
  const missing = metadata.required_top10.filter((key) => values[key] === undefined || Number.isNaN(values[key]));
  missing.forEach((key) => {
    const definition = metadata.features.find((item) => item.key === key);
    const index = metadata.features.indexOf(definition);
    document.querySelector(`#error-${index}`).textContent = '该字段为必填特征';
    document.querySelector(`#feature-${index}`).closest('.field').classList.add('invalid');
  });
  return missing;
}

function collapseAllSections() {
  document.querySelectorAll('.section-toggle').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
    button.lastElementChild.textContent = '展开';
    button.nextElementSibling.style.display = 'none';
  });
}

export { CATEGORY_OPTIONS, SAMPLES, TOP_10, clearErrors, collapseAllSections, fillValues, readValues, renderForm, validate };
