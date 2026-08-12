// ==========================================
// CONFIGURATION & GLOBAL STATE
// ==========================================
const API_BASE_URL = "http://localhost:5000/api";

let currentUser = null;
let currentRoleTab = "student";
let currentSelectedClassroomId = null;
let isForgotPasswordMode = false;

// Token Helper for Authenticated Requests
function getToken() {
  return localStorage.getItem("pathshala_token");
}

async function authFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (response.status === 401) {
      handleLogout(false);
      showToast("Session expired. Please log in again.", "danger");
      throw new Error(data.message || "Unauthorized");
    }

    if (!response.ok) {
      throw new Error(data.message || "An error occurred");
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const iconName = type === "success" ? "check-circle" : "alert-circle";
  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.animation = "fadeIn 0.3s ease reverse forwards";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================
// VIEW SWITCH ROUTING CONTROLLER
// ==========================================
function showHomeView() {
  document.getElementById("view-home").style.display = "block";
  document.getElementById("view-auth").style.display = "none";
  document.getElementById("app-shell").style.display = "none";
}

function showAuthView(role = "student") {
  document.getElementById("view-home").style.display = "none";
  document.getElementById("view-auth").style.display = "block";
  document.getElementById("app-shell").style.display = "none";

  toggleForgotPasswordView(false);
  switchLoginRole(role);
}

function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("contact-name").value.trim();
  showToast(`Thank you, ${name}! Your inquiry has been sent to our helpdesk.`);
  e.target.reset();
}

// ==========================================
// AUTHENTICATION & LOGIN CONTROLS
// ==========================================
function switchLoginRole(role) {
  currentRoleTab = role;

  document.querySelectorAll(".auth-tab").forEach((tab) => tab.classList.remove("active"));
  const activeTab = document.getElementById(`tab-${role}`);
  if (activeTab) activeTab.classList.add("active");

  const formGroupName = document.getElementById("form-group-name");
  const formGroupPassword = document.getElementById("form-group-password");
  const btnSubmit = document.getElementById("btn-auth-submit");
  const autofills = document.getElementById("demo-autofills-container");

  formGroupName.style.display = "none";
  formGroupPassword.style.display = "block";
  if (autofills) autofills.style.display = "block";

  document.getElementById("auth-name").required = false;
  document.getElementById("auth-password").required = true;

  document.getElementById("auth-main-title").innerText = "Pathshala Sign In";
  document.getElementById("auth-main-subtitle").innerText = "Access your personal dashboard";
  document.getElementById("auth-logo-badge").innerHTML = `<i data-lucide="graduation-cap"></i>`;

  if (role === "student") {
    btnSubmit.querySelector("span").innerText = "Sign In as Student";
    setupAutofillBox("student@bvrit.ac.in", "student123", "Student");
  } else if (role === "parent") {
    btnSubmit.querySelector("span").innerText = "Sign In as Parent";
    setupAutofillBox("parent@bvrit.ac.in", "parent123", "Parent");
  } else if (role === "faculty") {
    btnSubmit.querySelector("span").innerText = "Sign In as Instructor";
    setupAutofillBox("faculty@bvrit.ac.in", "faculty123", "Faculty");
  } else if (role === "signup") {
    document.getElementById("auth-main-title").innerText = "Student Registration";
    document.getElementById("auth-main-subtitle").innerText = "Create a new student profile";
    formGroupName.style.display = "block";
    document.getElementById("auth-name").required = true;
    btnSubmit.querySelector("span").innerText = "Register Account";
    if (autofills) autofills.style.display = "none";
  }

  if (window.lucide) lucide.createIcons();
}

function setupAutofillBox(email, pass, label) {
  const credentialsBox = document.getElementById("demo-credentials-info");
  if (!credentialsBox) return;
  credentialsBox.innerHTML = `
    <div class="demo-credentials">
      <span>Email: ${email}</span>
      <span>Pass: ${pass}</span>
    </div>
    <button type="button" class="btn-quick-fill" onclick="quickFill('${email}', '${pass}')">Autofill ${label}</button>
  `;
}

function quickFill(email, password) {
  document.getElementById("auth-email").value = email;
  document.getElementById("auth-password").value = password;
}

