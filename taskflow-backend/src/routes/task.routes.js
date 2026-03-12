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
