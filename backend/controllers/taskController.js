const Task = require("../models/Task");

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ completed: 1, deadline: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching planner tasks",
      error: error.message
    });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, deadline, priority } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required"
      });
    }

    const task = await Task.create({
      userId: req.user._id,
      title,
      deadline: deadline || null,
      priority: priority || "Medium"
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while creating task",
      error: error.message
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, userId: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    const { title, deadline, priority, completed } = req.body;

    if (title !== undefined) {
      task.title = title;
    }

    if (deadline !== undefined) {
      task.deadline = deadline || null;
    }

    if (priority !== undefined) {
      const allowedPriorities = ["Low", "Medium", "High"];
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority value"
        });
      }
      task.priority = priority;
    }

    if (completed !== undefined) {
      task.completed = Boolean(completed);
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating task",
      error: error.message
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.taskId, userId: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting task",
      error: error.message
    });
  }
};

const getTaskSummary = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ userId: req.user._id });
    const completedTasks = await Task.countDocuments({ userId: req.user._id, completed: true });

    return res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching planner summary",
      error: error.message
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskSummary
};
