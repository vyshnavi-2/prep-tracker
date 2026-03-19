const subjectDetailLoader = document.getElementById("subjectDetailLoader");
const subjectDetailMessage = document.getElementById("subjectDetailMessage");
const subjectTopicsContainer = document.getElementById("subjectTopicsContainer");
const params = new URLSearchParams(window.location.search);
const subjectId = params.get("id");

function renderTopicCard(topic, subjectIdValue) {
  return `
    <article class="topic-card">
      <header>
        <div>
          <h3>${topic.title}</h3>
          <p class="meta">Track concept understanding and revision needs here.</p>
        </div>
        <span class="status-pill ${formatStatusClass(topic.status)}">${topic.status}</span>
      </header>

      <div class="form-grid">
        <div class="form-row">
          <label>Status</label>
          <select class="select" data-topic-status="${topic._id}">
            <option value="Not Started" ${topic.status === "Not Started" ? "selected" : ""}>Not Started</option>
            <option value="In Progress" ${topic.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option value="Completed" ${topic.status === "Completed" ? "selected" : ""}>Completed</option>
          </select>
        </div>

        <div class="form-row">
          <label>Notes</label>
          <textarea class="textarea" data-topic-notes="${topic._id}" placeholder="Important interview points">${topic.notes || ""}</textarea>
        </div>

        <label class="checkbox-row">
          <input type="checkbox" data-topic-revision="${topic._id}" ${topic.revision ? "checked" : ""} />
          Mark for revision
        </label>

        <button class="btn-secondary" type="button" data-topic-save="${topic._id}" data-subject-id="${subjectIdValue}">Save Topic</button>
      </div>
    </article>
  `;
}

function updateSubjectStats(stats) {
  document.getElementById("subjectTotalTopics").textContent = stats.totalTopics;
  document.getElementById("subjectCompletedTopics").textContent = stats.completedTopics;
  document.getElementById("subjectInProgressTopics").textContent = stats.inProgressTopics;
  document.getElementById("subjectRevisionTopics").textContent = stats.revisionTopics;
}

async function loadSubjectDetail() {
  if (!subjectId) {
    subjectTopicsContainer.innerHTML = '<div class="empty-state"><p>Subject id is missing.</p></div>';
    subjectDetailLoader.style.display = "none";
    return;
  }

  subjectDetailLoader.style.display = "inline-flex";
  clearMessage(subjectDetailMessage);

  try {
    const response = await apiRequest(`/subjects/${subjectId}`);
    const { subject } = response;

    document.getElementById("subjectTitle").textContent = subject.name;
    document.getElementById("subjectDescription").textContent = subject.description;
    updateSubjectStats(subject.stats);

    subjectTopicsContainer.innerHTML = subject.topics.map((topic) => renderTopicCard(topic, subject._id)).join("");
    attachSubjectDetailHandlers();
  } catch (error) {
    subjectTopicsContainer.innerHTML = '<div class="empty-state"><p>Unable to load subject details.</p></div>';
    setMessage(subjectDetailMessage, error.message);
  } finally {
    subjectDetailLoader.style.display = "none";
  }
}

function attachSubjectDetailHandlers() {
  document.querySelectorAll("[data-topic-save]").forEach((button) => {
    button.addEventListener("click", async () => {
      const currentTopicId = button.dataset.topicSave;
      const currentSubjectId = button.dataset.subjectId;
      const status = document.querySelector(`[data-topic-status='${currentTopicId}']`).value;
      const notes = document.querySelector(`[data-topic-notes='${currentTopicId}']`).value;
      const revision = document.querySelector(`[data-topic-revision='${currentTopicId}']`).checked;

      button.disabled = true;
      button.textContent = "Saving...";
      clearMessage(subjectDetailMessage);

      try {
        await apiRequest(`/subjects/${currentSubjectId}/topics/${currentTopicId}`, {
          method: "PATCH",
          body: JSON.stringify({ status, notes, revision })
        });

        setMessage(subjectDetailMessage, "Topic updated successfully.", "success");
        await loadSubjectDetail();
      } catch (error) {
        setMessage(subjectDetailMessage, error.message);
      } finally {
        button.disabled = false;
        button.textContent = "Save Topic";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  protectPage();
  setupSidebar("subjects");
  await loadSubjectDetail();
});
