const express = require("express");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskSummary
} = require("../controllers/taskController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/summary", getTaskSummary);
router.get("/", getTasks);
router.post("/", createTask);
router.patch("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

module.exports = router;
