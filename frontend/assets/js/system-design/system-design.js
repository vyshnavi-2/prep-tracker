const systemDesignContainer = document.getElementById("systemDesignContainer");
const systemDesignLoader = document.getElementById("systemDesignLoader");
const systemDesignMessage = document.getElementById("systemDesignMessage");

function renderSystemDesignTopic(topic) {
  return `
    <article class="topic-card">
      <header>
        <div>
          <h3>${topic.title}</h3>
          <p class="meta">${topic.description}</p>
        </div>
        <span class="status-pill ${formatStatusClass(topic.status)}">${topic.status}</span>
      </header>

      <div class="form-grid">
        <div class="form-row">
          <label>Status</label>
          <select class="select" data-system-status="${topic._id}">
            <option value="Not Started" ${topic.status === "Not Started" ? "selected" : ""}>Not Started</option>
            <option value="In Progress" ${topic.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option value="Completed" ${topic.status === "Completed" ? "selected" : ""}>Completed</option>
          </select>
        </div>

        <div class="form-row">
          <label>Notes</label>
          <textarea class="textarea" data-system-notes="${topic._id}" placeholder="Write short interview notes">${topic.notes || ""}</textarea>
        </div>

        <button class="btn-secondary" type="button" data-system-save="${topic._id}">Save Topic</button>
      </div>
    </article>
  `;
}

async function loadSystemDesignSummary() {
  const summary = await apiRequest("/system-design/summary");
  document.getElementById("sdTotal").textContent = summary.stats.totalTopics;
  document.getElementById("sdCompleted").textContent = summary.stats.completedTopics;
  document.getElementById("sdProgress").textContent = summary.stats.inProgressTopics;
  document.getElementById("sdCompletion").textContent = `${summary.stats.completionPercentage}%`;
}

async function loadSystemDesignTopics() {
  systemDesignLoader.style.display = "inline-flex";
  clearMessage(systemDesignMessage);

  try {
    const response = await apiRequest("/system-design");

    if (!response.topics.length) {
      systemDesignContainer.innerHTML = '<div class="empty-state"><p>No system design topics found.</p></div>';
      return;
    }

    systemDesignContainer.innerHTML = response.topics.map(renderSystemDesignTopic).join("");
    attachSystemDesignHandlers();
  } catch (error) {
    systemDesignContainer.innerHTML = '<div class="empty-state"><p>Unable to load system design topics.</p></div>';
    setMessage(systemDesignMessage, error.message);
  } finally {
    systemDesignLoader.style.display = "none";
  }
}

function attachSystemDesignHandlers() {
  document.querySelectorAll("[data-system-save]").forEach((button) => {
    button.addEventListener("click", async () => {
      const topicId = button.dataset.systemSave;
      const status = document.querySelector(`[data-system-status='${topicId}']`).value;
      const notes = document.querySelector(`[data-system-notes='${topicId}']`).value;

      button.disabled = true;
      button.textContent = "Saving...";
      clearMessage(systemDesignMessage);

      try {
        await apiRequest(`/system-design/${topicId}`, {
          method: "PATCH",
          body: JSON.stringify({ status, notes })
        });

        setMessage(systemDesignMessage, "System design topic updated successfully.", "success");
        await Promise.all([loadSystemDesignSummary(), loadSystemDesignTopics()]);
      } catch (error) {
        setMessage(systemDesignMessage, error.message);
      } finally {
        button.disabled = false;
        button.textContent = "Save Topic";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  protectPage();
  setupSidebar("system-design");

  await Promise.all([loadSystemDesignSummary(), loadSystemDesignTopics()]).catch((error) => {
    setMessage(systemDesignMessage, error.message);
    systemDesignLoader.style.display = "none";
  });
});
