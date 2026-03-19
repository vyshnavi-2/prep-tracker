const express = require("express");
const {
  getSubjects,
  getSubjectById,
  updateSubjectTopic,
  getSubjectsSummary
} = require("../controllers/subjectController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/summary", getSubjectsSummary);
router.get("/", getSubjects);
router.get("/:subjectId", getSubjectById);
router.patch("/:subjectId/topics/:topicId", updateSubjectTopic);

module.exports = router;
