let calendarDate = new Date();
let countdownInterval;

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildSolvedDateSet(problems) {
  return new Set(
    problems
      .filter((problem) => problem.status === "Solved")
      .map((problem) => new Date(problem.updatedAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map(getLocalDateKey)
  );
}

function calculateStreaks(solvedDateSet) {
  const allDates = [...solvedDateSet]
    .map((value) => new Date(`${value}T00:00:00`))
    .sort((a, b) => a - b);

  let bestStreak = 0;
  let runningStreak = 0;

  for (let index = 0; index < allDates.length; index += 1) {
    if (index === 0) {
      runningStreak = 1;
    } else {
      const previousDate = allDates[index - 1];
      const currentDate = allDates[index];
      const dayDifference = Math.round((currentDate - previousDate) / 86400000);
      runningStreak = dayDifference === 1 ? runningStreak + 1 : 1;
    }

    if (runningStreak > bestStreak) {
      bestStreak = runningStreak;
    }
  }

  let currentStreak = 0;
  const today = new Date();
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  while (solvedDateSet.has(getLocalDateKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { currentStreak, bestStreak };
}

function renderCalendar(solvedDateSet) {
  const calendarGrid = document.getElementById("calendarGrid");
  const calendarMonthLabel = document.getElementById("calendarMonthLabel");
  const calendarDayLabel = document.getElementById("calendarDayLabel");
  const displayYear = calendarDate.getFullYear();
  const displayMonth = calendarDate.getMonth();
  const today = new Date();
  const firstDay = new Date(displayYear, displayMonth, 1);
  const lastDay = new Date(displayYear, displayMonth + 1, 0);
  const leadingBlankDays = firstDay.getDay();

  calendarMonthLabel.textContent = calendarDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });
  calendarDayLabel.textContent = today.getDate();

  const cells = [];

  for (let index = 0; index < leadingBlankDays; index += 1) {
    cells.push('<span class="calendar-cell is-empty"></span>');
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const cellDate = new Date(displayYear, displayMonth, day);
    const dateKey = getLocalDateKey(cellDate);
    const isToday = getLocalDateKey(cellDate) === getLocalDateKey(today);
    const isSolvedDay = solvedDateSet.has(dateKey);

    cells.push(`
      <span class="calendar-cell${isToday ? " is-today" : ""}${isSolvedDay ? " is-solved" : ""}">${day}</span>
    `);
  }

  calendarGrid.innerHTML = cells.join("");
}

function startCountdown() {
  const countdownLabel = document.getElementById("countdownLabel");

  const updateCountdown = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);

    const diff = tomorrow - now;
    const hours = `${Math.floor(diff / 3600000)}`.padStart(2, "0");
    const minutes = `${Math.floor((diff % 3600000) / 60000)}`.padStart(2, "0");
    const seconds = `${Math.floor((diff % 60000) / 1000)}`.padStart(2, "0");

    countdownLabel.textContent = `${hours}:${minutes}:${seconds} left`;
  };

  clearInterval(countdownInterval);
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function setupCalendarNavigation(solvedDateSet) {
  document.getElementById("prevMonthButton").addEventListener("click", () => {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
    renderCalendar(solvedDateSet);
  });

  document.getElementById("nextMonthButton").addEventListener("click", () => {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
    renderCalendar(solvedDateSet);
  });
}

function updateSnapshotCard({ valueId, metaId, progressId, percentage, metaText }) {
  document.getElementById(valueId).textContent = `${percentage}%`;
  document.getElementById(metaId).textContent = metaText;
  document.getElementById(progressId).style.width = `${percentage}%`;
}

document.addEventListener("DOMContentLoaded", async () => {
  protectPage();
  setupSidebar("dashboard");

  try {
    const [dsaStatsResponse, subjectsStatsResponse, systemDesignStatsResponse, plannerStatsResponse, dsaProblemsResponse] = await Promise.all([
      apiRequest("/dsa/stats/summary"),
      apiRequest("/subjects/summary"),
      apiRequest("/system-design/summary"),
      apiRequest("/tasks/summary"),
      apiRequest("/dsa")
    ]);

    const dsaStats = dsaStatsResponse.stats;
    const subjectStats = subjectsStatsResponse.stats;
    const systemDesignStats = systemDesignStatsResponse.stats;
    const plannerStats = plannerStatsResponse.stats;
    const solvedDateSet = buildSolvedDateSet(dsaProblemsResponse.problems);
    const streaks = calculateStreaks(solvedDateSet);
    const dsaCompletion = dsaStats.totalProblems === 0 ? 0 : Math.round((dsaStats.solvedProblems / dsaStats.totalProblems) * 100);
    const plannerCompletion = plannerStats.totalTasks === 0 ? 0 : Math.round((plannerStats.completedTasks / plannerStats.totalTasks) * 100);

    document.getElementById("dsaSolvedStat").textContent = dsaStats.solvedProblems;
    document.getElementById("subjectCompletionStat").textContent = `${subjectStats.completionPercentage}%`;
    document.getElementById("systemDesignStat").textContent = systemDesignStats.completedTopics;
    document.getElementById("plannerPendingStat").textContent = plannerStats.pendingTasks;
    document.getElementById("currentStreakCount").textContent = streaks.currentStreak;
    document.getElementById("bestStreakCount").textContent = streaks.bestStreak;

    updateSnapshotCard({
      valueId: "dsaSnapshotValue",
      metaId: "dsaSnapshotMeta",
      progressId: "dsaSnapshotProgress",
      percentage: dsaCompletion,
      metaText: `${dsaStats.solvedProblems} solved`
    });
    updateSnapshotCard({
      valueId: "subjectsSnapshotValue",
      metaId: "subjectsSnapshotMeta",
      progressId: "subjectsSnapshotProgress",
      percentage: subjectStats.completionPercentage,
      metaText: `${subjectStats.completedTopics} completed`
    });
    updateSnapshotCard({
      valueId: "systemDesignSnapshotValue",
      metaId: "systemDesignSnapshotMeta",
      progressId: "systemDesignSnapshotProgress",
      percentage: systemDesignStats.completionPercentage,
      metaText: `${systemDesignStats.completedTopics} completed`
    });
    updateSnapshotCard({
      valueId: "plannerSnapshotValue",
      metaId: "plannerSnapshotMeta",
      progressId: "plannerSnapshotProgress",
      percentage: plannerCompletion,
      metaText: `${plannerStats.completedTasks} completed`
    });

    document.getElementById("dsaSummaryText").textContent = `${dsaStats.solvedProblems} solved, ${dsaStats.revisionProblems} in revision, ${dsaStats.notSolvedProblems} left.`;
    document.getElementById("subjectsSummaryText").textContent = `${subjectStats.completedTopics} of ${subjectStats.totalTopics} topics completed across ${subjectStats.totalSubjects} subjects.`;
    document.getElementById("systemDesignSummaryText").textContent = `${systemDesignStats.completedTopics} completed and ${systemDesignStats.inProgressTopics} in progress out of ${systemDesignStats.totalTopics} topics.`;
    document.getElementById("plannerSummaryText").textContent = `${plannerStats.completedTasks} completed and ${plannerStats.pendingTasks} pending tasks.`;

    renderCalendar(solvedDateSet);
    setupCalendarNavigation(solvedDateSet);
    startCountdown();
  } catch (error) {
    document.getElementById("dsaSummaryText").textContent = error.message;
    document.getElementById("subjectsSummaryText").textContent = error.message;
    document.getElementById("systemDesignSummaryText").textContent = error.message;
    document.getElementById("plannerSummaryText").textContent = error.message;
  }
});
