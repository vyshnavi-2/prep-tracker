const plannerForm = document.getElementById("plannerForm");
const plannerMessage = document.getElementById("plannerMessage");
const plannerLoader = document.getElementById("plannerLoader");
const plannerTasksContainer = document.getElementById("plannerTasksContainer");

function formatDate(dateValue) {
  if (!dateValue) {
    return "No deadline";
  }

  return new Date(dateValue).toLocaleDateString();
}

function renderTask(task) {
  return `
    <article class="topic-card">
      <header>
        <div>
          <h3>${task.title}</h3>
          <p class="meta">Deadline: ${formatDate(task.deadline)} | Priority: ${task.priority}</p>
        </div>
        <span class="status-pill ${task.completed ? "completed" : "pending"}">${task.completed ? "Completed" : "Pending"}</span>
      </header>

      <div class="quick-links">
        <button class="btn-secondary" type="button" data-task-toggle="${task._id}" data-task-completed="${task.completed}">${task.completed ? "Mark Pending" : "Mark Complete"}</button>
        <button class="btn-danger" type="button" data-task-delete="${task._id}">Delete</button>
      </div>
    </article>
  `;
}

async function loadPlannerSummary() {
  const summary = await apiRequest("/tasks/summary");
  document.getElementById("plannerTotal").textContent = summary.stats.totalTasks;
  document.getElementById("plannerCompleted").textContent = summary.stats.completedTasks;
  document.getElementById("plannerPending").textContent = summary.stats.pendingTasks;
}

async function loadTasks() {
  plannerLoader.style.display = "inline-flex";
  clearMessage(plannerMessage);

  try {
    const response = await apiRequest("/tasks");

    if (!response.tasks.length) {
      plannerTasksContainer.innerHTML = '<div class="empty-state"><p>No planner tasks yet. Add your first task above.</p></div>';
      return;
    }

    plannerTasksContainer.innerHTML = response.tasks.map(renderTask).join("");
    attachPlannerHandlers();
  } catch (error) {
    plannerTasksContainer.innerHTML = '<div class="empty-state"><p>Unable to load planner tasks.</p></div>';
    setMessage(plannerMessage, error.message);
  } finally {
    plannerLoader.style.display = "none";
  }
}

function attachPlannerHandlers() {
  document.querySelectorAll("[data-task-toggle]").forEach((button) => {
    button.addEventListener("click", async () => {
      const taskId = button.dataset.taskToggle;
      const currentCompleted = button.dataset.taskCompleted === "true";

      button.disabled = true;
      button.textContent = "Saving...";

      try {
        await apiRequest(`/tasks/${taskId}`, {
          method: "PATCH",
          body: JSON.stringify({ completed: !currentCompleted })
        });

        setMessage(plannerMessage, "Task updated successfully.", "success");
        await Promise.all([loadPlannerSummary(), loadTasks()]);
      } catch (error) {
        setMessage(plannerMessage, error.message);
      }
    });
  });

  document.querySelectorAll("[data-task-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const taskId = button.dataset.taskDelete;

      button.disabled = true;
      button.textContent = "Deleting...";

      try {
        await apiRequest(`/tasks/${taskId}`, {
          method: "DELETE"
        });

        setMessage(plannerMessage, "Task deleted successfully.", "success");
        await Promise.all([loadPlannerSummary(), loadTasks()]);
      } catch (error) {
        setMessage(plannerMessage, error.message);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  protectPage();
  setupSidebar("planner");

  plannerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(plannerMessage);

    const submitButton = plannerForm.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Adding...";

    const formData = new FormData(plannerForm);
    const payload = {
      title: formData.get("title"),
      deadline: formData.get("deadline"),
      priority: formData.get("priority")
    };

    try {
      await apiRequest("/tasks", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      plannerForm.reset();
      setMessage(plannerMessage, "Task added successfully.", "success");
      await Promise.all([loadPlannerSummary(), loadTasks()]);
    } catch (error) {
      setMessage(plannerMessage, error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Add Task";
    }
  });

  await Promise.all([loadPlannerSummary(), loadTasks()]).catch((error) => {
    setMessage(plannerMessage, error.message);
    plannerLoader.style.display = "none";
  });
});
