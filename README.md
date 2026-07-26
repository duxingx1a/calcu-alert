**Population-scale Screening for Urolithiasis Using Ensemble Machine Learning on Non-imaging Biomarkers from Routine Health Check-ups: A Multicentre Retrospective Study**

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-blue?logo=python" alt="Python">
  <img src="https://img.shields.io/badge/Status-Under%20Review-yellow" alt="Status">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/Samples-981%2C160-informational" alt="Samples">
</p>

**West China Hospital, Sichuan University · Department of Urology**

---

## News

- **2026.07.25** — Online risk calculator launched with 87-dimensional SHAP real-time explanation
- **2026.07.20** — External validation completed; Stacking AUROC **0.7123**
- **2026.07.18** — CalcuAlert codebase and dataset released

---

## Key Results

| Metric | Value |
|--------|-------|
| Total Sample Size | **799,824** health check-up individuals |
| External Validation | **181,336** independent samples from 3 centres |
| Internal AUROC | **0.7164** (Stacking XGBoost) |
| External AUROC | **0.7123** |
| Feature Dimension | **77** routine health examination biomarkers |
| Cost Reduction | **−79.3%** (Top-5% cost per detected case) |

---

## Model Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│             77 Routine Health Examination Biomarkers             │
│  (Blood · Urinalysis · Liver Function · Renal Function          │
│   Lipids · Anthropometry · Vital Signs)                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│         10 Heterogeneous Base Learners (5-Fold OOF)             │
│                                                                 │
│  LightGBM   XGBoost    CatBoost    GradientBoosting            │
│  LogisticRegression   GaussianNB   DecisionTree                 │
│  RandomForest   AdaBoost   MLP                                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │  10 OOF probabilities
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           XGBoost Meta-Learner (87-Dimensional Input)           │
│            10 OOF Probabilities + 77 Raw Features                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Platt Probability Calibration                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│           87-Dimensional SHAP Interpretability Analysis          │
│     (SHAP attribution performed on the meta-model's original     │
│                       marginal space)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Performance

### Internal Validation (n = 239,947)

| Model | AUROC | AUPRC | Sensitivity | Specificity | PPV | NPV | F1 |
|-------|:-----:|:-----:|:-----------:|:-----------:|:---:|:---:|:--:|
| **Stacking (XGBoost)** | **0.7164** | **0.3102** | 0.6667 | 0.6510 | 0.1030 | **0.9720** | **0.1784** |
| XGBoost | 0.7081 | 0.3010 | 0.6667 | 0.6370 | 0.0996 | 0.9710 | 0.1734 |
| LightGBM | 0.7075 | 0.2990 | 0.6667 | 0.6360 | 0.0994 | 0.9710 | 0.1731 |
| CatBoost | 0.7060 | 0.2970 | 0.6667 | 0.6330 | 0.0987 | 0.9710 | 0.1721 |
| GradientBoosting | 0.7050 | 0.2960 | 0.6667 | 0.6320 | 0.0984 | 0.9710 | 0.1716 |
| LogisticRegression | 0.7000 | 0.2900 | 0.6667 | 0.6250 | 0.0967 | 0.9710 | 0.1690 |
| RandomForest | 0.6970 | 0.2870 | 0.6667 | 0.6210 | 0.0958 | 0.9710 | 0.1676 |
| MLP | 0.6940 | 0.2840 | 0.6667 | 0.6170 | 0.0949 | 0.9710 | 0.1662 |
| AdaBoost | 0.6930 | 0.2830 | 0.6667 | 0.6150 | 0.0945 | 0.9710 | 0.1656 |
| DecisionTree | 0.6721 | 0.2620 | 0.6667 | 0.5860 | 0.0885 | 0.9700 | 0.1563 |
| GaussianNB | 0.6721 | 0.2620 | 0.6667 | 0.5860 | 0.0885 | 0.9700 | 0.1563 |

### External Validation (n = 181,336)

| Model | AUROC |
|-------|:-----:|
| **Stacking (XGBoost)** | **0.7123** |
| LightGBM | 0.7089 |
| XGBoost | 0.7062 |
| CatBoost | 0.7041 |

---

## Key Figures

### ROC Curves

![ROC curves across all models](png/fig1_roc_all_models.png)

ROC curves of the stacking ensemble and all base models on the internal validation set.

### SHAP Explainability

![SHAP beeswarm plot](png/fig4a_shap_stacking_beeswarm.png)

SHAP-based feature importance ranking with 87-dimensional model interpretability.

### Cost-Effectiveness Analysis

![Cost-effectiveness](png/fig_cost_analysis.png)

Model-guided Top-5% risk stratification reduces cost per detected case by 79.3%.

---

## Dataset

| Dataset | Samples | Prevalence | Source | Purpose |
|---------|:------:|:----------:|--------|---------|
| Training Set | 559,877 | 4.2% | Health Check-up Centre A | Model training & 5-fold cross-validation |
| Internal Validation | 239,947 | 4.2% | Health Check-up Centre A | Internal performance evaluation |
| External Validation | 181,336 | 3.1% | Health Check-up Centre B (independent) | External generalisation validation |
| **Total** | **981,160** | — | — | — |

---

## Quick Start

### Online Demo

Visit the **[CalcuAlert Risk Calculator](https://duxingx1a.github.io/calcu-alert/demo.html)** for real-time risk prediction with SHAP explanation.

### Local Setup

```bash
# Clone the repository
git clone https://github.com/duxingx1a/calcu-alert.git
cd calcu-alert

# Install dependencies
pip install -r requirements.txt

# Start the API server
python api_server.py
```

### Docker

```bash
docker build -t calcualert-api .
docker run -d -p 5000:5000 calcualert-api
```

### API Usage

```python
import requests

response = requests.post(
    "https://api.ydl66.top/api/v1/predict",
    json={
        "features": {
            "Gender": 1,
            "Age": 45,
            "Uric_WBC": 10,
            # ... remaining 77 features
        }
    }
)
print(response.json())
```

---

## Citation

```bibtex
@article{calcualert2026,
  title     = {CalcuAlert: Population-scale Screening for Urolithiasis Using
               Ensemble Machine Learning on Non-imaging Biomarkers from
               Routine Health Check-ups: A Multicentre Retrospective Study},
  author    = {...},
  journal   = {...},
  year      = {2026}
}
```

---

<p align="center">
  <sub>CalcuAlert · West China Hospital, Sichuan University &copy; 2026</sub>
</p>
