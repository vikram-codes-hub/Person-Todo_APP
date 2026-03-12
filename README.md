# 📋 TaskFlow

A full-stack personal task manager built with React, Node.js, and MongoDB. Plan your day, track your week, visualize your progress, and build streaks.

![TaskFlow](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white) ![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)

---

## ✨ Features

- **Today View** — greeting, progress bar, quick-add bar, drag-to-reorder tasks, streak counter
- **Weekly View** — 7-day grid with drag-and-drop between days
- **Calendar View** — monthly grid with task dots, click any day for a detail panel
- **Stats View** — bar chart (last 7 days), pie chart (status), streak, completion rate, category breakdown
- **Task Modal** — full add/edit form with title, description, date, time, priority, category, recurrence
- **Search** — live dropdown search across all tasks
- **Dark Mode** — toggle between light and dark themes
- **Confetti** — celebration animation on streak milestones
- **Missed Task Auto-mark** — backend automatically marks overdue tasks as missed

---

## 🗂 Project Structure

```
taskflow/
├── taskflow-backend/          ← Express + MongoDB API
│   ├── src/
│   │   ├── config/db.js       ← MongoDB connection
│   │   ├── models/Task.js     ← Mongoose schema
│   │   ├── controllers/       ← Route handlers
│   │   ├── routes/            ← REST route definitions
│   │   └── middleware/        ← Error handler
│   ├── server.js              ← Express entry point
│   ├── vercel.json
│   └── package.json
│
└── taskflow/                  ← React + Vite frontend
    ├── src/
    │   ├── components/        ← All UI components
    │   ├── hooks/useApp.jsx   ← Global state + API calls
    │   ├── utils/             ← Constants + helpers
    │   └── App.jsx            ← Main layout + navigation
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started (Local)

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/your-repo.git
cd taskflow
```

### 2. Set up the backend

```bash
cd taskflow-backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskflow
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd ../taskflow
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deployment (Vercel)

### Backend

1. Import `taskflow-backend` as a new Vercel project
2. Set **Root Directory** to `taskflow-backend`
3. Set **Framework Preset** to `Other`
4. Add environment variables:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Your frontend Vercel URL |

5. Deploy

### Frontend

1. Import the same repo as another new Vercel project
2. Set **Root Directory** to `taskflow`
3. Set **Framework Preset** to `Vite`
4. Add environment variable:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` |

5. Deploy
6. Go back to the **backend** project → update `FRONTEND_URL` to your live frontend URL → Redeploy

---

## 🔌 API Reference

Base URL: `/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | Get all tasks |
| `GET` | `/tasks/:id` | Get task by ID |
| `POST` | `/tasks` | Create a task |
| `PUT` | `/tasks/:id` | Update a task |
| `PATCH` | `/tasks/:id/status` | Toggle task status |
| `DELETE` | `/tasks/:id` | Delete a task |
| `GET` | `/tasks/stats` | Get task statistics |
| `PATCH` | `/tasks/auto-miss` | Auto-mark overdue tasks as missed |

### Task Schema

```json
{
  "title": "string (required)",
  "description": "string",
  "date": "YYYY-MM-DD (required)",
  "time": "HH:MM",
  "priority": "Low | Medium | High",
  "category": "Study | Work | Health | Personal | Finance | Other",
  "status": "Pending | Completed | Missed",
  "recurrence": "None | Daily | Weekly | Monthly"
}
```

---

## 🧰 Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS v4
- Framer Motion
- Recharts
- Axios
- date-fns
- Lucide React

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- CORS, Helmet, Morgan
- express-rate-limit
- dotenv

---

## 📁 Key Files

| File | Purpose |
|---|---|
| `useApp.jsx` | All global state, all API calls |
| `api.js` | Axios instance + `taskAPI` methods |
| `taskUtils.js` | Constants, `getWeekDates()`, `calcStreak()`, `shouldTaskAppearOnDate()` |
| `TodayView.jsx` | Home view with drag-to-reorder |
| `WeeklyView.jsx` | 7-day drag-and-drop planner |
| `CalendarView.jsx` | Monthly calendar with day panel |
| `StatsView.jsx` | Charts and analytics |
| `TaskModal.jsx` | Add / edit task form |

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT — feel free to use, modify, and distribute.