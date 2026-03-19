const SystemDesign = require("../models/SystemDesign");
const SYSTEM_DESIGN_TOPICS = require("../utils/systemDesignData");

const ensureSystemDesignTopicsForUser = async (userId) => {
  const existingCount = await SystemDesign.countDocuments({ userId });

  if (existingCount === 0) {
    const topics = SYSTEM_DESIGN_TOPICS.map((topic) => ({
      userId,
      title: topic.title,
      description: topic.description,
      status: "Not Started",
      notes: ""
    }));

    await SystemDesign.insertMany(topics);
  }
};

const getSystemDesignTopics = async (req, res) => {
  try {
    await ensureSystemDesignTopicsForUser(req.user._id);

    const topics = await SystemDesign.find({ userId: req.user._id }).sort({ title: 1 });

    return res.status(200).json({
      success: true,
      count: topics.length,
      topics
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching system design topics",
      error: error.message
    });
  }
};

const updateSystemDesignTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { status, notes } = req.body;

    const topic = await SystemDesign.findOne({ _id: topicId, userId: req.user._id });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "System design topic not found"
      });
    }

    if (status !== undefined) {
      const allowedStatuses = ["Not Started", "In Progress", "Completed"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value"
        });
      }

      topic.status = status;
    }

    if (notes !== undefined) {
      topic.notes = notes;
    }

    await topic.save();

    return res.status(200).json({
      success: true,
      message: "System design topic updated successfully",
      topic
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating system design topic",
      error: error.message
    });
  }
};

const getSystemDesignSummary = async (req, res) => {
  try {
    await ensureSystemDesignTopicsForUser(req.user._id);

    const totalTopics = await SystemDesign.countDocuments({ userId: req.user._id });
    const completedTopics = await SystemDesign.countDocuments({
      userId: req.user._id,
      status: "Completed"
    });
    const inProgressTopics = await SystemDesign.countDocuments({
      userId: req.user._id,
      status: "In Progress"
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalTopics,
        completedTopics,
        inProgressTopics,
        notStartedTopics: totalTopics - completedTopics - inProgressTopics,
        completionPercentage: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching system design summary",
      error: error.message
    });
  }
};

module.exports = {
  getSystemDesignTopics,
  updateSystemDesignTopic,
  getSystemDesignSummary
};
