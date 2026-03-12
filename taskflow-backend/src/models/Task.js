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
