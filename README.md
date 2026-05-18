# 🤖 3D AI Coding Mentor

An intelligent 3D AI mentor that helps students understand coding visually and grow confidently in their programming journey.

## ✨ Features

- 🎯 **Code Understanding** – Paste any code (Python, JS, Java, C++, C), watch it execute step-by-step in 3D
- 🧩 **Problem Solving** – Describe a problem in plain English, get optimized solutions with visual explanation
- 🌐 **3D Visualization** – Variables, arrays, stacks, loops come alive in an interactive Three.js scene
- 💬 **AI Chat Mentor** – Adaptive difficulty, real-world analogies, context memory
- 📄 **Document Processing** – Upload PDFs/DOCX, get summaries, flashcards, and key concepts
- 🔬 **Science Visualization** – Physics, Chemistry, Biology concepts animated in 3D
- 📝 **Exam Engine** – Adaptive quizzes with weakness detection and scoring
- 🚀 **Career Guidance** – Personalized roadmaps, DSA planners, interview prep

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Three.js, Tailwind CSS, Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB (Atlas), Redis |
| AI | Anthropic Claude (claude-sonnet / opus) |
| Auth | JWT + Google/GitHub OAuth |
| Files | AWS S3 |
| Deploy | Docker, Nginx, GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- MongoDB Atlas account (free tier works)
- Anthropic API key
- AWS account (for S3, optional for dev)

### 1. Clone & Configure

```bash
git clone <repo-url>
cd ai-coding-mentor
cp .env.example .env
# Edit .env and fill in your API keys
```

### 2. Development Mode

```bash
# Terminal 1 – Start Redis
docker run -d -p 6379:6379 redis:alpine

# Terminal 2 – Backend
cd backend
npm install
npm run dev

# Terminal 3 – Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### 3. Production with Docker

```bash
docker-compose up -d --build
```

Open http://localhost (port 80)

---

## 📁 Project Structure

```
ai-coding-mentor/
├── frontend/          # Next.js 14 application
├── backend/           # Express REST API
├── nginx/             # Reverse proxy config
├── docker-compose.yml # Production orchestration
└── .env.example       # Environment template
```

---

## 🔑 Environment Variables

See `.env.example` for all required variables.

**Minimum for local dev:**
- `ANTHROPIC_API_KEY` – Get at console.anthropic.com
- `MONGODB_URI` – MongoDB Atlas connection string
- `JWT_SECRET` – Any random 32+ char string

---

## 📊 Subscription Tiers

| Free | Pro ($19/mo) | Enterprise ($99/mo) |
|------|-------------|---------------------|
| 50 AI queries | Unlimited | Team management |
| 3 languages | All languages | LMS integration |
| Basic 3D | Full 3D suite | Custom roadmaps |
| 5 docs/month | Unlimited | API access |

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License – see LICENSE file
