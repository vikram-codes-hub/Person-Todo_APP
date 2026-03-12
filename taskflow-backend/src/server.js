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
app.use(helmet());
const corsOptions = {
  origin: function (origin, callback) {
    const allowed = [
      process.env.FRONTEND_URL,
      /https:\/\/taskflow-frontend.*\.vercel\.app$/
    ];
    const isAllowed = allowed.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (!origin || isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
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