function toggleForgotPasswordView(show) {
  isForgotPasswordMode = show;
  const tabs = document.getElementById("auth-switcher-tabs");
  const formGroupPass = document.getElementById("form-group-password");
  const formGroupName = document.getElementById("form-group-name");
  const footerOptions = document.getElementById("auth-footer-options");
  const autofills = document.getElementById("demo-autofills-container");
  const btnSubmit = document.getElementById("btn-auth-submit");

  if (show) {
    document.getElementById("auth-main-title").innerText = "Recover Password";
    document.getElementById("auth-main-subtitle").innerText = "We'll send a recovery link to your inbox";
    if (tabs) tabs.style.display = "none";
    if (formGroupPass) formGroupPass.style.display = "none";
    if (formGroupName) formGroupName.style.display = "none";
    if (autofills) autofills.style.display = "none";
    document.getElementById("auth-password").required = false;

    btnSubmit.querySelector("span").innerText = "Send Recovery Link";
    footerOptions.innerHTML = `
      <a href="#" class="auth-link" onclick="toggleForgotPasswordView(false)">Back to Sign In</a>
      <a href="#" class="auth-link" onclick="showHomeView()">Home</a>
    `;
  } else {
    if (tabs) tabs.style.display = "grid";
    footerOptions.innerHTML = `
      <a href="#" class="auth-link" id="link-forgot-pwd" onclick="toggleForgotPasswordView(true)">Forgot Password?</a>
      <a href="#" class="auth-link" onclick="showHomeView()"><i data-lucide="arrow-left" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:3px;"></i>Back to Homepage</a>
    `;
    switchLoginRole(currentRoleTab);
  }
  if (window.lucide) lucide.createIcons();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("auth-email").value.trim().toLowerCase();

  if (isForgotPasswordMode) {
    if (!email.endsWith("@bvrit.ac.in")) {
      showToast("Verification failed. Institutional domain @bvrit.ac.in required.", "danger");
      return;
    }
    showToast(`Password reset link dispatched to ${email}. Check your inbox.`);
    toggleForgotPasswordView(false);
    return;
  }

  // Student Sign Up
  if (currentRoleTab === "signup") {
    const name = document.getElementById("auth-name").value.trim();
    const pass = document.getElementById("auth-password").value;

    try {
      const data = await authFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password: pass, role: "student" }),
      });

      showToast("Account registered successfully! Please sign in.");
      switchLoginRole("student");
    } catch (err) {
      showToast(err.message || "Registration failed", "danger");
    }
    return;
  }

  // Login Handler
  const pass = document.getElementById("auth-password").value;
  try {
    const data = await authFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: pass, role: currentRoleTab }),
    });

    localStorage.setItem("pathshala_token", data.token);
    currentUser = data.user;

    showToast(`Welcome back to Pathshala, ${currentUser.name}!`);
    enterAppShell();
  } catch (err) {
    showToast(err.message || "Invalid credentials for chosen role.", "danger");
  }
}

function handleLogout(showNotification = true) {
  currentUser = null;
  currentSelectedClassroomId = null;
  localStorage.removeItem("pathshala_token");

  document.getElementById("app-shell").style.display = "none";
  document.getElementById("view-auth").style.display = "none";
  document.getElementById("view-home").style.display = "block";

  document.getElementById("auth-email").value = "";
  document.getElementById("auth-password").value = "";

  if (showNotification) showToast("Logged out successfully.");
}

// ==========================================
// SIDEBAR & SHELL CONTROLS
// ==========================================
function enterAppShell() {
  document.getElementById("view-auth").style.display = "none";
  document.getElementById("app-shell").style.display = "flex";

  document.getElementById("user-display-name").innerText = currentUser.name;
  document.getElementById("user-display-role").innerText = currentUser.role;

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
  document.getElementById("user-avatar").innerText = initials;

  buildSidebar();

  if (currentUser.role === "admin" || currentUser.role === "faculty") {
    navigatePanel("panel-faculty-overview");
  } else if (currentUser.role === "student") {
    navigatePanel("panel-student-overview");
  } else if (currentUser.role === "parent") {
    navigatePanel("panel-parent-overview");
  }

  if (window.lucide) lucide.createIcons();
}

