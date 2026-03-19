const subjectsContainer = document.getElementById("subjectsContainer");
const subjectsLoader = document.getElementById("subjectsLoader");
const subjectsMessage = document.getElementById("subjectsMessage");

function renderSubjectCard(subject) {
  return `
    <section class="subject-card">
      <header>
        <div>
          <h3>${subject.name}</h3>
          <p class="meta">${subject.description}</p>
        </div>
        <span class="status-pill completed">${subject.completionPercentage}% done</span>
      </header>
      <div class="subject-topics">
        <p>${subject.completedTopics} of ${subject.totalTopics} topics completed.</p>
        <a class="btn-secondary" href="subject-detail.html?id=${subject._id}">Open Subject</a>
      </div>
    </section>
  `;
}

async function loadSubjectsSummary() {
  const summary = await apiRequest("/subjects/summary");
  document.getElementById("subjectsCount").textContent = summary.stats.totalSubjects;
  document.getElementById("topicsCount").textContent = summary.stats.totalTopics;
  document.getElementById("completedTopicsCount").textContent = summary.stats.completedTopics;
  document.getElementById("subjectsCompletion").textContent = `${summary.stats.completionPercentage}%`;
}

async function loadSubjects() {
  subjectsLoader.style.display = "inline-flex";
  clearMessage(subjectsMessage);

  try {
    const response = await apiRequest("/subjects");

    if (!response.subjects.length) {
      subjectsContainer.innerHTML = '<div class="empty-state"><p>No subjects found.</p></div>';
      return;
    }

    subjectsContainer.innerHTML = response.subjects.map(renderSubjectCard).join("");
  } catch (error) {
    subjectsContainer.innerHTML = '<div class="empty-state"><p>Unable to load subjects right now.</p></div>';
    setMessage(subjectsMessage, error.message);
  } finally {
    subjectsLoader.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  protectPage();
  setupSidebar("subjects");

  await Promise.all([loadSubjectsSummary(), loadSubjects()]).catch((error) => {
    setMessage(subjectsMessage, error.message);
    subjectsLoader.style.display = "none";
  });
});
