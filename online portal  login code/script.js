// ============================================================
//  PATHSHALA – Frontend Login Script (script.js)
//  Calls backend API at http://localhost:5000/api/auth
// ============================================================

const API_BASE = "http://localhost:5000/api/auth";

// Demo credentials per role
const DEMO_CREDENTIALS = {
  student: { email: "student@bvrit.ac.in", pass: "student123", label: "Sign In as Student" },
  parent:  { email: "parent@bvrit.ac.in",  pass: "parent123",  label: "Sign In as Parent"  },
  faculty: { email: "faculty@bvrit.ac.in", pass: "faculty123", label: "Sign In as Faculty"  },
  admin:   { email: "admin@bvrit.ac.in",   pass: "admin123",   label: "Sign In as Admin"    }
};

let currentRole = "student";

// ── Switch role tab ──────────────────────────────────────────
function switchRole(role) {
  currentRole = role;

  // Update tab active state
  document.querySelectorAll(".role-tab").forEach(t => t.classList.remove("active"));
  document.querySelector(`[data-role="${role}"]`).classList.add("active");

  // Update button label & demo box
  const creds = DEMO_CREDENTIALS[role];
  document.getElementById("btn-label").textContent = creds.label;
  document.getElementById("demo-email").textContent = creds.email;
  document.getElementById("demo-pass").textContent = creds.pass;

  clearErrors();
}

// ── Auto-fill demo credentials ──────────────────────────────
function autofill() {
  const creds = DEMO_CREDENTIALS[currentRole];
  document.getElementById("email").value = creds.email;
  document.getElementById("password").value = creds.pass;
  clearErrors();
}

// ── Toggle password visibility ──────────────────────────────
function togglePasswordVisibility() {
  const input = document.getElementById("password");
  const icon  = document.getElementById("eye-icon");

  if (input.type === "password") {
    input.type = "text";
    icon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>`;
  } else {
    input.type = "password";
    icon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>`;
  }
}

// ── Validate single field ────────────────────────────────────
function validateEmail(email) {
  if (!email)                          return "Email is required.";
  if (!email.endsWith("@bvrit.ac.in")) return "Only @bvrit.ac.in emails are allowed.";
  return null;
}
function validatePassword(pass) {
  if (!pass)          return "Password is required.";
  if (pass.length < 6) return "Password must be at least 6 characters.";
  return null;
}

// ── Show / clear field errors ────────────────────────────────
function showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errEl = document.getElementById(`${fieldId}-error`);
  if (input)  input.classList.add("error");
  if (errEl)  errEl.textContent = message;
}
function clearErrors() {
  ["email", "password"].forEach(id => {
    const input = document.getElementById(id);
    const errEl = document.getElementById(`${id}-error`);
    if (input)  input.classList.remove("error");
    if (errEl)  errEl.textContent = "";
  });
  hideAlert("login-error");
  hideAlert("login-success");
}

// ── Alert helpers ────────────────────────────────────────────
function showAlert(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = "flex";
  const textEl = el.querySelector("span");
  if (textEl && message) textEl.textContent = message;
}
function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

// ── Button loading state ─────────────────────────────────────
function setLoading(loading) {
  const btn     = document.getElementById("btn-login");
  const label   = document.getElementById("btn-label");
  const spinner = document.getElementById("login-spinner");
  btn.disabled      = loading;
  label.style.display  = loading ? "none" : "block";
  spinner.style.display = loading ? "block" : "none";
}

// ── Main Login Handler ───────────────────────────────────────
async function handleLogin(event) {
  event.preventDefault();
  clearErrors();

  const email    = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const remember = document.getElementById("remember-me").checked;

  // Client-side validation
  let valid = true;
  const emailErr = validateEmail(email);
  const passErr  = validatePassword(password);
  if (emailErr) { showFieldError("email",    emailErr); valid = false; }
  if (passErr)  { showFieldError("password", passErr);  valid = false; }
  if (!valid) return;

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: currentRole })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      // Store token
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("pathshala_token", data.token);
      storage.setItem("pathshala_user",  JSON.stringify(data.user));

      showAlert("login-success", `Welcome back, ${data.user.name}! Redirecting to dashboard…`);

      // Redirect based on role after short delay
      setTimeout(() => {
        const dashboardMap = {
          student: "student-dashboard.html",
          parent:  "parent-dashboard.html",
          faculty: "faculty-dashboard.html",
          admin:   "admin-dashboard.html"
        };
        window.location.href = dashboardMap[data.user.role] || "index.html";
      }, 1200);

    } else {
      showAlert("login-error", data.message || "Invalid credentials. Please try again.");
    }

  } catch (err) {
    // If backend is not running, fall back to demo mode
    console.warn("Backend offline — using demo mode:", err.message);
    demoFallbackLogin(email, password);
  } finally {
    setLoading(false);
  }
}

// ── Demo Fallback (when backend is offline) ──────────────────
const DEMO_USERS = [
  { email: "student@bvrit.ac.in", password: "student123", role: "student", name: "Demo Student" },
  { email: "parent@bvrit.ac.in",  password: "parent123",  role: "parent",  name: "Demo Parent"  },
  { email: "faculty@bvrit.ac.in", password: "faculty123", role: "faculty", name: "Demo Faculty"  },
  { email: "admin@bvrit.ac.in",   password: "admin123",   role: "admin",   name: "Demo Admin"   }
];

function demoFallbackLogin(email, password) {
  const user = DEMO_USERS.find(
    u => u.email === email && u.password === password && u.role === currentRole
  );

  if (user) {
    sessionStorage.setItem("pathshala_user", JSON.stringify(user));
    showAlert("login-success", `[Demo Mode] Welcome, ${user.name}! Redirecting…`);
    setTimeout(() => {
      showAlert("login-success", "Dashboard page will be linked when backend is running.");
    }, 1500);
  } else {
    showAlert("login-error", "Invalid credentials. Check email, password, and selected role.");
  }
}

// ── Forgot Password ──────────────────────────────────────────
function showForgotPassword(event) {
  event.preventDefault();
  document.getElementById("view-login").style.display  = "none";
  document.getElementById("view-forgot").style.display = "block";
}

function showLogin() {
  document.getElementById("view-forgot").style.display = "none";
  document.getElementById("view-login").style.display  = "block";
  hideAlert("forgot-success");
}

async function handleForgotPassword(event) {
  event.preventDefault();
  const email = document.getElementById("forgot-email").value.trim().toLowerCase();

  if (!email.endsWith("@bvrit.ac.in")) {
    alert("Only @bvrit.ac.in email addresses are accepted.");
    return;
  }

  try {
    await fetch(`${API_BASE}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
  } catch (_) {
    // Backend offline – still show success UI (demo)
  }

  showAlert("forgot-success");
}

// ── On page load ─────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  // If already logged in, redirect
  const user = sessionStorage.getItem("pathshala_user") || localStorage.getItem("pathshala_user");
  if (user) {
    const parsed = JSON.parse(user);
    // Uncomment to auto-redirect: window.location.href = `${parsed.role}-dashboard.html`;
  }
});
