#!/bin/bash

# ============================================================
#  TaskFlow — Backend Full Setup Script
#  Creates complete project with all code ready to run
#  Stack: Node.js + Express + MongoDB + Mongoose
# ============================================================

set -e

GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${ORANGE}${BOLD}  ╔══════════════════════════════════════════╗${NC}"
echo -e "${ORANGE}${BOLD}  ║     TaskFlow — Backend Setup Script      ║${NC}"
echo -e "${ORANGE}${BOLD}  ║   Node.js · Express · MongoDB · Mongoose  ║${NC}"
echo -e "${ORANGE}${BOLD}  ╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Check Node.js ─────────────────────────────────────────
echo -e "${BLUE}[1/5]${NC} Checking requirements..."
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
  exit 1
fi
echo -e "${GREEN}  ✓ Node.js $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm not found.${NC}"
  exit 1
fi
echo -e "${GREEN}  ✓ npm v$(npm -v)${NC}"

# ── Create folder structure ───────────────────────────────
echo ""
echo -e "${BLUE}[2/5]${NC} Creating project structure..."

mkdir -p taskflow-backend/src/{config,models,controllers,routes,middleware}
cd taskflow-backend

echo -e "${GREEN}  ✓ Folders created${NC}"
echo ""
echo -e "  ${CYAN}taskflow-backend/${NC}"
echo -e "  ├── src/"
echo -e "  │   ├── config/       (db.js)"
echo -e "  │   ├── models/       (Task.js)"
echo -e "  │   ├── controllers/  (task.controller.js)"
echo -e "  │   ├── routes/       (task.routes.js)"
echo -e "  │   ├── middleware/   (errorHandler.js)"
echo -e "  │   └── server.js"
echo -e "  ├── .env"
echo -e "  ├── .gitignore"
echo -e "  └── package.json"

# ── Write all files ───────────────────────────────────────
echo ""
echo -e "${BLUE}[3/5]${NC} Writing all source files..."

