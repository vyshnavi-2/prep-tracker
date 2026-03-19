const mongoose = require("mongoose");

const dsaProblemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    topic: {
      type: String,
      required: true,
      trim: true
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"]
    },
    leetcodeLink: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Solved", "Not Solved", "Revision"],
      default: "Not Solved"
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

dsaProblemSchema.index({ userId: 1, title: 1 }, { unique: true });
dsaProblemSchema.index({ userId: 1, topic: 1, status: 1 });

module.exports = mongoose.model("DsaProblem", dsaProblemSchema);
