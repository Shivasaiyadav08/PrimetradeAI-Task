const Task = require('../models/Task');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all tasks (admin gets all, user gets their own)
 * @route   GET /api/v1/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
  let query;
  
  if (req.user.role === 'admin') {
    query = Task.find().populate('user', 'name email');
  } else {
    query = Task.find({ user: req.user.id });
  }

  const tasks = await query.sort('-createdAt');
  
  res.json({
    success: true,
    count: tasks.length,
    tasks,
  });
};

/**
 * @desc    Get single task
 * @route   GET /api/v1/tasks/:id
 * @access  Private
 */
const getTask = async (req, res) => {
  const task = await Task.findById(req.params.id).populate('user', 'name email');

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Check if user owns task or is admin
  if (task.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this task',
    });
  }

  res.json({
    success: true,
    task,
  });
};

/**
 * @desc    Create task
 * @route   POST /api/v1/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  req.body.user = req.user.id;
  const task = await Task.create(req.body);

  res.status(201).json({
    success: true,
    task,
  });
};

/**
 * @desc    Update task
 * @route   PUT /api/v1/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Check ownership or admin
  if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this task',
    });
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    task,
  });
};

/**
 * @desc    Delete task
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found',
    });
  }

  // Check ownership or admin
  if (task.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this task',
    });
  }

  await task.deleteOne();

  res.json({
    success: true,
    message: 'Task deleted successfully',
  });
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };