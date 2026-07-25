const TOP_10 = [
  'Gender', 'Uric_WBC', 'Age', 'Uric_specific_gravity', 'Uric_conductivity',
  'Uric_RBC', 'Waist_to_hip_ratio', 'Uric_PH', 'BRI', 'Systolic_BP'
];

const GROUPS = {
  urinalysis: 'Urinalysis', blood: 'Blood', liver: 'Liver Function', renal: 'Renal Function',
  lipids: 'Lipids', anthrop: 'Anthropometry', vitals: 'Vitals & Lifestyle'
};

const LABELS = {
  Gender: ['Sex', 'Male/Female', 'category'], Uric_WBC: ['Urinary WBC', '/μL', 'number'],
  Age: ['Age', 'years', 'number'], Uric_specific_gravity: ['Urinary Specific Gravity', '', 'number'],
  Uric_conductivity: ['Urinary Conductivity', 'mS/cm', 'number'], Uric_RBC: ['Urinary RBC', '/μL', 'number'],
  Waist_to_hip_ratio: ['Waist-to-Hip Ratio', '', 'number'], Uric_PH: ['Urinary pH', '', 'number'],
  BRI: ['BRI', '', 'number'], Systolic_BP: ['Systolic BP', 'mmHg', 'number'],
  Uric_bacteria: ['Urinary Bacteria', '/μL', 'number'], Uric_epithelium: ['Urinary Epithelium', '/μL', 'number'],
  RBC: ['RBC Count', '×10¹²/L', 'number'], MCV: ['MCV', 'fL', 'number'],
  HCT: ['Hematocrit', 'L/L', 'number'], 'RDW(CV)': ['RDW-CV', '%', 'number'],
  'RDW(SD)': ['RDW-SD', '', 'number'], HB: ['Hemoglobin', 'g/L', 'number'], MCH: ['MCH', 'pg', 'number'],
  MCHC: ['MCHC', 'g/L', 'number'], WBC: ['WBC Count', '×10⁹/L', 'number'],
  Neutrophil_count: ['Neutrophil Count', '×10⁹/L', 'number'], Neutrophil_percentage: ['Neutrophil %', '%', 'number'],
  Lymphocytes_percentage: ['Lymphocyte %', '%', 'number'], Lymphocytes_count: ['Lymphocyte Count', '×10⁹/L', 'number'],
  Monocytes_count: ['Monocyte Count', '×10⁹/L', 'number'], Monocytes_percentage: ['Monocyte %', '%', 'number'],
  Eosinophil_count: ['Eosinophil Count', '×10⁹/L', 'number'], Eosinophil_percentage: ['Eosinophil %', '%', 'number'],
  Basophil_count: ['Basophil Count', '×10⁹/L', 'number'], Basophil_percentage: ['Basophil %', '%', 'number'],
  platelets_count: ['Platelet Count', '×10⁹/L', 'number'], NLR: ['NLR', '', 'number'], BLR: ['BLR', '', 'number'],
  ELR: ['ELR', '', 'number'], MLR: ['MLR', '', 'number'], PLR: ['PLR', '', 'number'],
  AST: ['AST', 'U/L', 'number'], ALT: ['ALT', 'U/L', 'number'], AST_to_ALT_ratio: ['AST/ALT Ratio', '', 'number'],
  GGT: ['GGT', 'U/L', 'number'], AKP: ['ALP', 'U/L', 'number'], Albumin: ['Albumin', 'g/L', 'number'],
  Globulin: ['Globulin', 'g/L', 'number'], ALB_to_GLO_ratio: ['A/G Ratio', '', 'number'], Total_protein: ['Total Protein', 'g/L', 'number'],
  TBIL: ['Total Bilirubin', 'μmol/L', 'number'], DBIL: ['Direct Bilirubin', 'μmol/L', 'number'], IBIL: ['Indirect Bilirubin', 'μmol/L', 'number'],
  'α-HBDH': ['α-HBDH', 'U/L', 'number'], LDH: ['LDH', 'U/L', 'number'], CK: ['CK', 'U/L', 'number'],
  'Cystatin-C': ['Cystatin C', 'mg/L', 'number'], Creatinine: ['Creatinine', 'μmol/L', 'number'], Serum_Urea: ['Urea', 'mmol/L', 'number'],
  Serum_Uric_acid: ['Uric Acid', 'μmol/L', 'number'], eGFR: ['eGFR', 'mL/min', 'number'], Fasting_blood_glucose: ['Fasting Glucose', 'mmol/L', 'number'],
  Triglycerides: ['Triglycerides', 'mmol/L', 'number'], Cholesterol: ['Total Cholesterol', 'mmol/L', 'number'], HDL: ['HDL', 'mmol/L', 'number'], LDL: ['LDL', 'mmol/L', 'number'],
  Weight: ['Weight', 'kg', 'number'], Height: ['Height', 'cm', 'number'], BMI: ['BMI', 'kg/m²', 'number'], Waistline: ['Waist', 'cm', 'number'], Hips: ['Hips', 'cm', 'number'],
  ABSI: ['ABSI', '', 'number'], Diastolic_BP: ['Diastolic BP', 'mmHg', 'number'],   Smoke: ['Smoking', 'No/Yes', 'category'], Alcohol: ['Alcohol', 'No/Yes/Former', 'category'],
  Hypertension: ['Hypertension', 'No/Yes', 'category'], Diabete: ['Diabetes', 'No/Yes', 'category'], stone_history: ['Stone History', 'No/Yes', 'category'],
  AgeGroup: ['Age Group', '', 'category'], BMIGroup: ['BMI Group', '', 'category'], 'Central obesity': ['Central Obesity', 'No/Yes', 'category']
};

