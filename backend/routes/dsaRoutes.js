const express = require("express");
const {
  initializeDsaProblems,
  getDsaProblems,
  updateDsaProblem,
  getDsaStats
} = require("../controllers/dsaController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/initialize", initializeDsaProblems);
router.get("/stats/summary", getDsaStats);
router.get("/", getDsaProblems);
router.patch("/:id", updateDsaProblem);

module.exports = router;
