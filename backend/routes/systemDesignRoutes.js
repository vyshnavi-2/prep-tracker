const express = require("express");
const {
  getSystemDesignTopics,
  updateSystemDesignTopic,
  getSystemDesignSummary
} = require("../controllers/systemDesignController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/summary", getSystemDesignSummary);
router.get("/", getSystemDesignTopics);
router.patch("/:topicId", updateSystemDesignTopic);

module.exports = router;