const CATEGORY_OPTIONS = {
  Gender: [['0', 'Female'], ['1', 'Male']], Smoke: [['0', 'No'], ['1', 'Yes']], Alcohol: [['0', 'No'], ['1', 'Yes'], ['2', 'Former']],
  Hypertension: [['0', 'No'], ['1', 'Yes']], Diabete: [['0', 'No'], ['1', 'Yes']], stone_history: [['0', 'No'], ['1', 'Yes']],
  AgeGroup: [['0', '≤24'], ['1', '25–34'], ['2', '35–44'], ['3', '45–54'], ['4', '55–64'], ['5', '≥65']],
  BMIGroup: [['0', 'Underweight'], ['1', 'Normal'], ['2', 'Overweight'], ['3', 'Obese']], 'Central obesity': [['0', 'No'], ['1', 'Yes']]
};

const SAMPLES = [
  { name: 'Case #1', values: { Gender: 0, Uric_WBC: 0, Age: 31, Uric_specific_gravity: 1.013, Uric_conductivity: 14.2, Uric_RBC: 0, Waist_to_hip_ratio: 0.92, Uric_PH: 6.5, BRI: 4.36, Systolic_BP: 118 } },
  { name: 'Case #2', values: { Gender: 1, Uric_WBC: 1, Age: 54, Uric_specific_gravity: 1.01, Uric_conductivity: 25, Uric_RBC: 0, Waist_to_hip_ratio: 0.96, Uric_PH: 7.5, BRI: 4.8, Systolic_BP: 164 } },
  { name: 'Case #3', values: { Gender: 0, Uric_WBC: 28, Age: 45, Uric_specific_gravity: 1.02, Uric_conductivity: 18.5, Uric_RBC: 5, Waist_to_hip_ratio: 0.88, Uric_PH: 6.0, BRI: 5.2, Systolic_BP: 135 } },
  { name: 'Case #4', values: { Gender: 1, Uric_WBC: 3, Age: 62, Uric_specific_gravity: 1.005, Uric_conductivity: 8.7, Uric_RBC: 0, Waist_to_hip_ratio: 0.99, Uric_PH: 7.0, BRI: 6.1, Systolic_BP: 148 } },
  { name: 'Case #5', values: { Gender: 0, Uric_WBC: 12, Age: 38, Uric_specific_gravity: 1.018, Uric_conductivity: 21.3, Uric_RBC: 2, Waist_to_hip_ratio: 0.85, Uric_PH: 5.5, BRI: 3.9, Systolic_BP: 110 } }
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
    ? `<select id="feature-${index}" data-key="${key}" data-default="${typeof definition.default === 'object' ? 'gender' : ''}" data-autofill="${required ? 'false' : 'true'}" aria-label="${detail[0]}"><option value="">Select...</option>${options.map(([value, label]) => `<option value="${value}" ${String(fallback) === value ? 'selected' : ''}>${label}</option>`).join('')}</select>`
    : `<input id="feature-${index}" data-key="${key}" data-default="${typeof definition.default === 'object' ? 'gender' : ''}" data-autofill="${required ? 'false' : 'true'}" value="${fallback}" type="number" step="any" inputmode="decimal" aria-label="${detail[0]}" />`;
  return `<div class="field ${required ? 'field-required' : ''}"><label for="feature-${index}">${detail[0]} ${required ? '<b>Required</b>' : ''}<small>${detail[1]}</small></label>${control}<p class="field-error" id="error-${index}"></p></div>`;
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
  document.querySelector('#optionalFields').innerHTML = Object.entries(grouped).map(([group, definitions]) => `<section class="optional-section"><button type="button" class="section-toggle" aria-expanded="false"><span>${GROUPS[group] || group}</span><span>Expand</span></button><div class="optional-grid" style="display:none">${definitions.map((definition) => renderField(definition, definition.index)).join('')}</div></section>`).join('');
  document.querySelectorAll('.section-toggle').forEach((button) => button.addEventListener('click', () => {
    const panel = button.nextElementSibling;
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    button.lastElementChild.textContent = expanded ? 'Expand' : 'Collapse';
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
    if (!element) return;
    const v = values[definition.key];
    // 分类字段用原值，数值字段截 3 位小数
    const isCategory = CATEGORY_OPTIONS[definition.key];
    element.value = isCategory ? v : Number(v).toFixed(3);
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
    document.querySelector(`#error-${index}`).textContent = 'This field is required';
    document.querySelector(`#feature-${index}`).closest('.field').classList.add('invalid');
  });
  return missing;
}

function collapseAllSections() {
  document.querySelectorAll('.section-toggle').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
    button.lastElementChild.textContent = 'Expand';
    button.nextElementSibling.style.display = 'none';
  });
}

export { CATEGORY_OPTIONS, SAMPLES, TOP_10, clearErrors, collapseAllSections, fillValues, readValues, renderForm, validate };
