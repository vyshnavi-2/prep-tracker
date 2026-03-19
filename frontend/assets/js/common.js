function protectPage() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "../auth/login.html";
  }
}

function redirectIfAuthenticated() {
  const token = localStorage.getItem("token");

  if (token) {
    window.location.href = "../dashboard/dashboard.html";
  }
}

function setupSidebar(currentPage) {
  const user = getStoredUser();
  const userNameElements = document.querySelectorAll("[data-user-name]");
  const navLinks = document.querySelectorAll(".nav-link");
  const logoutButtons = document.querySelectorAll("[data-logout]");

  userNameElements.forEach((element) => {
    element.textContent = user ? user.name : "Learner";
  });

  navLinks.forEach((link) => {
    if (link.dataset.page === currentPage) {
      link.classList.add("active");
    }
  });

  logoutButtons.forEach((button) => {
    button.addEventListener("click", () => {
      clearAuth();
      window.location.href = "../auth/login.html";
    });
  });
}

function setMessage(element, text, type = "error") {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.className = `message show ${type}`;
}

function clearMessage(element) {
  if (!element) {
    return;
  }

  element.textContent = "";
  element.className = "message";
}

function formatStatusClass(status) {
  return status
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z-]/g, "");
}
