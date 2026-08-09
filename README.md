# 🥥 Coco Care

> An AI-powered platform that helps coconut farmers detect diseases early, get expert-grounded advice, and connect with agricultural officers.

Coco Care combines computer-vision disease diagnosis, a Retrieval-Augmented-Generation (RAG) chatbot trained on real Coconut Research Institute (CRI) manuals, live weather, and a regional disease heatmap — all wrapped in a clean, modern web app with dedicated dashboards for **farmers, officers, and admins**.

---

## ✨ Features

- 🔬 **AI Disease Diagnosis** — Detect coconut leaf diseases from photos or by describing symptoms.
- 🤖 **Grounded AI Chatbot** — Ask farming questions and get answers sourced only from CRI advisory circulars (RAG).
- 🗺️ **Disease Heatmap** — Visualize disease outbreaks across regions on an interactive map.
- 🌦️ **Weather Forecast** — Location-based forecasts to plan farm activities.
- 📋 **Report & Review Workflow** — Farmers submit reports; officers verify and advise.
- 👥 **Role-Based Access** — Separate experiences for Farmers, Officers, and Admins.
- 🛠️ **Admin Console** — Manage users, farms, reports, notifications, and system health.

---

## 🧱 Tech Stack

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui + Radix + MUI
- React Router, TanStack Query, Leaflet maps, Recharts

**Backend**
- Node.js 20+ + Express 4 + TypeScript
- PostgreSQL 16 + pgvector (vector search)
- JWT + bcrypt auth, Zod validation
- Layered architecture: `routes → controller → service → repository`

**AI & Integrations**
- Google Gemini (embeddings) + Groq (LLM) for the RAG chatbot
- Azure Computer Vision (leaf image analysis)
- OpenWeatherMap (forecasts) • AWS S3 (image storage)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL + pgvector)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # add your API keys
npm run db:up             # start PostgreSQL + pgvector
npm run db:migrate        # apply schema
npm run db:seed           # seed users, farm, CRI knowledge, demo reports
npm run dev               # http://localhost:3000
```

### 2. Frontend

```bash
cd front_end
npm install
# set VITE_API_BASE_URL=http://localhost:3000 in .env
npm run dev               # http://localhost:5173
```

---

## 🔑 Demo Accounts

All demo users share the password: `password`

| Username   | Role    |
|------------|---------|
| `akeel`    | Farmer  |
| `officer1` | Officer |
| `admin`    | Admin   |

---

## 📁 Project Structure

```
Coco-care/
├── backend/          # Express API, PostgreSQL, RAG pipeline
│   ├── src/
│   │   ├── modules/       # auth, diagnosis, chat, reports, weather, admin…
│   │   ├── services/      # Gemini, Groq, Azure Vision, weather, S3
│   │   ├── repositories/  # data access
│   │   └── db/            # pool, migrate, seed
│   ├── sql/          # migrations
│   └── data/         # CRI manuals for the knowledge base
└── front_end/        # React + Vite app
    └── src/app/      # pages, layouts, components, routes
```

---

## 🧪 Testing

```bash
cd backend
npm run test          # Jest + Supertest (requires a running DB)
```

---

## 📄 License

This project is for educational/demo purposes. Add your preferred license here.