function buildSidebar() {
  const menu = document.getElementById("sidebar-nav");
  menu.innerHTML = "";

  let navItems = [];

  if (currentUser.role === "admin" || currentUser.role === "faculty") {
    navItems = [
      { id: "nav-fac-overview", label: "My Classrooms", icon: "book-open", panel: "panel-faculty-overview" },
      { id: "nav-fac-materials", label: "Course Materials", icon: "upload-cloud", panel: "panel-faculty-materials" },
      { id: "nav-fac-creator", label: "Quiz/Assign Creator", icon: "plus-circle", panel: "panel-faculty-creator" },
      { id: "nav-fac-attendance", label: "Attendance Register", icon: "calendar", panel: "panel-faculty-attendance" },
      { id: "nav-fac-reports", label: "Performance Reports", icon: "bar-chart-2", panel: "panel-faculty-reports" },
    ];
  } else if (currentUser.role === "student") {
    navItems = [
      { id: "nav-stu-overview", label: "Enrolled Courses", icon: "home", panel: "panel-student-overview" },
      { id: "nav-stu-videos", label: "Video Lessons", icon: "video", panel: "panel-student-videos" },
      { id: "nav-stu-materials", label: "Study Notes", icon: "file-text", panel: "panel-student-materials" },
      { id: "nav-stu-assignments", label: "Assignments", icon: "edit-3", panel: "panel-student-assignments" },
      { id: "nav-stu-quizzes", label: "Quizzes", icon: "help-circle", panel: "panel-student-quizzes" },
      { id: "nav-stu-attendance", label: "My Attendance", icon: "calendar", panel: "panel-student-attendance" },
      { id: "nav-stu-grades", label: "Report Card", icon: "award", panel: "panel-student-grades" },
      { id: "nav-stu-notifications", label: "Notifications", icon: "bell", panel: "panel-student-notifications" },
      { id: "nav-stu-profile", label: "My Profile", icon: "user", panel: "panel-student-profile" },
    ];
  } else if (currentUser.role === "parent") {
    navItems = [
      { id: "nav-par-overview", label: "Child Progress", icon: "home", panel: "panel-parent-overview" },
      { id: "nav-par-attendance", label: "Attendance Report", icon: "calendar", panel: "panel-parent-attendance" },
      { id: "nav-par-grades", label: "Marks & Grades", icon: "award", panel: "panel-parent-grades" },
      { id: "nav-par-fees", label: "Fee Status", icon: "credit-card", panel: "panel-parent-fees" },
      { id: "nav-par-messages", label: "Teacher Messages", icon: "mail", panel: "panel-parent-messages" },
      { id: "nav-par-notifications", label: "Notifications Feed", icon: "bell", panel: "panel-parent-notifications" },
    ];
  }

  navItems.forEach((item) => {
    const li = document.createElement("li");
    li.className = "nav-item";
    li.id = item.id;
    li.innerHTML = `
      <button onclick="navigatePanel('${item.panel}', '${item.id}')">
        <i data-lucide="${item.icon}"></i>
        <span>${item.label}</span>
      </button>
    `;
    menu.appendChild(li);
  });
}

function navigatePanel(panelId, navItemId = null) {
  document.querySelectorAll(".dashboard-panel").forEach((p) => p.classList.remove("active"));
  const target = document.getElementById(panelId);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
  if (navItemId) {
    const navEl = document.getElementById(navItemId);
    if (navEl) navEl.classList.add("active");
  }

  updateHeaderTitle(panelId);
  renderPanelContent(panelId);
}

