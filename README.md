---
title: Neurothon Demo
emoji: 🧠
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# 🧠 FocusFlow Hub: Neurodiversity-Optimized Productivity

[![Deployment Status](https://img.shields.io/badge/Hugging_Face-Live_Demo-orange?style=for-the-badge&logo=huggingface)](https://huggingface.co/spaces/GouravluinorXXX/neurothon-demo)
[![Python](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

**FocusFlow Hub** is an AI-powered task management platform designed specifically for neurodivergent individuals (ADHD, Autism, Dyslexia). Developed for **Neurothon**, it leverages **Google Gemini Pro** to transform overwhelming projects into cognitively accessible micro-steps.



---

## 🚀 The Problem & Our Solution

Traditional productivity tools often induce "Executive Dysfunction" paralysis by presenting users with massive, unstructured lists. 

**FocusFlow** solves this by offering three distinct "Cognitive Profiles":
* **⚡ ADHD Mode:** High-stimulation UI. Uses AI to break tasks into tiny 5-minute "micro-steps" to build dopamine momentum.
* **🌊 Autism Mode:** Low-sensory, linear workflow. Focuses on predictable structure and clear start/end states with zero visual clutter.
* **📖 Dyslexia Mode:** Accessibility-first. Integrates the **OpenDyslexic** font and high-contrast color schemes to reduce reading fatigue.

---

## 🛠️ Tech Stack & Architecture

### **Core Components**
* **Backend:** FastAPI (Python 3.11) - Selected for its high performance and native async support.
* **Frontend:** React (Vite) + Tailwind CSS - Provides a fluid, reactive UI crucial for low-latency focus modes.
* **AI Engine:** Google Gemini Pro - Handles intelligent task decomposition and personalized advice.
* **Database:** SQLite + SQLAlchemy - Used for lightweight, local-first persistence during the demo phase.

### **System Architecture**


---

## 🔧 Installation & Local Setup

### **Prerequisites**
* Python 3.11+
* Node.js 20+
* Google Gemini API Key

### **1. Backend Setup**
```bash
cd Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
