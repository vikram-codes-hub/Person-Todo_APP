const Task = require('../models/Task');

// ── GET /api/tasks ─────────────────────────────────────────
const getAllTasks = async (req, res) => {
  try {
    const { status, category, priority, search, startDate, endDate } = req.query;
    const filter = { userId: req.user._id };

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
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── POST /api/tasks ────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.user._id });
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
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
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
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
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
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ── GET /api/tasks/stats/summary ───────────────────────────
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, completed, pending, missed, byCategory, byPriority] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: 'Completed' }),
      Task.countDocuments({ userId, status: 'Pending'   }),
      Task.countDocuments({ userId, status: 'Missed'    }),
      Task.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
      ]),
      Task.aggregate([
        { $match: { userId } },
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
const autoMarkMissed = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await Task.updateMany(
      { userId: req.user._id, status: 'Pending', date: { $lt: today } },
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