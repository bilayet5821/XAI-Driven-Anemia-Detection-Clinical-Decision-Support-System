<div align="center">

# 🩸 XAI-Driven Clinical Decision Support System

### Interpretable Anemia Classification Using Raw Hematological Parameters

**Research-Oriented Explainable AI + Interactive Clinical Decision Support Software**

[![Research](https://img.shields.io/badge/Research-Explainable%20AI-blue?style=for-the-badge)](#)
[![XAI](https://img.shields.io/badge/XAI-SHAP-red?style=for-the-badge)](#)
[![Random Forest](https://img.shields.io/badge/Random%20Forest-98.98%25-success?style=for-the-badge)](#)
[![Healthcare AI](https://img.shields.io/badge/Domain-Healthcare%20AI-purple?style=for-the-badge)](#)

### 🏆 1st Runner-Up — Research Poster Presentation
**5th National Data Science Summit 2026 — Daffodil International University**

</div>

---

## 📌 Overview

This project presents an **Explainable Artificial Intelligence (XAI)-driven Clinical Decision Support System (CDSS)** for interpretable anemia classification using raw hematological parameters.

The research investigates machine-learning approaches for anemia classification while addressing an important limitation of conventional predictive systems: **lack of interpretability**.

The proposed framework combines predictive modeling with **SHAP (SHapley Additive exPlanations)** to provide feature-level explanations for model predictions. An interactive software interface further demonstrates how the research framework can be translated into a practical clinical decision-support prototype.

The project therefore focuses on two complementary goals:

- 🔬 **Research:** Accurate and interpretable machine-learning-based anemia classification
- 💻 **Software Development:** Translating the proposed framework into an interactive decision-support application

> **Research Disclaimer:** This system is developed for research and educational purposes. It is not intended to replace professional medical diagnosis or clinical judgment.

---

## 🏆 Achievement

This research project achieved:

### 🥈 1st Runner-Up — Research Poster Presentation

at the **5th National Data Science Summit 2026**, organized at  
**Daffodil International University (DIU), Bangladesh**.

📄 **[View Research Poster](assets/XAI-Anemia-Research-Poster-DIU-2026.pdf)**

---

## 🎯 Research Motivation

Anemia is a major global health problem associated with low hemoglobin levels or insufficient red blood cells.

Machine-learning models can assist in automated anemia screening, but high predictive performance alone is not sufficient for trustworthy clinical decision support.

Many predictive systems operate as **black-box models**, making it difficult to understand which hematological parameters influenced a particular prediction.

This research addresses that challenge by integrating:

- Machine Learning
- Explainable Artificial Intelligence (XAI)
- Hematological Feature Engineering
- SHAP-based Interpretation
- Clinical Decision Support
- Interactive Software Visualization

The objective is to move from:

> **Prediction → Explanation → Interpretable Decision Support**

---

## 🔬 Research Objectives

The primary objectives of this research are:

1. Develop an AI-based anemia classification framework using hematological parameters.
2. Build and evaluate multiple machine-learning models for anemia prediction.
3. Investigate feature engineering for improving hematological representation.
4. Integrate **SHAP-based explainability** for transparent prediction analysis.
5. Develop an interactive clinical decision-support prototype for real-time anemia screening.

---

## ✨ Key Research Contributions

- Developed an AI-based framework for anemia classification from hematological parameters.
- Evaluated multiple machine-learning algorithms for predictive performance.
- Achieved a reported **98.98% accuracy using Random Forest**.
- Introduced an **Hb–MCV Ratio** as an engineered feature.
- Integrated **SHAP explainability** for feature-level interpretation.
- Developed an interactive clinical decision-support prototype.
- Combined predictive performance with interpretable AI for healthcare-oriented decision support.

---

## 🏥 Dataset

The study uses a hematological dataset collected from **Medical Centre Hospital, Chattogram, Bangladesh**.

| Property | Details |
|---|---|
| Records | 1,004 patients |
| Input Features | 9 hematological parameters |
| Classes | Anemia / Normal |
| Classification Type | Binary Classification |
| Domain | Hematology / Healthcare AI |

### Dataset Reference

**Raw Hematological Dataset for Anemia Analysis and Classification**  
Mendeley Data, Version 1, 2026.

> Dataset usage and redistribution should follow the terms of the original dataset source.

---

## 🔬 Research Methodology

```text
Raw Hematological Data
          │
          ▼
    Data Processing
          │
          ▼
   Feature Engineering
     (Hb–MCV Ratio)
          │
          ▼
Machine Learning Models
          │
          ▼
 Model Evaluation & Comparison
          │
          ▼
     Random Forest
          │
          ▼
    Anemia Prediction
          │
          ▼
   SHAP Explainability
          │
          ▼
Interpretable Decision Support
          │
          ▼
 Interactive Software Interface
```

---

## ⚙️ Machine Learning Experiments

Multiple machine-learning models were evaluated during the research.

| Model | Reported Accuracy |
|---|---:|
| Logistic Regression | 97.50% |
| Gradient Boosting | 98.80% |
| XGBoost | 97.50% |
| **Random Forest** | **98.98%** |

Among the evaluated models, **Random Forest achieved the highest reported accuracy of 98.98%**.

---

## 🧠 Explainable Artificial Intelligence

Predictive accuracy alone does not explain why a model makes a particular decision.

To improve transparency, this research integrates **SHAP (SHapley Additive exPlanations)**.

SHAP analysis enables:

- Global feature-importance analysis
- Patient-level prediction interpretation
- Feature contribution analysis
- SHAP waterfall explanations
- Identification of influential hematological parameters
- More transparent interpretation of model decisions

Instead of providing only:

```text
Prediction: Anemia
```

the framework aims to provide:

```text
Prediction
    +
Confidence
    +
Feature Contributions
    +
Explainable Interpretation
```

---

## 💻 Software Development

In addition to the machine-learning research, the project includes an interactive software prototype that demonstrates how the proposed XAI framework can be presented as a usable decision-support system.

### Software Features

- Interactive hematological parameter input
- Real-time prediction interface
- Anemia / Normal classification
- Prediction confidence visualization
- SHAP contribution visualization
- Patient-level explainability
- Interactive clinical dashboard
- Responsive user interface

The software layer connects the research methodology with an accessible interface for demonstrating interpretable AI-assisted screening.

---

## 🛠️ Repository Technology Stack

The current software implementation uses a modern web application architecture.

| Layer | Technology |
|---|---|
| Frontend | React |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | CSS |
| Server | TypeScript / Node-based server |
| Research Model | Random Forest |
| Explainability | SHAP |
| Domain | Healthcare AI / Clinical Decision Support |

> The machine-learning research methodology and the web-based demonstration application represent complementary components of the overall project.

---

## 📂 Repository Structure

```text
XAI-Driven-Anemia-Detection-Clinical-Decision-Support-System/
│
├── assets/
│   └── XAI-Anemia-Research-Poster-DIU-2026.pdf
│
├── src/
│   ├── components/
│   │   └── SHAPContributionChart.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── README.md
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Running the Software Locally

### 1. Clone the Repository

```bash
git clone https://github.com/bilayet5821/XAI-Driven-Anemia-Detection-Clinical-Decision-Support-System.git
```

### 2. Enter the Project Directory

```bash
cd XAI-Driven-Anemia-Detection-Clinical-Decision-Support-System
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

If required, create your local environment file based on:

```text
.env.example
```

Do not commit private credentials or API keys.

### 5. Run the Application

```bash
npm run dev
```

Then open the local URL displayed in the terminal.

---

## 📊 Research Results

The experimental evaluation demonstrated strong classification performance across several machine-learning algorithms.

The best-performing model was:

**Random Forest — 98.98% reported accuracy**

The research additionally integrates SHAP analysis to improve the interpretability of predictions and provide insight into the contribution of individual hematological parameters.

---

## 📸 Research & Software Preview

This section can include:

- Clinical dashboard interface
- Prediction results
- SHAP contribution visualization
- SHAP waterfall plot
- ROC-AUC analysis
- Research methodology diagram
- Poster presentation

Example structure:

```text
assets/
├── dashboard.png
├── prediction-example.png
├── shap-analysis.png
├── methodology.png
└── XAI-Anemia-Research-Poster-DIU-2026.pdf
```

---

## 🌍 Potential Impact

The proposed framework demonstrates the potential of combining **machine learning and explainable AI** for healthcare-oriented decision-support research.

Potential future applications include:

- Hospitals
- Diagnostic laboratories
- Primary healthcare facilities
- Rural healthcare environments
- Telemedicine platforms
- AI-assisted screening systems

Further clinical validation would be required before any real-world clinical deployment.

---

## 🔭 Future Research

Future work includes:

- Evaluation using larger real-world multicenter datasets
- External validation across different patient populations
- Investigation of advanced ensemble and deep-learning models
- Improved explainability and uncertainty estimation
- Cloud-based decision-support deployment
- Evaluation of clinical usability
- Integration with broader healthcare information systems

---

## 👥 Research Team

### **Md. Bilayet Hossain**
**First Author**  
Department of Computer Science and Engineering  
Daffodil International University, Bangladesh

Research Interests: Artificial Intelligence, Computer Vision, Medical Image Analysis, Explainable AI & Deep Learning

---

### **Md. Asif Khandokar**
Department of Computer Science and Engineering  
Daffodil International University, Bangladesh

---

### **Sadaf M. Anis**
Department of Computer Science and Engineering  
Daffodil International University, Bangladesh

---

## 📄 Research Poster

The research methodology, experimental results, SHAP analysis, clinical decision-support interface, and research contributions are summarized in the official poster.

### 🏆 1st Runner-Up
**Research Poster Presentation — 5th National Data Science Summit 2026, DIU**

📄 **[View the Full Research Poster](assets/XAI-Anemia-Research-Poster-DIU-2026.pdf)**

---

## 📜 Citation

If you use or build upon this research, please acknowledge the authors and this repository.

```text
Md. Bilayet Hossain, Md. Asif Khandokar, and Sadaf M. Anis,
"XAI-Driven Clinical Decision Support System for Interpretable
Anemia Classification Using Raw Hematological Parameters,"
Daffodil International University, 2026.
```

---

## ⚖️ Responsible Use

This repository is intended for **academic research, education, and software demonstration purposes**.

The predictions generated by this prototype should **not** be interpreted as medical diagnoses or used independently for clinical decision-making.

---

<div align="center">

### ⭐ Research • Explainability • Healthcare AI • Software Engineering

**Building interpretable AI systems that connect research with real-world software.**

</div>