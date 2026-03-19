const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started"
    },
    notes: {
      type: String,
      default: ""
    },
    revision: {
      type: Boolean,
      default: false
    }
  },
  { _id: true }
);

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    topics: [topicSchema]
  },
  {
    timestamps: true
  }
);

subjectSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Subject", subjectSchema);
