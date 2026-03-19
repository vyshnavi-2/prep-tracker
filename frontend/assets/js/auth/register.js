document.addEventListener("DOMContentLoaded", () => {
  redirectIfAuthenticated();

  const registerForm = document.getElementById("registerForm");
  const registerMessage = document.getElementById("registerMessage");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(registerMessage);

    const submitButton = registerForm.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Creating account...";

    const formData = new FormData(registerForm);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password")
    };

    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      saveAuth(data);
      setMessage(registerMessage, "Account created. Redirecting...", "success");

      setTimeout(() => {
        window.location.href = "../dashboard/dashboard.html";
      }, 600);
    } catch (error) {
      setMessage(registerMessage, error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Create Account";
    }
  });
});
