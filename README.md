# 👻 Ghost in the Campus

> **A premium, responsive AI campus assistant featuring a friendly spectral mascot, grounded local LLM intelligence, an interactive 2D campus directory, and a wayfinding navigator.**

[![Frontend](https://img.shields.io/badge/Frontend-React_18_+_Vite-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI_+_Python_3.13-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Local AI](https://img.shields.io/badge/LLM-Ollama_gemma4%3Ae2b-8b5cf6?style=flat-square)](https://ollama.ai/)
[![Styling](https://img.shields.io/badge/UI-Dark_Navy_+_Tailwind_Glassmorphism-06b6d4?style=flat-square)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)]()

---

## 🌟 Key Highlights

- **Friendly Mascot ("Casperion")**: Interactive animated SVG ghost mascot with floating physics, blinking eyes, halo glow, and 4 expressive personality moods (*Friendly*, *Academic*, *Spectral Mystery*, *Deep Inquirer*).
- **Grounded AI with Gemma 4**: Powered by local **Ollama** running `gemma4:e2b` at `http://localhost:11434/api/chat`.
- **Zero Hallucination Guarantee**: Strict RAG bounds ensure the AI **never invents room numbers, campus buildings, professor names, or policies** outside the verified database. If a location is not in the records, it explicitly refers the student to Campus Security Post A.
- **Clearly Labeled Demo Data**: Persistent disclaimer ribbons and source citation cards tag every campus record as verified hackathon demo data.
- **Interactive 2D Campus Map & Wayfinder**: Visual top-down blueprint map with clickable buildings, floor selector (Ground to 3rd), and turn-by-turn walking route generator with ADA accessibility options.
- **Campus Portal Login & Registration**: Clean, responsive identity gateway allowing new arrivals to register with their email, full name, role (Student, Faculty, Researcher, Visitor), and password, or sign in instantly with quick evaluator demo accounts.
- **Searchable Campus Directory**: Filterable database of Classrooms, AI Labs, Departments, Library Zones, and Student Amenities with one-click "Locate on Map" and "Ask Ghost" shortcuts.
- **Voice Input & Text-to-Speech**: Speech recognition and speech synthesis built natively using Web Speech APIs, plus offline spectral audio chimes synthesized via the Web Audio API.

---

## 🎨 Theme & Design System

- **Background**: Deep void navy (`#060913`, `#0a0f1d`, `#0f172a`)
- **Accents**: Spectral purple (`#a855f7`, `#8b5cf6`) and neon cyan (`#06b6d4`, `#22d3ee`)
- **Glassmorphism**: `backdrop-blur-md` cards with 1px glowing translucent borders and soft shadows.
- **Responsive**: Fully optimized for mobile screens, tablets, and widescreen desktop monitors.

---

## 🏗️ Architecture & Project Structure

```
ghost-in-the-campus/
├── backend/
│   ├── main.py               # FastAPI server & REST endpoints
│   ├── rag_service.py        # Knowledge retrieval & grounding engine
│   ├── ollama_client.py      # Async HTTP client for Ollama API
│   ├── knowledge_base.json   # Structured verified campus database
│   ├── test_backend.py       # Automated unit & integration test suite
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GhostMascot.jsx           # Animated SVG mascot with moods & sounds
│   │   │   ├── Navbar.jsx                # Top nav with live Ollama status pill
│   │   │   ├── DemoNoticeBanner.jsx      # Demo data notice & guardrails expander
│   │   │   ├── ChatView.jsx              # Main chat interface with voice & citations
│   │   │   ├── CampusDirectory.jsx       # Searchable catalog of rooms & departments
│   │   │   ├── CampusMapNavigator.jsx    # 2D interactive map & route planner
│   │   │   ├── RulesAndFaqs.jsx          # Attendance & library policies & timetables
│   │   │   └── Footer.jsx                # Technical footer & emergency contacts
│   │   ├── utils/
│   │   │   └── audio.js                  # Web Audio API synthesizers & TTS
│   │   ├── App.jsx                       # Master state & route coordinator
│   │   ├── index.css                     # Tailwind CSS & custom glass classes
│   │   └── main.jsx                      # React 18 entrypoint
│   ├── public/
│   │   └── ghost.svg                     # High-res favicon
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js                    # Vite dev server with proxy to backend
├── start_all.bat                         # Windows 1-click batch launcher
├── start_all.ps1                         # Windows PowerShell master launcher
├── start_backend.bat                     # Launch FastAPI server
├── start_frontend.bat                    # Launch Vite dev server
└── README.md                             # Complete project documentation
```

---

## ⚡ Quick Windows Setup & Running Guide

### 1. Prerequisites
- **Python 3.10+** (Tested on Python 3.13)
- **Node.js 18+** (Tested on Node.js v24 LTS)
- **Ollama**: Download and install from [ollama.com](https://ollama.com)

### 2. Verify Ollama Model
In a PowerShell window, ensure Ollama is running and pull the `gemma4:e2b` model:
```powershell
ollama pull gemma4:e2b
ollama run gemma4:e2b
```
*(Verify by asking "Hello" then typing `/bye`)*

### 3. Option A: One-Click Startup (Recommended)
Simply double click `start_all.bat` or run:
```powershell
.\start_all.ps1
```
This automatically spins up the FastAPI backend on port 8000 and the Vite frontend on port 5173 in two dedicated terminal windows.

### 4. Option B: Manual Startup

#### Step 1: Start Backend (Terminal 1)
```powershell
cd d:\ghost-in-the-campus\backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Test backend health: Open [http://localhost:8000/api/health](http://localhost:8000/api/health)

#### Step 2: Start Frontend (Terminal 2)
```powershell
cd d:\ghost-in-the-campus\frontend
npm install
npm run dev
```
Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 Testing & Verification

Run the comprehensive automated test suite (verifying knowledge base integrity, RAG retrieval accuracy, and live Ollama chat connectivity):
```powershell
python backend/test_backend.py
```
Expected output:
```
Ran 7 tests in 10-15s
OK
```

Build the production frontend bundle:
```powershell
cd frontend
npm run build
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check for backend, Ollama connection, and dataset size |
| `POST` | `/api/auth/register` | Register new campus arrival using email, name, role, and password |
| `POST` | `/api/auth/login` | Authenticate returning campus user |
| `POST` | `/api/chat` | Grounded chat with Ollama `gemma4:e2b` and sources |
| `POST` | `/api/chat/stream` | Server-Sent Events (SSE) streaming chat |
| `GET` | `/api/campus/meta` | Campus metadata, emergency contacts, demo notice |
| `GET` | `/api/campus/buildings` | List of campus buildings with coordinates and amenities |
| `GET` | `/api/campus/rooms` | Rooms, labs, and lecture halls with equipment and ADA access |
| `GET` | `/api/campus/departments`| Academic departments, chair offices, and degree programs |
| `GET` | `/api/campus/timetables` | Course schedules, days, instructors, and rooms |
| `GET` | `/api/campus/rules` | Attendance (75%), library borrowing, lab safety, and WiFi |
| `GET` | `/api/campus/amenities` | Ghost Brew cafe, dining hall, dispensary, and lost & found |
| `POST` | `/api/campus/route` | Turn-by-turn walking route generator with ADA accessibility |

---

## 🛡️ Grounding & Hallucination Prevention

In compliance with project specifications:
1. **Never Invented Rooms**: Queries asking for nonexistent rooms (e.g. "Where is Room 9999?") trigger a bounded response directing students to the security desk.
2. **Strict System Prompt**: The system prompt injects only verified JSON facts as the source of truth with explicit constraints prohibiting speculative answers.
3. **Source Badges**: Every chat response clearly displays its grounded citations and the demo database label.
4. **Fallback Resilience**: If Ollama is offline or taking time to respond, the backend automatically provides a formatted synthesis directly from the local JSON database without crashing.

---

## 👥 Authors
Built for the **Ghost in the Campus** Hackathon project.
All campus entities belong to the fictional demonstration university "Specter University".