function updateHeaderTitle(panelId) {
  const titleEl = document.getElementById("main-view-title");
  const subtitleEl = document.getElementById("main-view-subtitle");

  const titles = {
    "panel-student-overview": ["Student Classrooms", "Enter your active academic course pages."],
    "panel-student-videos": ["Video Lectures", "Watch recorded classrooms and stream online study lectures."],
    "panel-student-materials": ["Study Materials", "Download guides, datasets, and syllabus PDF notes."],
    "panel-student-assignments": ["My Assignments", "Track pending class tasks and submit homework answers."],
    "panel-student-quizzes": ["Portal Quizzes", "Take quick interactive MCQ tests and check scores."],
    "panel-student-attendance": ["My Attendance Logs", "Review daily check-ins recorded by your course instructors."],
    "panel-student-grades": ["My Grades", "Verify total evaluation feedback and course marks."],
    "panel-student-notifications": ["Notifications Hub", "Check system alerts and recent classroom post notices."],
    "panel-student-profile": ["My Profile Settings", "Modify display settings and account password."],
    "panel-parent-overview": ["Child Performance Overview", "Monitor linked student's dashboard logs and general averages."],
    "panel-parent-attendance": ["Child Attendance Reports", "Check log details of child check-ins."],
    "panel-parent-grades": ["Child Report Card Marks", "Review graded submissions, numeric scores, and instructor feedback."],
    "panel-parent-fees": ["Fee Status Dues", "Monitor school fee deadlines, pay invoices, and verify receipts."],
    "panel-parent-messages": ["Direct Teacher Messaging", "Read direct comments and performance advisories from teachers."],
    "panel-parent-notifications": ["Parent Notification Feed", "Recent alerts concerning child course logs."],
    "panel-faculty-overview": ["Instructor Classrooms", "Enter classroom manager dashboard desks."],
    "panel-faculty-materials": ["Course Material Manager", "Upload and manage reference PDFs and streaming video links."],
    "panel-faculty-creator": ["Quiz & Assignment Designer", "Publish new homework deadlines and MCQ tests to classrooms."],
    "panel-faculty-attendance": ["Attendance Registrar Desk", "Track student presence lists and commit daily log sheets."],
    "panel-faculty-reports": ["Performance Reports & Stats", "Analyze students grades distribution metrics and averages."],
  };

  if (titles[panelId]) {
    titleEl.innerText = titles[panelId][0];
    subtitleEl.innerText = titles[panelId][1];
  }
}

function toggleMobileSidebar() {
  document.querySelector(".sidebar").classList.toggle("open");
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add("open");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("open");
}

// ==========================================
// DYNAMIC PANEL RENDER ENGINE (FETCH API)
// ==========================================
async function renderPanelContent(panelId) {
  try {
    // STUDENT - COURSES OVERVIEW
    if (panelId === "panel-student-overview") {
      const grid = document.getElementById("grid-student-courses");
      grid.innerHTML = '<div style="grid-column:1/-1; text-align:center;">Loading courses...</div>';

      const data = await authFetch("/academic/student/courses");
      grid.innerHTML = "";

      if (!data.courses || data.courses.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; border:1px dashed var(--border);">No classrooms registered.</div>`;
      } else {
        data.courses.forEach((c) => {
          const div = document.createElement("div");
          div.className = "course-card";
          div.innerHTML = `
            <span class="course-code">${c.code}</span>
            <h3 class="course-title">${c.title}</h3>
            <p class="course-desc">${c.desc}</p>
            <div class="course-meta">
              <span><i data-lucide="user"></i> ${c.facultyId ? c.facultyId.name : "Instructor"}</span>
              <span style="font-weight:700; color:var(--primary);">Enrolled</span>
            </div>
          `;
          grid.appendChild(div);
        });
      }
    }

    // STUDENT - PROFILE SETTINGS
    else if (panelId === "panel-student-profile") {
      document.getElementById("profile-name").value = currentUser.name;
      document.getElementById("profile-email").value = currentUser.email;
      document.getElementById("profile-password").value = "";
    }

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    showToast(err.message || "Failed to load panel data", "danger");
  }
}

// ==========================================
// FORM SUBMISSION HANDLERS
// ==========================================
async function handleProfileUpdate(e) {
  e.preventDefault();
  const name = document.getElementById("profile-name").value.trim();
  const pass = document.getElementById("profile-password").value;

  try {
    const data = await authFetch("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name, password: pass }),
    });

    currentUser.name = data.user.name;
    document.getElementById("user-display-name").innerText = currentUser.name;
    showToast("Profile credentials updated successfully.");
  } catch (err) {
    showToast(err.message || "Failed to update profile", "danger");
  }
}

// ==========================================
// INITIALIZATION
// ==========================================
window.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();

  const token = getToken();
  if (token) {
    try {
      // Re-verify token on page load
      const data = await authFetch("/auth/profile", { method: "PUT", body: JSON.stringify({}) });
      currentUser = data.user;
      enterAppShell();
    } catch (err) {
      handleLogout(false);
    }
  }
});