<p align="center">
  <img src="pg/png/fig4a_shap_stacking_beeswarm.png" alt="CalcuAlert" width="100%">
</p>

<h1 align="center">CalcuAlert</h1>

<p align="center">
  <b>基于常规体检生物标志物的集成学习尿路结石筛查研究</b><br>
  <i>Ensemble Learning for Urinary Stone Screening Using Routine Health Examination Biomarkers</i>
</p>

<p align="center">
  <a href="https://duxingx1a.github.io/calcu-alert/"><img src="https://img.shields.io/badge/Project_Page-Online-2563eb?style=flat-square" alt="Project Page"></a>
  <a href="https://duxingx1a.github.io/calcu-alert/demo.html"><img src="https://img.shields.io/badge/Demo-Online-brightgreen?style=flat-square" alt="Demo"></a>
  <a href="https://github.com/duxingx1a/calcu-alert"><img src="https://img.shields.io/badge/Code-GitHub-181717?style=flat-square&logo=github" alt="GitHub"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License"></a>
</p>

<p align="center">
  <b>四川大学华西医院泌尿外科</b>
</p>

---

## 📰 新闻

- **2026.07.25** — 在线风险计算器上线，支持 87 维 SHAP 实时解释
- **2026.07.20** — 外部验证完成，Stacking AUROC 0.7123
- **2026.07.18** — CalcuAlert 项目代码与数据集发布

---

## 🎯 核心贡献

| 指标 | 数值 |
|------|------|
| 总样本量 | **799,824** 例体检人群 |
| 外部验证 | **181,336** 例独立样本 |
| 内部 AUROC | **0.7164** (Stacking XGBoost) |
| 外部 AUROC | **0.7123** |
| 特征维度 | 77 项常规体检指标 |
| 成本降低 | **−79.3%** (Top-5% 每例检出成本) |

---

## 🏗️ 模型架构

```
┌─────────────────────────────────────────────────────────────────┐
│                   77 项常规体检特征                               │
│  (血常规 · 尿常规 · 肝功能 · 肾功能 · 血脂 · 人体测量 · 生命体征) │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   10 个异质基模型 (5-Fold OOF)                    │
│                                                                  │
│  LightGBM  XGBoost  CatBoost  GradientBoosting  LogisticRegression│
│  GaussianNB  DecisionTree  RandomForest  AdaBoost  MLP          │
└───────────────────────────┬─────────────────────────────────────┘
                            │ 10 个 OOF 概率
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              XGBoost 元学习器 (87 维输入)                         │
│              10 OOF 概率 + 77 原始特征                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Platt 概率校准                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              87 维 SHAP 可解释性分析                              │
│          (在元模型原始边际空间进行 SHAP 归因)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 性能对比

### 内部验证 (n=239,947)

| 模型 | AUROC | AUPRC | 敏感性 | 特异性 | PPV | NPV | F1 |
|------|:-----:|:-----:|:------:|:------:|:---:|:---:|:--:|
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

### 外部验证 (n=181,336)

| 模型 | AUROC |
|------|:-----:|
| **Stacking (XGBoost)** | **0.7123** |
| XGBoost | 0.7062 |
| LightGBM | 0.7089 |
| CatBoost | 0.7041 |

---

## 📈 关键图表

### ROC 曲线

<p align="center">
  <img src="pg/png/fig1_roc_all_models.png" alt="全模型 ROC 曲线" width="80%">
</p>

### SHAP 可解释性

<p align="center">
  <img src="pg/png/fig4a_shap_stacking_beeswarm.png" alt="SHAP 蜂群图" width="80%">
</p>

### 成本效益分析

<p align="center">
  <img src="pg/png/fig7_topk_analysis.png" alt="Top-K 风险分层分析" width="80%">
</p>

---

## 📦 数据集

| 数据集 | 样本量 | 阳性率 | 来源 | 用途 |
|--------|:------:|:------:|------|------|
| 训练集 | 559,877 | 4.2% | 体检中心 A | 模型训练与 5 折交叉验证 |
| 内部验证集 | 239,947 | 4.2% | 体检中心 A | 内部性能评估 |
| 外部验证集 | 181,336 | 3.1% | 体检中心 B（独立） | 外部泛化验证 |
| **合计** | **981,160** | — | — | — |

---

## 🚀 快速开始

### 在线体验

访问 **[CalcuAlert 在线计算器](https://duxingx1a.github.io/calcu-alert/demo.html)** 体验实时风险预测与 SHAP 解释。

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/duxingx1a/calcu-alert.git
cd calcu-alert

# 安装依赖
pip install -r requirements.txt

# 启动 API 服务
python api_server.py
```

### Docker 部署

```bash
docker build -t calcualert-api .
docker run -d -p 5000:5000 calcualert-api
```

### API 调用

```python
import requests

response = requests.post(
    "https://api.ydl66.top/api/v1/predict",
    json={
        "features": {
            "Gender": 1,
            "Age": 45,
            "Uric_WBC": 10,
            # ... 其他 77 项特征
        }
    }
)
print(response.json())
```

---

## 📖 引用

```bibtex
@article{calcualert2026,
  title={CalcuAlert: A Stacking Ensemble Framework for Urinary Stone Risk Prediction Using Routine Health Examination Biomarkers},
  author={...},
  journal={...},
  year={2026}
}
```

---

<p align="center">
  <b>CalcuAlert</b> · 四川大学华西医院泌尿外科 © 2026<br>
  <sub>Built with ❤️ for better stone screening</sub>
</p>
