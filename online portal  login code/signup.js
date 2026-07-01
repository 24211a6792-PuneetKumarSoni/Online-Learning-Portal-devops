// ============================================================
//  PATHSHALA – Signup Page Script (signup.js)
// ============================================================

const API_BASE = "http://localhost:5000/api/auth";

function setLoading(loading) {
  const btn     = document.getElementById("btn-signup");
  const label   = document.getElementById("signup-btn-label");
  const spinner = document.getElementById("signup-spinner");
  btn.disabled         = loading;
  label.style.display  = loading ? "none" : "block";
  spinner.style.display = loading ? "block" : "none";
}

function showAlert(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = "flex";
  const span = el.querySelector("span[id]");
  if (span && message) span.textContent = message;
}
function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function setFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errEl = document.getElementById(`${fieldId}-error`);
  if (input) input.classList.add("error");
  if (errEl) errEl.textContent = message;
}

function clearAll() {
  ["full-name", "signup-email", "signup-password", "confirm-password"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("error");
    const err = document.getElementById(`${id}-error`);
    if (err) err.textContent = "";
  });
  hideAlert("signup-error");
  hideAlert("signup-success");
}

async function handleSignup(event) {
  event.preventDefault();
  clearAll();

  const fullName   = document.getElementById("full-name").value.trim();
  const email      = document.getElementById("signup-email").value.trim().toLowerCase();
  const password   = document.getElementById("signup-password").value;
  const confirmPwd = document.getElementById("confirm-password").value;

  // Validation
  let valid = true;
  if (!fullName) {
    setFieldError("full-name", "Full name is required."); valid = false;
  }
  if (!email) {
    setFieldError("signup-email", "Email is required."); valid = false;
  } else if (!email.endsWith("@bvrit.ac.in")) {
    setFieldError("signup-email", "Only @bvrit.ac.in emails are allowed."); valid = false;
  }
  if (!password || password.length < 6) {
    setFieldError("signup-password", "Password must be at least 6 characters."); valid = false;
  }
  if (password !== confirmPwd) {
    setFieldError("confirm-password", "Passwords do not match."); valid = false;
  }
  if (!valid) return;

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName, email, password, role: "student" })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert("signup-success");
      setTimeout(() => { window.location.href = "index.html"; }, 2000);
    } else {
      showAlert("signup-error", data.message || "Registration failed. Please try again.");
    }
  } catch (err) {
    // Demo fallback
    console.warn("Backend offline. Demo signup:", err.message);
    showAlert("signup-success");
    setTimeout(() => { window.location.href = "index.html"; }, 2000);
  } finally {
    setLoading(false);
  }
}