# ── package.json ──────────────────────────────────────────
cat > package.json << 'EOF'
{
  "name": "taskflow-backend",
  "version": "1.0.0",
  "description": "TaskFlow REST API — Express + MongoDB",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "mongoose": "^8.0.3",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF
echo -e "${GREEN}  ✓ package.json${NC}"

# ── .env ──────────────────────────────────────────────────
cat > .env << 'EOF'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
echo -e "${GREEN}  ✓ .env${NC}"

# ── .gitignore ────────────────────────────────────────────
cat > .gitignore << 'EOF'
node_modules/
.env
*.log
dist/
EOF
echo -e "${GREEN}  ✓ .gitignore${NC}"

# ── src/config/db.js ──────────────────────────────────────
cat > src/config/db.js << 'EOF'
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`  ✓ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`  ✗ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
EOF
echo -e "${GREEN}  ✓ src/config/db.js${NC}"

# ── src/models/Task.js ────────────────────────────────────
cat > src/models/Task.js << 'EOF'
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    time: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    category: {
      type: String,
      enum: ['Study', 'Work', 'Personal', 'Health', 'Other'],
      default: 'Other',
    },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Missed'],
      default: 'Pending',
    },
    recurrence: {
      type: String,
      enum: ['None', 'Daily', 'Weekly', 'Weekdays'],
      default: 'None',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast queries
taskSchema.index({ date: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);
EOF
echo -e "${GREEN}  ✓ src/models/Task.js${NC}"

# ── src/controllers/task.controller.js ────────────────────
cat > src/controllers/task.controller.js << 'EOF'
const Task = require('../models/Task');

// ── GET /api/tasks ─────────────────────────────────────────
// Supports query filters: status, category, priority, search, startDate, endDate
const getAllTasks = async (req, res) => {
  try {
    const { status, category, priority, search, startDate, endDate } = req.query;
    const filter = {};

    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (search)   filter.title    = { $regex: search, $options: 'i' };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate)   filter.date.$lte = endDate;
    }

    const tasks = await Task.find(filter).sort({ date: 1, createdAt: 1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── GET /api/tasks/:id ─────────────────────────────────────
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── POST /api/tasks ────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── PUT /api/tasks/:id ─────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── PATCH /api/tasks/:id/status ────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Completed', 'Missed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${validStatuses.join(', ')}` });
    }
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── DELETE /api/tasks/:id ──────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── GET /api/tasks/stats/summary ───────────────────────────
const getStats = async (req, res) => {
  try {
    const [total, completed, pending, missed, byCategory, byPriority] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'Completed' }),
      Task.countDocuments({ status: 'Pending' }),
      Task.countDocuments({ status: 'Missed' }),
      Task.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Task.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: { total, completed, pending, missed, byCategory, byPriority },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── PATCH /api/tasks/auto-miss ─────────────────────────────
// Marks all overdue Pending tasks as Missed
const autoMarkMissed = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const result = await Task.updateMany(
      { status: 'Pending', date: { $lt: today } },
      { $set: { status: 'Missed' } }
    );
    res.json({ success: true, updated: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateStatus,
  deleteTask,
  getStats,
  autoMarkMissed,
};
EOF
echo -e "${GREEN}  ✓ src/controllers/task.controller.js${NC}"

# ── src/routes/task.routes.js ─────────────────────────────
cat > src/routes/task.routes.js << 'EOF'
const express = require('express');
const router  = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateStatus,
  deleteTask,
  getStats,
  autoMarkMissed,
} = require('../controllers/task.controller');

// NOTE: Specific routes must come BEFORE /:id routes
router.get   ('/stats/summary', getStats);
router.patch ('/auto-miss',     autoMarkMissed);

router.get   ('/',              getAllTasks);
router.post  ('/',              createTask);
router.get   ('/:id',           getTaskById);
router.put   ('/:id',           updateTask);
router.patch ('/:id/status',    updateStatus);
router.delete('/:id',           deleteTask);

module.exports = router;
EOF
echo -e "${GREEN}  ✓ src/routes/task.routes.js${NC}"

# ── src/middleware/errorHandler.js ────────────────────────
cat > src/middleware/errorHandler.js << 'EOF'
// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'Invalid ID format' });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return res.status(400).json({ success: false, error: 'Duplicate field value' });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, error: messages.join(', ') });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 handler for unknown routes
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
EOF
echo -e "${GREEN}  ✓ src/middleware/errorHandler.js${NC}"

# ── src/server.js ─────────────────────────────────────────
cat > src/server.js << 'EOF'
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const connectDB                  = require('./config/db');
const taskRoutes                 = require('./routes/task.routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ────────────────────────────────────
connectDB();

// ── Security Middleware ───────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── General Middleware ────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// ── Rate Limiting — 300 requests per 15 minutes ───────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, error: 'Too many requests, please slow down.' },
}));

// ── Health Check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'TaskFlow API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────
app.use('/api/tasks', taskRoutes);

// ── Error Handling ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ┌─────────────────────────────────────────┐');
  console.log('  │        TaskFlow Backend Running          │');
  console.log('  ├─────────────────────────────────────────┤');
  console.log(`  │  Local:   http://localhost:${PORT}           │`);
  console.log(`  │  Health:  http://localhost:${PORT}/health    │`);
  console.log(`  │  API:     http://localhost:${PORT}/api/tasks │`);
  console.log('  └─────────────────────────────────────────┘');
  console.log('');
});
EOF
echo -e "${GREEN}  ✓ src/server.js${NC}"

# ── Install dependencies ──────────────────────────────────
echo ""
echo -e "${BLUE}[4/5]${NC} Installing npm packages..."
npm install
echo -e "${GREEN}  ✓ All packages installed${NC}"

# ── Done ──────────────────────────────────────────────────
echo ""
echo -e "${BLUE}[5/5]${NC} Setup complete!"
echo ""
echo -e "  ${BOLD}API Endpoints:${NC}"
echo ""
echo -e "  ${CYAN}GET${NC}    /health                     Health check"
echo -e "  ${CYAN}GET${NC}    /api/tasks                  Get all tasks"
echo -e "  ${CYAN}GET${NC}    /api/tasks?status=Pending   Filter by status"
echo -e "  ${CYAN}GET${NC}    /api/tasks?search=study     Search by title"
echo -e "  ${CYAN}GET${NC}    /api/tasks?category=Work    Filter by category"
echo -e "  ${CYAN}GET${NC}    /api/tasks?startDate=2025-01-01&endDate=2025-01-31"
echo -e "  ${CYAN}GET${NC}    /api/tasks/stats/summary    Statistics"
echo -e "  ${CYAN}GET${NC}    /api/tasks/:id              Single task"
echo -e "  ${GREEN}POST${NC}   /api/tasks                  Create task"
echo -e "  ${ORANGE}PUT${NC}    /api/tasks/:id              Update task"
echo -e "  ${ORANGE}PATCH${NC}  /api/tasks/:id/status       Update status only"
echo -e "  ${ORANGE}PATCH${NC}  /api/tasks/auto-miss        Mark overdue as Missed"
echo -e "  ${RED}DELETE${NC} /api/tasks/:id              Delete task"
echo ""
echo -e "  ${BOLD}Task Schema:${NC}"
echo -e "  title       String   required"
echo -e "  description String   optional"
echo -e "  date        String   YYYY-MM-DD  required"
echo -e "  time        String   HH:MM       optional"
echo -e "  priority    Enum     High | Medium | Low"
echo -e "  category    Enum     Study | Work | Personal | Health | Other"
echo -e "  status      Enum     Pending | Completed | Missed"
echo -e "  recurrence  Enum     None | Daily | Weekly | Weekdays"
echo ""
echo -e "  ${BOLD}MongoDB URI (update in .env if needed):${NC}"
echo -e "  Local:  mongodb://localhost:27017/taskflow"
echo -e "  Atlas:  mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskflow"
echo ""

# ── Ask to start ──────────────────────────────────────────
echo -e "  ┌─────────────────────────────────────────┐"
echo -e "  │  Make sure MongoDB is running first!     │"
echo -e "  │                                          │"
echo -e "  │  Dev mode (auto-restart):                │"
echo -e "  │    npm run dev                           │"
echo -e "  │                                          │"
echo -e "  │  Production mode:                        │"
echo -e "  │    npm start                             │"
echo -e "  └─────────────────────────────────────────┘"
echo ""
read -p "  Start dev server now? (y/n): " START
if [[ "$START" =~ ^[Yy]$ ]]; then
  echo ""
  npm run dev
fi