# Nivas AI - Real Estate Platform

Nivas AI is a cutting-edge real estate property management and smart leasing pipeline designed to mitigate rental fraud using Artificial Intelligence. Built on the MERN stack with advanced verification capabilities, the platform provides a completely digital and secured workflow bridging Owners, Tenants, and Police Authorities.

## 🚀 Key Features

* **Role-Based Workflows:** Distinct and secure dashboards with specialized scopes for **Owners** (Property Management), **Tenants** (Verification & Applications), and **Police Authorities** (Background Checks).
* **Sentinel AI Fraud Engine:** Real-time evaluation calculating dynamic 'Trust Scores' through KYC extraction. Actively safeguards the platform against high-risk flags or forged identities.
* **Police Validation Pipeline:** Background check requests are aggregated into a transparent queue for authorities to digitally review associated real estate leases and approve or lock candidates.
* **Smart Leasing System:** Seamless, automated mapping of matching rent offers to mathematically secure digital leases, accompanied by valid 'No Objection Certificates' (NOC).

## 🛠️ Technology Stack

* **Frontend:** React.js, TailwindCSS, Vite
* **Backend:** Node.js, Express.js
* **Database & ORM:** PostgreSQL / MongoDB managed via Prisma
* **AI & Security:** LLM-driven credential extraction.

## ⚙️ Project Structure

The repository contains two operational segments:
- `/frontend` - Client-side interface comprising of complex state management mapping across various persona dashboards.
- `/backend` - REST API processing authentication, risk-detection micro-services, leasing actions, and database transactions.

## 💻 Standard Installation & Setup

Before execution, ensure you have established `.env` parameters correctly for database configurations and API keys inside `backend/.env`.

**Backend Initialization:**
```bash
cd backend
npm install
npm run dev
```

**Frontend Initialization:**
```bash
cd frontend
npm install
npm run dev
```

## 🛡️ Security Architecture
When an application encounters a Trust Score beneath the `30%` threshold threshold by the Sentinel AI service, standard application mechanisms dynamically disable. The platform ensures completely clean real estate leasing without owner liability.
