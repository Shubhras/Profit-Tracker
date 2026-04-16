# 🚀 Profit-Tracker: Amazon Profit Analytics SaaS

Profit-Tracker is a robust, production-ready SaaS application designed for Amazon Selling Partners. It provides deep financial insights, real-time profit tracking, and automated reconciliation across multiple marketplaces, starting with Amazon India.

---

## 🏗️ Project Architecture

The application is built using a modern decoupled architecture:

- **Frontend:** React 18 with Tailwind CSS, Redux for state management, and Ant Design for UI components.
- **Backend:** Django Rest Framework (DRF) serving as the API layer, integrated with Amazon SP-API.
- **Database:** SQLite (Development) / PostgreSQL (Production ready).
- **Authentication:** JWT (JSON Web Tokens) with secure cookie-based storage.

---

## ✨ Key Features

### 📊 Advanced Analytics
- **Live Dashboard:** Real-time metrics for Sales, Net Profit, Margin, and ROI.
- **Pivot Tables:** Multi-dimensional analysis of performance by date and marketplace.
- **Product Analysis:** SKU-level profitability tracking with automated fee estimation.
- **Marketplace Trends:** Heatmaps and trend charts for multi-marketplace comparison.

### 🔄 Multi-Channel Sync
- **Smart Sync:** Automatically pulls orders, finances, and reports from Amazon SP-API.
- **Hybrid Data Fetching:** Defaults to local database for speed, but allows "Live Sync" for the latest records.

### 💰 Financial Reconciliation
- Automated settlement tracking to ensure every rupee from Amazon is accounted for.
- Fee leak identification and return ledger management.

### 🛡️ Secure SaaS Features
- **Subscription Management:** Multi-tier access control (Free vs. Premium).
- **Multi-Tenant Isolation:** Secure data separation between different sellers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Redux, Tailwind CSS, Ant Design, ApexCharts, Framer Motion |
| **Backend** | Python, Django, Django Rest Framework, Amazon SP-API (python-amazon-sp-api) |
| **Auth** | JWT (SimpleJWT), CORS Headers, secure cookies |
| **Deployment** | Python-dotenv, Craco (Frontend config), Gunicorn (Production) |

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup
```bash
npm install
npm start
```

---

## 🔗 API Documentation Summary

The backend exposes a rich set of RESTful endpoints. Detailed documentation can be found in [backend/README_API.md](./backend/README_API.md).

### Quick Reference:
| Purpose | Endpoint | Method |
| :--- | :--- | :--- |
| Dashboard Data | `/api/amazon/dashboard-stats/` | `GET/POST` |
| Pivot Analytics | `/api/amazon/pivot-stats/` | `GET/POST` |
| Manual Order Sync | `/api/amazon/sync-orders/` | `GET` |
| User Login | `/api/user/login/` | `POST` |

---

## 📂 Directory Structure
- `/src`: React source code (Containers, Components, Redux logic).
- `/backend`: Django project files (Apps: `amazon_auth`, `user_auth`, `subscription`).
- `/public`: Static assets and icons.
- `DOCUMENTATION.md`: Detailed frontend documentation.

---
Developed with ❤️ by the Profit-Tracker Team.
