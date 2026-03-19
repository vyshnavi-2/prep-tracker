document.addEventListener("DOMContentLoaded", () => {
  redirectIfAuthenticated();

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(loginMessage);

    const submitButton = loginForm.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";

    const formData = new FormData(loginForm);
    const payload = {
      email: formData.get("email"),
      password: formData.get("password")
    };

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      saveAuth(data);
      setMessage(loginMessage, "Login successful. Redirecting...", "success");

      setTimeout(() => {
        window.location.href = "../dashboard/dashboard.html";
      }, 600);
    } catch (error) {
      setMessage(loginMessage, error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Login";
    }
  });
});
