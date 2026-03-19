const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const dsaRoutes = require("./routes/dsaRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const systemDesignRoutes = require("./routes/systemDesignRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const frontendPath = path.join(__dirname, "../frontend");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(frontendPath));

app.use("/api/auth", authRoutes);
app.use("/api/dsa", dsaRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/system-design", systemDesignRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.redirect("/pages/auth/login.html");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    mongoReadyState: mongoose.connection.readyState
  });
});

module.exports = app;


