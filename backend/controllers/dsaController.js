const DsaProblem = require("../models/DsaProblem");
const NEETCODE_150_PROBLEMS = require("../utils/neetcode150");

const ensureDsaProblemsForUser = async (userId) => {
  const existingCount = await DsaProblem.countDocuments({ userId });

  if (existingCount === 0) {
    const userProblems = NEETCODE_150_PROBLEMS.map((problem) => ({
      userId,
      order: problem.order,
      title: problem.title,
      topic: problem.topic,
      difficulty: problem.difficulty,
      leetcodeLink: problem.leetcodeLink,
      status: "Not Solved",
      notes: ""
    }));

    await DsaProblem.insertMany(userProblems);
  }
};

const initializeDsaProblems = async (req, res) => {
  try {
    await ensureDsaProblemsForUser(req.user._id);

    const problems = await DsaProblem.find({ userId: req.user._id }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      message: "DSA problems initialized successfully",
      count: problems.length,
      problems
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while initializing DSA problems",
      error: error.message
    });
  }
};

const getDsaProblems = async (req, res) => {
  try {
    await ensureDsaProblemsForUser(req.user._id);

    const { topic, status, search } = req.query;
    const filter = { userId: req.user._id };

    if (topic) {
      filter.topic = topic;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const problems = await DsaProblem.find(filter).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      count: problems.length,
      problems
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching DSA problems",
      error: error.message
    });
  }
};

const updateDsaProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const problem = await DsaProblem.findOne({ _id: id, userId: req.user._id });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "DSA problem not found"
      });
    }

    if (status !== undefined) {
      const allowedStatuses = ["Solved", "Not Solved", "Revision"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value"
        });
      }

      problem.status = status;
    }

    if (notes !== undefined) {
      problem.notes = notes;
    }

    await problem.save();

    return res.status(200).json({
      success: true,
      message: "DSA problem updated successfully",
      problem
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating DSA problem",
      error: error.message
    });
  }
};

const getDsaStats = async (req, res) => {
  try {
    await ensureDsaProblemsForUser(req.user._id);

    const totalProblems = await DsaProblem.countDocuments({ userId: req.user._id });
    const solvedProblems = await DsaProblem.countDocuments({
      userId: req.user._id,
      status: "Solved"
    });
    const revisionProblems = await DsaProblem.countDocuments({
      userId: req.user._id,
      status: "Revision"
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalProblems,
        solvedProblems,
        revisionProblems,
        notSolvedProblems: totalProblems - solvedProblems - revisionProblems
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching DSA stats",
      error: error.message
    });
  }
};

module.exports = {
  initializeDsaProblems,
  getDsaProblems,
  updateDsaProblem,
  getDsaStats
};
