const topicFilter = document.getElementById("topicFilter");
const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("searchInput");
const dsaTableBody = document.getElementById("dsaTableBody");
const dsaLoader = document.getElementById("dsaLoader");
const dsaMessage = document.getElementById("dsaMessage");

let allTopics = [];

function createDsaRow(problem) {
  return `
    <tr>
      <td>
        <strong>${problem.title}</strong>
        <div class="dsa-meta">Problem #${problem.order}</div>
      </td>
      <td>${problem.topic}</td>
      <td><span class="status-pill ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span></td>
      <td><a class="link-button" href="${problem.leetcodeLink}" target="_blank" rel="noopener noreferrer">Open Link</a></td>
      <td>
        <select class="select" data-status-id="${problem._id}">
          <option value="Not Solved" ${problem.status === "Not Solved" ? "selected" : ""}>Not Solved</option>
          <option value="Solved" ${problem.status === "Solved" ? "selected" : ""}>Solved</option>
          <option value="Revision" ${problem.status === "Revision" ? "selected" : ""}>Revision</option>
        </select>
      </td>
      <td>
        <textarea class="textarea" data-notes-id="${problem._id}" placeholder="Add approach or mistakes">${problem.notes || ""}</textarea>
      </td>
      <td>
        <button class="btn-secondary" type="button" data-save-id="${problem._id}">Save</button>
      </td>
    </tr>
  `;
}

function updateDsaStats(stats) {
  document.getElementById("dsaTotal").textContent = stats.totalProblems;
  document.getElementById("dsaSolved").textContent = stats.solvedProblems;
  document.getElementById("dsaRevision").textContent = stats.revisionProblems;
  document.getElementById("dsaPending").textContent = stats.notSolvedProblems;
}

function fillTopicFilter(problems) {
  allTopics = [...new Set(problems.map((problem) => problem.topic))];
  topicFilter.innerHTML = '<option value="">All Topics</option>' + allTopics
    .map((topic) => `<option value="${topic}">${topic}</option>`)
    .join("");
}

async function loadDsaStats() {
  const statsResponse = await apiRequest("/dsa/stats/summary");
  updateDsaStats(statsResponse.stats);
}

async function loadDsaProblems() {
  dsaLoader.style.display = "inline-flex";
  clearMessage(dsaMessage);

  const params = new URLSearchParams();
  if (topicFilter.value) params.append("topic", topicFilter.value);
  if (statusFilter.value) params.append("status", statusFilter.value);
  if (searchInput.value.trim()) params.append("search", searchInput.value.trim());

  try {
    const endpoint = params.toString() ? `/dsa?${params.toString()}` : "/dsa";
    const data = await apiRequest(endpoint);

    if (allTopics.length === 0) {
      fillTopicFilter(data.problems);
    }

    if (!data.problems.length) {
      dsaTableBody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>No problems matched your filters.</p></div></td></tr>';
      return;
    }

    dsaTableBody.innerHTML = data.problems.map(createDsaRow).join("");
    attachDsaSaveHandlers();
  } catch (error) {
    dsaTableBody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><p>Unable to load DSA problems.</p></div></td></tr>';
    setMessage(dsaMessage, error.message);
  } finally {
    dsaLoader.style.display = "none";
  }
}

function attachDsaSaveHandlers() {
  document.querySelectorAll("[data-save-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const problemId = button.dataset.saveId;
      const status = document.querySelector(`[data-status-id='${problemId}']`).value;
      const notes = document.querySelector(`[data-notes-id='${problemId}']`).value;

      button.disabled = true;
      button.textContent = "Saving...";
      clearMessage(dsaMessage);

      try {
        await apiRequest(`/dsa/${problemId}`, {
          method: "PATCH",
          body: JSON.stringify({ status, notes })
        });

        setMessage(dsaMessage, "DSA problem updated successfully.", "success");
        await loadDsaStats();
      } catch (error) {
        setMessage(dsaMessage, error.message);
      } finally {
        button.disabled = false;
        button.textContent = "Save";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  protectPage();
  setupSidebar("dsa");

  try {
    await apiRequest("/dsa/initialize", { method: "POST" });
    await Promise.all([loadDsaStats(), loadDsaProblems()]);
  } catch (error) {
    setMessage(dsaMessage, error.message);
    dsaLoader.style.display = "none";
  }

  document.getElementById("applyFilters").addEventListener("click", loadDsaProblems);
  document.getElementById("resetFilters").addEventListener("click", async () => {
    topicFilter.value = "";
    statusFilter.value = "";
    searchInput.value = "";
    await loadDsaProblems();
  });
});
