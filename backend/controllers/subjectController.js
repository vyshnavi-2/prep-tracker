const Subject = require("../models/Subject");
const SUBJECTS_DATA = require("../utils/subjectsData");

const ensureSubjectsForUser = async (userId) => {
  const existingCount = await Subject.countDocuments({ userId });

  if (existingCount === 0) {
    const subjects = SUBJECTS_DATA.map((subject) => ({
      userId,
      name: subject.name,
      description: subject.description,
      topics: subject.topics.map((topic) => ({
        title: topic.title,
        status: "Not Started",
        notes: "",
        revision: false
      }))
    }));

    await Subject.insertMany(subjects);
  }
};

const getSubjects = async (req, res) => {
  try {
    await ensureSubjectsForUser(req.user._id);

    const subjects = await Subject.find({ userId: req.user._id }).sort({ name: 1 });

    const formattedSubjects = subjects.map((subject) => {
      const completedTopics = subject.topics.filter((topic) => topic.status === "Completed").length;
      const completionPercentage = subject.topics.length === 0
        ? 0
        : Math.round((completedTopics / subject.topics.length) * 100);

      return {
        _id: subject._id,
        name: subject.name,
        description: subject.description,
        totalTopics: subject.topics.length,
        completedTopics,
        completionPercentage
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedSubjects.length,
      subjects: formattedSubjects
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching subjects",
      error: error.message
    });
  }
};

const getSubjectById = async (req, res) => {
  try {
    await ensureSubjectsForUser(req.user._id);

    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      userId: req.user._id
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    const completedTopics = subject.topics.filter((topic) => topic.status === "Completed").length;
    const inProgressTopics = subject.topics.filter((topic) => topic.status === "In Progress").length;
    const revisionTopics = subject.topics.filter((topic) => topic.revision).length;

    return res.status(200).json({
      success: true,
      subject: {
        _id: subject._id,
        name: subject.name,
        description: subject.description,
        topics: subject.topics,
        stats: {
          totalTopics: subject.topics.length,
          completedTopics,
          inProgressTopics,
          revisionTopics,
          completionPercentage: subject.topics.length === 0
            ? 0
            : Math.round((completedTopics / subject.topics.length) * 100)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching subject details",
      error: error.message
    });
  }
};

const updateSubjectTopic = async (req, res) => {
  try {
    const { subjectId, topicId } = req.params;
    const { status, notes, revision } = req.body;

    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    const topic = subject.topics.id(topicId);

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
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

    if (revision !== undefined) {
      topic.revision = Boolean(revision);
    }

    await subject.save();

    return res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      topic
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while updating subject topic",
      error: error.message
    });
  }
};

const getSubjectsSummary = async (req, res) => {
  try {
    await ensureSubjectsForUser(req.user._id);

    const subjects = await Subject.find({ userId: req.user._id });

    let totalTopics = 0;
    let completedTopics = 0;
    let inProgressTopics = 0;
    let revisionTopics = 0;

    subjects.forEach((subject) => {
      totalTopics += subject.topics.length;
      completedTopics += subject.topics.filter((topic) => topic.status === "Completed").length;
      inProgressTopics += subject.topics.filter((topic) => topic.status === "In Progress").length;
      revisionTopics += subject.topics.filter((topic) => topic.revision).length;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalSubjects: subjects.length,
        totalTopics,
        completedTopics,
        inProgressTopics,
        revisionTopics,
        completionPercentage: totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while fetching subjects summary",
      error: error.message
    });
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  updateSubjectTopic,
  getSubjectsSummary
};
