// ==========================================
// CONFIGURATION & BACKEND API INTEGRATION
// ==========================================
const API_BASE_URL = "/api";

function getToken() {
  return localStorage.getItem("pathshala_token");
}

function setToken(token) {
  if (token) localStorage.setItem("pathshala_token", token);
  else localStorage.removeItem("pathshala_token");
}

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

// ==========================================
// IN-MEMORY & DATABASE RUNTIME STATE
// Central Student: Sathwik (Roll: 24211a6797, Dept: CSE, Semester 4)
// ==========================================

let db = {
  users: [],
  courses: [],
  enrollments: [],
  attendance: [],
  fees: [],
  assignments: [],
  submissions: [],
  quizzes: [],
  quizAttempts: [],
  messages: [],
  announcements: [],
  materials: [],
  videos: [],
  notifications: []
};

function generateId(prefix) {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==========================================
// LIVE BACKEND DATA SYNCHRONIZATION
// ==========================================
async function syncLiveDB() {
  try {
    // 1. Fetch public courses
    const coursesRes = await apiFetch("/courses");
    if (coursesRes && coursesRes.courses) {
      db.courses = coursesRes.courses.map(c => ({
        id: c._id || c.id,
        code: c.code,
        title: c.title,
        desc: c.desc,
        duration: c.duration || "8 Weeks",
        category: c.category || "General",
        resources: c.resources || "",
        facultyId: c.facultyId ? (c.facultyId._id || c.facultyId) : null
      }));
    }

    if (currentUser) {
      // 2. Fetch Notifications
      try {
        const ntfRes = await apiFetch("/notifications");
        if (ntfRes && ntfRes.notifications) {
          db.notifications = ntfRes.notifications.map(n => ({
            id: n._id || n.id,
            userId: n.userId,
            text: n.text,
            date: n.date,
            read: n.read
          }));
        }
      } catch (e) { }

      // 3. Role-specific Syncing
      if (currentUser.role === "student") {
        try {
          const syncRes = await apiFetch("/student/sync");
          if (syncRes && syncRes.success) {
            db.student = syncRes.student;
            db.courses = syncRes.courses.map(c => ({
              id: c._id || c.id,
              code: c.code,
              title: c.title,
              facultyId: c.facultyId ? (c.facultyId._id || c.facultyId) : null
            }));
            if (syncRes.enrollments) {
              db.enrollments = syncRes.enrollments.map(e => ({
                id: e._id || e.id,
                studentId: e.studentId,
                courseId: e.courseId ? (e.courseId._id || e.courseId.id || e.courseId) : null
              }));
            }
            db.materials = syncRes.materials.map(m => ({
              id: m._id || m.id,
              courseId: m.courseId ? (m.courseId._id || m.courseId.id || m.courseId) : null,
              title: m.title,
              type: m.type || "PDF",
              link: m.link
            }));
            db.videos = syncRes.videos.map(v => ({
              id: v._id || v.id,
              courseId: v.courseId ? (v.courseId._id || v.courseId.id || v.courseId) : null,
              title: v.title,
              link: v.link
            }));
            db.assignments = syncRes.assignments.map(a => ({
              id: a._id || a.id,
              courseId: a.courseId ? (a.courseId._id || a.courseId.id || a.courseId) : null,
              title: a.title,
              desc: a.desc,
              due: a.due
            }));
            db.submissions = syncRes.submissions.map(s => ({
              id: s._id || s.id,
              assignmentId: s.assignmentId ? (s.assignmentId._id || s.assignmentId.id || s.assignmentId) : null,
              courseId: s.courseId ? (s.courseId._id || s.courseId.id || s.courseId) : null,
              studentId: s.studentId,
              content: s.content,
              submittedAt: s.submittedAt,
              grade: s.grade,
              feedback: s.feedback
            }));
            db.quizzes = syncRes.quizzes.map(q => ({
              id: q._id || q.id,
              courseId: q.courseId ? (q.courseId._id || q.courseId.id || q.courseId) : null,
              title: q.title,
              questions: q.questions
            }));
            db.quizAttempts = syncRes.quizAttempts.map(qa => ({
              id: qa._id || qa.id,
              quizId: qa.quizId ? (qa.quizId._id || qa.quizId.id || qa.quizId) : null,
              courseId: qa.courseId ? (qa.courseId._id || qa.courseId.id || qa.courseId) : null,
              studentId: qa.studentId,
              score: qa.score,
              date: qa.date
            }));
            db.attendance = syncRes.attendance.map(a => ({
              id: a._id || a.id,
              studentId: a.studentId,
              courseId: a.courseId ? (a.courseId._id || a.courseId.id || a.courseId) : null,
              date: a.date,
              status: a.status
            }));
            db.announcements = syncRes.announcements.map(a => ({
              id: a._id || a.id,
              courseId: a.courseId ? (a.courseId._id || a.courseId.id || a.courseId) : null,
              text: a.text,
              date: a.date
            }));
            db.fees = syncRes.fees.map(f => ({
              id: f._id || f.id,
              studentId: f.studentId,
              amount: f.amount,
              dueDate: f.dueDate,
              status: f.status
            }));
            db.academicRecords = (syncRes.academicRecords || []).map(r => ({
              id: r._id || r.id,
              studentId: r.studentId,
              semester: r.semester,
              sgpa: r.sgpa,
              cleared: r.cleared
            }));
          }
        } catch (e) {
          console.error("Failed to sync student DB:", e);
        }
      } else if (currentUser.role === "faculty" || currentUser.role === "admin") {
        try {
          const usersRes = await apiFetch("/auth/users");
          if (usersRes && usersRes.users) {
            db.users = usersRes.users.map(u => ({
              id: u._id || u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              childId: u.childId
            }));
          }
        } catch (e) { }

        try {
          const facSyncRes = await apiFetch("/faculty/sync");
          if (facSyncRes && facSyncRes.success) {
            db.courses = facSyncRes.courses.map(c => ({ id: c._id || c.id, code: c.code, title: c.title, desc: c.desc, duration: c.duration, category: c.category, resources: c.resources, facultyId: c.facultyId ? (c.facultyId._id || c.facultyId) : null }));
            db.enrollments = facSyncRes.enrollments.map(e => ({ id: e._id || e.id, studentId: e.studentId, courseId: e.courseId }));
            db.assignments = facSyncRes.assignments.map(a => ({ id: a._id || a.id, courseId: a.courseId, title: a.title, desc: a.desc, due: a.due }));
            db.submissions = facSyncRes.submissions.map(s => ({ id: s._id || s.id, studentId: s.studentId, courseId: s.courseId, assignmentId: s.assignmentId, grade: s.grade, feedback: s.feedback, content: s.content }));
            db.quizzes = facSyncRes.quizzes.map(q => ({ id: q._id || q.id, courseId: q.courseId, title: q.title, questions: q.questions }));
            db.quizAttempts = facSyncRes.quizAttempts.map(q => ({ id: q._id || q.id, studentId: q.studentId, courseId: q.courseId, quizId: q.quizId, score: q.score, date: q.date }));
            db.attendance = facSyncRes.attendance.map(a => ({ id: a._id || a.id, studentId: a.studentId ? (a.studentId._id || a.studentId.id || a.studentId) : null, courseId: a.courseId ? (a.courseId._id || a.courseId.id || a.courseId) : null, date: a.date, status: a.status }));
            db.announcements = facSyncRes.announcements.map(a => ({ id: a._id || a.id, courseId: a.courseId, text: a.text, date: a.date }));
            db.materials = facSyncRes.materials.map(m => ({ id: m._id || m.id, courseId: m.courseId, title: m.title, type: m.type, link: m.link }));
            db.videos = facSyncRes.videos.map(v => ({ id: v._id || v.id, courseId: v.courseId, title: v.title, link: v.link }));
          }
        } catch (e) { }
      } else if (currentUser.role === "parent") {
        try {
          const dashRes = await apiFetch("/parent/dashboard");
          if (dashRes && dashRes.success) {
            db.parentDashboardData = dashRes.data;
          }
        } catch (e) { }

        try {
          const parSyncRes = await apiFetch("/parent/sync");
          if (parSyncRes && parSyncRes.success) {
            db.courses = parSyncRes.courses.map(c => ({ id: c._id || c.id, code: c.code, title: c.title, desc: c.desc, duration: c.duration, category: c.category, resources: c.resources, facultyId: c.facultyId ? (c.facultyId._id || c.facultyId) : null }));
            db.enrollments = parSyncRes.enrollments.map(e => ({ id: e._id || e.id, studentId: e.studentId, courseId: e.courseId }));
            db.assignments = parSyncRes.assignments.map(a => ({ id: a._id || a.id, courseId: a.courseId, title: a.title, desc: a.desc, due: a.due }));
            db.submissions = parSyncRes.submissions.map(s => ({ id: s._id || s.id, studentId: s.studentId, courseId: s.courseId, assignmentId: s.assignmentId, grade: s.grade, feedback: s.feedback, content: s.content }));
            db.quizzes = parSyncRes.quizzes.map(q => ({ id: q._id || q.id, courseId: q.courseId, title: q.title, questions: q.questions }));
            db.quizAttempts = parSyncRes.quizAttempts.map(q => ({ id: q._id || q.id, studentId: q.studentId, courseId: q.courseId, quizId: q.quizId, score: q.score, date: q.date }));
            db.attendance = parSyncRes.attendance.map(a => ({ id: a._id || a.id, studentId: a.studentId ? (a.studentId._id || a.studentId.id || a.studentId) : null, courseId: a.courseId ? (a.courseId._id || a.courseId.id || a.courseId) : null, date: a.date, status: a.status }));
            db.announcements = parSyncRes.announcements.map(a => ({ id: a._id || a.id, courseId: a.courseId, text: a.text, date: a.date }));
            db.fees = parSyncRes.fees.map(f => ({ id: f._id || f.id, parentId: f.parentId, childId: f.childId, title: f.title, due: f.due, amount: f.amount, status: f.status, receipt: f.receipt }));
            db.messages = parSyncRes.messages.map(m => ({ id: m._id || m.id, parentId: m.parentId, facultyId: m.facultyId, text: m.text, date: m.date }));
            db.academicRecords = (parSyncRes.academicRecords || []).map(r => ({ id: r._id || r.id, studentId: r.studentId, semester: r.semester, sgpa: r.sgpa, cleared: r.cleared }));
          }
        } catch (e) { }
      }
    }
  } catch (err) {
    console.warn("Backend live sync notice:", err.message);
  }
}

// ==========================================
// SESSION STATE
// ==========================================
let currentUser = null;
let currentRoleTab = "student";
let currentSelectedClassroomId = null;

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
  lucide.createIcons();

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

  document.getElementById("auth-signin-card").style.display = "block";
  document.getElementById("auth-signup-card").style.display = "none";

  toggleForgotPasswordView(false);
  switchLoginRole(role);
}

function showSignupView(role = "student") {
  document.getElementById("view-home").style.display = "none";
  document.getElementById("view-auth").style.display = "block";
  document.getElementById("app-shell").style.display = "none";

  document.getElementById("auth-signin-card").style.display = "none";
  document.getElementById("auth-signup-card").style.display = "block";

  switchSignupRole(role);
}

// ==========================================
// CONTACT FORM HANDLER
// ==========================================
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

  document.querySelectorAll(".auth-tab").forEach(tab => tab.classList.remove("active"));
  const activeTab = document.getElementById(`tab-${role}`);
  if (activeTab) activeTab.classList.add("active");

  const btnSubmit = document.getElementById("btn-auth-submit");
  const title = document.getElementById("auth-main-title");
  const subtitle = document.getElementById("auth-main-subtitle");
  const emailGroup = document.getElementById("form-group-email");
  const emailInput = document.getElementById("auth-email");
  const passGroup = document.getElementById("form-group-password");
  const passInput = document.getElementById("auth-password");
  const parentRollGroup = document.getElementById("form-group-parent-roll");
  const parentRollInput = document.getElementById("auth-parent-roll");
  const parentPhoneGroup = document.getElementById("form-group-parent-phone");
  const parentPhoneInput = document.getElementById("auth-parent-phone");
  const forgotPwdLink = document.getElementById("link-forgot-pwd");

  title.innerText = "Pathshala Sign In";

  if (role === "student") {
    subtitle.innerText = "Access your personal student dashboard";
    btnSubmit.querySelector("span").innerText = "Sign In as Student";

    if (emailGroup) emailGroup.style.display = "block";
    if (emailInput) emailInput.required = true;
    if (passGroup) passGroup.style.display = "block";
    if (passInput) passInput.required = true;

    if (parentRollGroup) parentRollGroup.style.display = "none";
    if (parentRollInput) parentRollInput.required = false;
    if (parentPhoneGroup) parentPhoneGroup.style.display = "none";
    if (parentPhoneInput) parentPhoneInput.required = false;

    if (forgotPwdLink) forgotPwdLink.style.display = "inline-block";
  } else if (role === "faculty") {
    subtitle.innerText = "Access your faculty instructor dashboard";
    btnSubmit.querySelector("span").innerText = "Sign In as Faculty";

    if (emailGroup) emailGroup.style.display = "block";
    if (emailInput) emailInput.required = true;
    if (passGroup) passGroup.style.display = "block";
    if (passInput) passInput.required = true;

    if (parentRollGroup) parentRollGroup.style.display = "none";
    if (parentRollInput) parentRollInput.required = false;
    if (parentPhoneGroup) parentPhoneGroup.style.display = "none";
    if (parentPhoneInput) parentPhoneInput.required = false;

    if (forgotPwdLink) forgotPwdLink.style.display = "inline-block";
  } else if (role === "parent") {
    subtitle.innerText = "Access your child's progress portal";
    btnSubmit.querySelector("span").innerText = "Sign In as Parent";

    if (emailGroup) emailGroup.style.display = "none";
    if (emailInput) emailInput.required = false;
    if (passGroup) passGroup.style.display = "none";
    if (passInput) passInput.required = false;

    if (parentRollGroup) parentRollGroup.style.display = "block";
    if (parentRollInput) parentRollInput.required = true;
    if (parentPhoneGroup) parentPhoneGroup.style.display = "block";
    if (parentPhoneInput) parentPhoneInput.required = true;

    if (forgotPwdLink) forgotPwdLink.style.display = "none";
  }

  lucide.createIcons();
}

function switchSignupRole(role) {
  // Only student or faculty allowed for signup
  const targetRole = role === "faculty" ? "faculty" : "student";
  document.querySelectorAll(".signup-tab").forEach(tab => tab.classList.remove("active"));
  const activeTab = document.getElementById(`signup-tab-${targetRole}`);
  if (activeTab) activeTab.classList.add("active");

  document.getElementById("form-signup-student").style.display = targetRole === "student" ? "block" : "none";
  document.getElementById("form-signup-faculty").style.display = targetRole === "faculty" ? "block" : "none";

  lucide.createIcons();
}

function handleFacultyDeptChange(value) {
  const otherGroup = document.getElementById("form-group-fac-dept-other");
  const otherInput = document.getElementById("signup-fac-dept-other");
  if (!otherGroup || !otherInput) return;

  if (value === "Other") {
    otherGroup.style.display = "block";
    otherInput.required = true;
    otherInput.focus();
  } else {
    otherGroup.style.display = "none";
    otherInput.required = false;
    otherInput.value = "";
  }
  lucide.createIcons();
}

let isForgotPasswordMode = false;
function toggleForgotPasswordView(show) {
  isForgotPasswordMode = show;
  const tabs = document.getElementById("auth-switcher-tabs");
  const emailGroup = document.getElementById("form-group-email");
  const formGroupPass = document.getElementById("form-group-password");
  const formGroupForgotPass = document.getElementById("form-group-forgot-password");
  const parentRollGroup = document.getElementById("form-group-parent-roll");
  const parentPhoneGroup = document.getElementById("form-group-parent-phone");
  const signupPrompt = document.getElementById("auth-signup-prompt-box");
  const footerOptions = document.getElementById("auth-footer-options");
  const btnSubmit = document.getElementById("btn-auth-submit");

  if (show) {
    document.getElementById("auth-main-title").innerText = "Recover Password";
    document.getElementById("auth-main-subtitle").innerText = "Reset your institutional password";
    if (tabs) tabs.style.display = "none";
    if (emailGroup) emailGroup.style.display = "block";
    if (formGroupPass) formGroupPass.style.display = "none";
    if (formGroupForgotPass) formGroupForgotPass.style.display = "block";
    if (parentRollGroup) parentRollGroup.style.display = "none";
    if (parentPhoneGroup) parentPhoneGroup.style.display = "none";
    if (signupPrompt) signupPrompt.style.display = "none";

    btnSubmit.querySelector("span").innerText = "Reset Password";

    footerOptions.innerHTML = `
      <a href="#" class="auth-link" onclick="toggleForgotPasswordView(false)">&larr; Back to Sign In</a>
      <a href="#" class="auth-link" onclick="showHomeView()">Home</a>
    `;
  } else {
    if (tabs) tabs.style.display = "grid";
    if (formGroupForgotPass) formGroupForgotPass.style.display = "none";
    if (signupPrompt) signupPrompt.style.display = "flex";

    footerOptions.innerHTML = `
      <a href="#" class="auth-link" id="link-forgot-pwd" onclick="toggleForgotPasswordView(true)">Forgot Password?</a>
      <a href="#" class="auth-link" onclick="showHomeView()"><i data-lucide="arrow-left" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:3px;"></i>Back to Homepage</a>
    `;
    switchLoginRole(currentRoleTab);
  }
  lucide.createIcons();
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  // 1. Forgot Password Flow
  if (isForgotPasswordMode) {
    const email = document.getElementById("auth-email").value.trim().toLowerCase();
    const newPassword = document.getElementById("forgot-new-password").value;
    try {
      const data = await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email, newPassword: newPassword || "password123", role: currentRoleTab })
      });
      showToast(data.message || "Password reset successfully!");
      toggleForgotPasswordView(false);
    } catch (err) {
      showToast(err.message || "Password reset failed.", "danger");
    }
    return;
  }

  // 2. Parent Login Flow (Student Roll Number + Mobile Number)
  if (currentRoleTab === "parent") {
    const studentRollNumber = document.getElementById("auth-parent-roll").value.trim();
    const mobileNumber = document.getElementById("auth-parent-phone").value.trim();

    if (!studentRollNumber) {
      showToast("Please enter the Student's Roll Number.", "danger");
      document.getElementById("auth-parent-roll").focus();
      return;
    }

    if (!mobileNumber) {
      showToast("Please enter your registered Mobile Number.", "danger");
      document.getElementById("auth-parent-phone").focus();
      return;
    }

    const cleanDigits = mobileNumber.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      showToast("Please enter a valid 10-digit mobile number.", "danger");
      document.getElementById("auth-parent-phone").focus();
      return;
    }

    try {
      const data = await apiFetch("/auth/parent-login", {
        method: "POST",
        body: JSON.stringify({ studentRollNumber, mobileNumber })
      });
      setToken(data.token);
      currentUser = data.user;
      localStorage.setItem("pathshala_current_user", JSON.stringify(currentUser));
      showToast(`Welcome to Pathshala, ${currentUser.name}!`);
      await syncLiveDB();
      enterAppShell();
    } catch (err) {
      showToast(err.message || "Parent authentication failed. Check Roll Number and Mobile Number.", "danger");
    }
    return;
  }

  // 3. Student & Faculty Regular Sign In (Email + Password)
  const email = document.getElementById("auth-email").value.trim().toLowerCase();
  const password = document.getElementById("auth-password").value;

  if (!email || !password) {
    showToast("Please enter both email address and password.", "danger");
    return;
  }

  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role: currentRoleTab })
    });
    setToken(data.token);
    currentUser = data.user;
    localStorage.setItem("pathshala_current_user", JSON.stringify(currentUser));
    showToast(`Welcome back to Pathshala, ${currentUser.name}!`);
    await syncLiveDB();
    enterAppShell();
  } catch (err) {
    showToast(err.message || "Invalid credentials. Check email and password.", "danger");
  }
}

async function handleSignupSubmit(event, role) {
  event.preventDefault();

  let payload = { role };

  if (role === "student") {
    const name = document.getElementById("signup-stu-name").value.trim();
    const studentId = document.getElementById("signup-stu-id").value.trim();
    const email = document.getElementById("signup-stu-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-stu-pass").value;
    const confirmPass = document.getElementById("signup-stu-confirm-pass").value;

    if (password !== confirmPass) {
      showToast("Passwords do not match. Please re-enter.", "danger");
      return;
    }
    if (!email.endsWith("@bvrit.ac.in")) {
      showToast("Email must end with @bvrit.ac.in institutional domain.", "danger");
      return;
    }
    payload = { name, email, password, role: "student", studentId };
  } else if (role === "faculty") {
    const name = document.getElementById("signup-fac-name").value.trim();
    const deptSelect = document.getElementById("signup-fac-dept");
    let department = deptSelect ? deptSelect.value : "";

    if (!department) {
      showToast("Please select your department from the dropdown.", "danger");
      if (deptSelect) deptSelect.focus();
      return;
    }

    if (department === "Other") {
      const otherVal = document.getElementById("signup-fac-dept-other").value.trim();
      if (!otherVal) {
        showToast("Please enter your department name.", "danger");
        document.getElementById("signup-fac-dept-other").focus();
        return;
      }
      department = otherVal;
    }

    const email = document.getElementById("signup-fac-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-fac-pass").value;
    const confirmPass = document.getElementById("signup-fac-confirm-pass").value;

    if (password !== confirmPass) {
      showToast("Passwords do not match. Please re-enter.", "danger");
      return;
    }
    if (!email.endsWith("@bvrit.ac.in")) {
      showToast("Email must end with @bvrit.ac.in institutional domain.", "danger");
      return;
    }
    payload = { name, email, password, role: "faculty", department };
  }

  try {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    setToken(data.token);
    currentUser = data.user;
    localStorage.setItem("pathshala_current_user", JSON.stringify(currentUser));
    showToast(`Welcome to Pathshala, ${currentUser.name}!`);
    if (typeof confetti === "function") {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
    await syncLiveDB();
    enterAppShell();
  } catch (err) {
    showToast(err.message || "Registration failed.", "danger");
  }
}

function handleLogout() {
  setToken(null);
  currentUser = null;
  currentSelectedClassroomId = null;
  localStorage.removeItem("pathshala_current_user");

  document.getElementById("app-shell").style.display = "none";
  document.getElementById("view-auth").style.display = "none";
  document.getElementById("view-home").style.display = "block";

  document.getElementById("auth-email").value = "";
  document.getElementById("auth-password").value = "";

  showToast("Logged out successfully.");
}

// ==========================================
// SIDEBAR & ROUTING CONTROLS
// ==========================================
function enterAppShell() {
  document.getElementById("view-home").style.display = "none";
  document.getElementById("view-auth").style.display = "none";
  document.getElementById("app-shell").style.display = "flex";

  document.getElementById("user-display-name").innerText = currentUser.name;
  document.getElementById("user-display-role").innerText = currentUser.role;

  const initials = currentUser.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  document.getElementById("user-avatar").innerText = initials;

  buildSidebar();

  if (currentUser.role === "admin" || currentUser.role === "faculty") {
    navigatePanel("panel-faculty-home");
  } else if (currentUser.role === "student") {
    navigatePanel("panel-student-home");
  } else if (currentUser.role === "parent") {
    navigatePanel("panel-parent-home");
  }

  lucide.createIcons();
}

function buildSidebar() {
  const menu = document.getElementById("sidebar-nav");
  menu.innerHTML = "";

  let navItems = [];

  if (currentUser.role === "admin" || currentUser.role === "faculty") {
    navItems = [
      { id: "nav-fac-home", label: "Home", icon: "home", panel: "panel-faculty-home" },
      { id: "nav-fac-overview", label: "My Classrooms", icon: "book-open", panel: "panel-faculty-overview" },
      { id: "nav-fac-courses", label: "Course Management", icon: "folder-plus", panel: "panel-faculty-courses" },
      { id: "nav-fac-materials", label: "Course Materials", icon: "upload-cloud", panel: "panel-faculty-materials" },
      { id: "nav-fac-creator", label: "Quiz/Assign Creator", icon: "plus-circle", panel: "panel-faculty-creator" },
      { id: "nav-fac-attendance", label: "Attendance Register", icon: "calendar", panel: "panel-faculty-attendance" },
      { id: "nav-fac-reports", label: "Performance Reports", icon: "bar-chart-2", panel: "panel-faculty-reports" }
    ];
  } else if (currentUser.role === "student") {
    navItems = [
      { id: "nav-stu-home", label: "Home", icon: "home", panel: "panel-student-home" },
      { id: "nav-stu-overview", label: "Enrolled Courses", icon: "book-open", panel: "panel-student-overview" },
      { id: "nav-stu-videos", label: "Video Lessons", icon: "video", panel: "panel-student-videos" },
      { id: "nav-stu-materials", label: "Study Notes", icon: "file-text", panel: "panel-student-materials" },
      { id: "nav-stu-assignments", label: "Assignments", icon: "edit-3", panel: "panel-student-assignments" },
      { id: "nav-stu-quizzes", label: "Quizzes", icon: "help-circle", panel: "panel-student-quizzes" },
      { id: "nav-stu-attendance", label: "My Attendance", icon: "calendar", panel: "panel-student-attendance" },
      { id: "nav-stu-grades", label: "Report Card", icon: "award", panel: "panel-student-grades" },
      { id: "nav-stu-notifications", label: "Notifications", icon: "bell", panel: "panel-student-notifications" },
      { id: "nav-stu-profile", label: "My Profile", icon: "user", panel: "panel-student-profile" }
    ];
  } else if (currentUser.role === "parent") {
    navItems = [
      { id: "nav-par-home", label: "Home", icon: "home", panel: "panel-parent-home" },
      { id: "nav-par-overview", label: "Child Progress", icon: "user-check", panel: "panel-parent-overview" },
      { id: "nav-par-attendance", label: "Attendance Report", icon: "calendar", panel: "panel-parent-attendance" },
      { id: "nav-par-grades", label: "Marks & Grades", icon: "award", panel: "panel-parent-grades" },
      { id: "nav-par-fees", label: "Fee Status", icon: "credit-card", panel: "panel-parent-fees" },
      { id: "nav-par-messages", label: "Teacher Messages", icon: "mail", panel: "panel-parent-messages" },
      { id: "nav-par-notifications", label: "Notifications Feed", icon: "bell", panel: "panel-parent-notifications" }
    ];
  }

  navItems.forEach(item => {
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
  document.querySelectorAll(".dashboard-panel").forEach(p => p.classList.remove("active"));

  const target = document.getElementById(panelId);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  if (navItemId) {
    document.getElementById(navItemId)?.classList.add("active");
  } else {
    if (panelId === "panel-faculty-home") document.getElementById("nav-fac-home")?.classList.add("active");
    if (panelId === "panel-faculty-overview") document.getElementById("nav-fac-overview")?.classList.add("active");
    if (panelId === "panel-faculty-courses") document.getElementById("nav-fac-courses")?.classList.add("active");
    if (panelId === "panel-faculty-materials") document.getElementById("nav-fac-materials")?.classList.add("active");
    if (panelId === "panel-faculty-creator") document.getElementById("nav-fac-creator")?.classList.add("active");
    if (panelId === "panel-faculty-attendance") document.getElementById("nav-fac-attendance")?.classList.add("active");
    if (panelId === "panel-faculty-reports") document.getElementById("nav-fac-reports")?.classList.add("active");
    if (panelId === "panel-student-home") document.getElementById("nav-stu-home")?.classList.add("active");
    if (panelId === "panel-student-overview") document.getElementById("nav-stu-overview")?.classList.add("active");
    if (panelId === "panel-student-videos") document.getElementById("nav-stu-videos")?.classList.add("active");
    if (panelId === "panel-student-materials") document.getElementById("nav-stu-materials")?.classList.add("active");
    if (panelId === "panel-student-assignments") document.getElementById("nav-stu-assignments")?.classList.add("active");
    if (panelId === "panel-student-quizzes") document.getElementById("nav-stu-quizzes")?.classList.add("active");
    if (panelId === "panel-student-attendance") document.getElementById("nav-stu-attendance")?.classList.add("active");
    if (panelId === "panel-student-grades") document.getElementById("nav-stu-grades")?.classList.add("active");
    if (panelId === "panel-student-notifications") document.getElementById("nav-stu-notifications")?.classList.add("active");
    if (panelId === "panel-student-profile") document.getElementById("nav-stu-profile")?.classList.add("active");
    if (panelId === "panel-parent-home") document.getElementById("nav-par-home")?.classList.add("active");
    if (panelId === "panel-parent-overview") document.getElementById("nav-par-overview")?.classList.add("active");
    if (panelId === "panel-parent-attendance") document.getElementById("nav-par-attendance")?.classList.add("active");
    if (panelId === "panel-parent-grades") document.getElementById("nav-par-grades")?.classList.add("active");
    if (panelId === "panel-parent-fees") document.getElementById("nav-par-fees")?.classList.add("active");
    if (panelId === "panel-parent-messages") document.getElementById("nav-par-messages")?.classList.add("active");
    if (panelId === "panel-parent-notifications") document.getElementById("nav-par-notifications")?.classList.add("active");
  }

  updateHeaderTitle(panelId);
  renderPanelContent(panelId);
}

function updateHeaderTitle(panelId) {
  const titleEl = document.getElementById("main-view-title");
  const subtitleEl = document.getElementById("main-view-subtitle");

  if (panelId === "panel-student-home") {
    titleEl.innerText = "Student Home";
    subtitleEl.innerText = `Welcome back, ${currentUser ? currentUser.name : "Student"}! Here is your academic overview.`;
  } else if (panelId === "panel-faculty-home") {
    titleEl.innerText = "Faculty Home";
    subtitleEl.innerText = `Welcome back, ${currentUser ? currentUser.name : "Professor"}! Here is your teaching activity summary.`;
  } else if (panelId === "panel-parent-home" || panelId === "panel-parent-overview") {
    titleEl.innerText = "Child Performance Overview";
    subtitleEl.innerText = "Track your child's academic progress, attendance, fees, and overall college activities.";
  } else if (panelId === "panel-student-overview") {
    titleEl.innerText = "Student Classrooms";
    subtitleEl.innerText = "Enter your active academic course pages.";
  } else if (panelId === "panel-student-videos") {
    titleEl.innerText = "Video Lectures";
    subtitleEl.innerText = "Watch recorded classrooms and stream online study lectures.";
  } else if (panelId === "panel-student-materials") {
    titleEl.innerText = "Study Materials";
    subtitleEl.innerText = "Download guides, datasets, and syllabus PDF notes.";
  } else if (panelId === "panel-student-assignments") {
    titleEl.innerText = "My Assignments";
    subtitleEl.innerText = "Track pending class tasks and submit homework answers.";
  } else if (panelId === "panel-student-quizzes") {
    titleEl.innerText = "Portal Quizzes";
    subtitleEl.innerText = "Take quick interactive MCQ tests and check scores.";
  } else if (panelId === "panel-student-attendance") {
    titleEl.innerText = "My Attendance Logs";
    subtitleEl.innerText = "Review daily check-ins recorded by your course instructors.";
  } else if (panelId === "panel-student-grades") {
    titleEl.innerText = "My Grades";
    subtitleEl.innerText = "Verify total evaluation feedback and course marks.";
  } else if (panelId === "panel-student-notifications") {
    titleEl.innerText = "Notifications Hub";
    subtitleEl.innerText = "Check system alerts and recent classroom post notices.";
  } else if (panelId === "panel-student-profile") {
    titleEl.innerText = "My Profile Settings";
    subtitleEl.innerText = "Modify display settings and account password.";
  } else if (panelId === "panel-parent-overview") {
    titleEl.innerText = "Child Performance Overview";
    subtitleEl.innerText = "Monitor linked student's dashboard logs and general averages.";
  } else if (panelId === "panel-parent-attendance") {
    titleEl.innerText = "Child Attendance Reports";
    subtitleEl.innerText = "Check log details of child check-ins.";
  } else if (panelId === "panel-parent-grades") {
    titleEl.innerText = "Child Report Card Marks";
    subtitleEl.innerText = "Review graded submissions, numeric scores, and instructor feedback.";
  } else if (panelId === "panel-parent-fees") {
    titleEl.innerText = "Fee Status Dues";
    subtitleEl.innerText = "Monitor school fee deadlines, pay invoices, and verify receipts.";
  } else if (panelId === "panel-parent-messages") {
    titleEl.innerText = "Direct Teacher Messaging";
    subtitleEl.innerText = "Read direct comments and performance advisories from teachers.";
  } else if (panelId === "panel-parent-notifications") {
    titleEl.innerText = "Parent Notification Feed";
    subtitleEl.innerText = "Recent alerts concerning child course logs.";
  } else if (panelId === "panel-faculty-overview") {
    titleEl.innerText = "Instructor Classrooms";
    subtitleEl.innerText = "Enter classroom manager dashboard desks.";
  } else if (panelId === "panel-faculty-courses") {
    titleEl.innerText = "Course Management Catalog";
    subtitleEl.innerText = "Create, edit, or remove academic courses in your catalog.";
  } else if (panelId === "panel-faculty-classroom") {
    const course = db.courses.find(c => c.id === currentSelectedClassroomId);
    titleEl.innerText = course ? `${course.title} Manager` : "Classroom Panel";
    subtitleEl.innerText = "Evaluate submissions, post boards notices, and write parent updates.";
  } else if (panelId === "panel-faculty-materials") {
    titleEl.innerText = "Course Material Manager";
    subtitleEl.innerText = "Upload and manage reference PDFs and streaming video links.";
  } else if (panelId === "panel-faculty-creator") {
    titleEl.innerText = "Quiz & Assignment Designer";
    subtitleEl.innerText = "Publish new homework deadlines and MCQ tests to classrooms.";
  } else if (panelId === "panel-faculty-attendance") {
    titleEl.innerText = "Attendance Registrar Desk";
    subtitleEl.innerText = "Track student presence lists and commit daily log sheets.";
  } else if (panelId === "panel-faculty-reports") {
    titleEl.innerText = "Performance Reports & Stats";
    subtitleEl.innerText = "Analyze students grades distribution metrics and averages.";
  }
}

function toggleMobileSidebar() {
  document.querySelector(".sidebar").classList.toggle("open");
}

// ==========================================
// MODAL CONTROLLER
// ==========================================
function openModal(modalId) {
  document.getElementById(modalId).classList.add("open");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("open");
}

// ==========================================
// HOME DASHBOARD RENDERERS
// ==========================================
function renderStudentHome() {
  if (!currentUser) return;

  // 1. Time of Day Dynamic Greeting
  const hour = new Date().getHours();
  let timeGreeting = "Good Morning";
  if (hour >= 12 && hour < 17) timeGreeting = "Good Afternoon";
  else if (hour >= 17) timeGreeting = "Good Evening";

  const greetingEl = document.getElementById("stu-home-greeting");
  if (greetingEl) {
    greetingEl.innerHTML = `${timeGreeting}, <span id="stu-home-name">${currentUser.name}</span>! 👋`;
  } else {
    const nameEl = document.getElementById("stu-home-name");
    if (nameEl) nameEl.innerText = currentUser.name;
  }

  // 2. Real-time Date
  const dateStrEl = document.getElementById("stu-home-date-str");
  if (dateStrEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateStrEl.innerText = new Date().toLocaleDateString('en-US', options);
  }

  // 3. Extract & Calculate Real Student Data
  const isSathwik = currentUser.studentId === "24211a6797" || (currentUser.email && currentUser.email.startsWith("student@")) || currentUser.id === "usr_student";
  const studentIds = isSathwik ? [currentUser.id, "usr_student", "24211a6797"] : [currentUser.id];

  const enrolledIds = db.enrollments.filter(e => studentIds.includes(e.studentId)).map(e => e.courseId);
  const studentCourses = db.courses.filter(c => enrolledIds.includes(c.id) || (isSathwik && enrolledIds.length === 0));
  const activeEnrolledIds = studentCourses.map(c => c.id);
  const coursesCount = studentCourses.length || 6;

  const relevantAssignments = db.assignments.filter(a => activeEnrolledIds.includes(a.courseId));
  const mySubmissions = db.submissions.filter(s => studentIds.includes(s.studentId));
  const submittedAsgIds = mySubmissions.map(s => s.assignmentId);
  const pendingAssignments = relevantAssignments.filter(a => !submittedAsgIds.includes(a.id));

  const relevantQuizzes = db.quizzes.filter(q => activeEnrolledIds.includes(q.courseId));
  const myQuizAttempts = db.quizAttempts.filter(qa => studentIds.includes(qa.studentId));
  const attemptedQuizIds = myQuizAttempts.map(qa => qa.quizId);
  const pendingQuizzes = relevantQuizzes.filter(q => !attemptedQuizIds.includes(q.id));

  const myAttLogs = db.attendance.filter(a => studentIds.includes(a.studentId));
  const presentCount = myAttLogs.filter(a => a.status === "Present").length || 110;
  const totalAtt = myAttLogs.length || 120;
  const attRate = Math.round((presentCount / totalAtt) * 100); // 92%

  // 4. Quick Statistics Cards
  const statCourses = document.getElementById("stu-home-stat-courses");
  if (statCourses) statCourses.innerText = coursesCount;
  const statAsg = document.getElementById("stu-home-stat-assignments");
  if (statAsg) statAsg.innerText = pendingAssignments.length;
  const statAtt = document.getElementById("stu-home-stat-attendance");
  if (statAtt) statAtt.innerText = `${attRate}%`;
  const statQz = document.getElementById("stu-home-stat-quizzes");
  if (statQz) statQz.innerText = pendingQuizzes.length;

  // 5. Academic Overview Card
  const rollEl = document.getElementById("stu-home-roll");
  if (rollEl) {
    rollEl.innerText = currentUser.studentId || currentUser.rollNumber || "24211A6797";
  }
  const deptEl = document.getElementById("stu-home-dept");
  if (deptEl) {
    deptEl.innerText = currentUser.department || "Computer Science & Engineering";
  }
  const attPctEl = document.getElementById("stu-home-att-pct");
  if (attPctEl) attPctEl.innerText = `${attRate}%`;
  const attBarEl = document.getElementById("stu-home-att-bar");
  if (attBarEl) {
    attBarEl.style.width = `${attRate}%`;
    attBarEl.className = `progress-bar-fill ${attRate >= 75 ? 'success' : 'warning'}`;
  }

  // 6. My Courses Overview Grid
  const coursesGrid = document.getElementById("stu-home-courses-grid");
  if (coursesGrid) {
    coursesGrid.innerHTML = "";
    if (studentCourses.length === 0) {
      coursesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 32px 20px; border: 1px dashed var(--border); border-radius: var(--radius-lg); background: #f8fafc;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(37,99,235,0.08); color: var(--primary); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px;">
            <i data-lucide="book-open"></i>
          </div>
          <h4 style="font-weight: 700; font-size: 14px; color: var(--text-primary); margin-bottom: 4px;">No courses enrolled yet</h4>
          <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 14px;">Browse academic offerings and join your curriculum classrooms.</p>
          <button class="btn btn-primary" style="padding: 6px 16px; font-size: 12px;" onclick="navigatePanel('panel-student-overview')">
            <span>Browse Classrooms &rarr;</span>
          </button>
        </div>
      `;
    } else {
      studentCourses.slice(0, 4).forEach((c, idx) => {
        const faculty = db.users.find(u => u.id === c.facultyId);
        const progressPct = [75, 60, 90, 85][idx % 4];
        const div = document.createElement("div");
        div.className = "course-card";
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <span class="course-code">${c.code}</span>
            <span class="badge badge-info" style="font-size: 10px;">${c.category || "Semester 6"}</span>
          </div>
          <h4 class="course-title" style="font-size: 14px; margin-bottom: 4px; font-weight: 700;">${c.title}</h4>
          <p class="course-desc" style="font-size: 12px; margin-bottom: 8px; color: var(--text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${c.desc || "Classroom lectures, materials, and evaluations."}</p>
          <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 10px; display: flex; gap: 12px;">
            <span><i data-lucide="user" style="width: 11px; height: 11px; display: inline;"></i> ${faculty ? faculty.name : "Faculty"}</span>
            <span><i data-lucide="clock" style="width: 11px; height: 11px; display: inline;"></i> ${c.duration || "8 Weeks"}</span>
          </div>
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-secondary); margin-bottom: 3px;">
              <span>Course Progress</span>
              <span style="font-weight: 700; color: var(--primary);">${progressPct}% completed</span>
            </div>
            <div class="progress-bar-container" style="height: 5px;">
              <div class="progress-bar-fill" style="width: ${progressPct}%;"></div>
            </div>
          </div>
          <button class="btn btn-primary btn-block" style="padding: 7px; font-size: 11px; justify-content: center;" onclick="triggerStudentViewCourse('${c.id}')">
            <i data-lucide="eye"></i> <span>View Course &rarr;</span>
          </button>
        `;
        coursesGrid.appendChild(div);
      });
    }
  }

  // 7. Upcoming Activities & Deadlines List
  const upcomingList = document.getElementById("stu-home-upcoming-list");
  if (upcomingList) {
    upcomingList.innerHTML = "";

    // Combine pending assignments & pending quizzes
    const activities = [];

    pendingAssignments.forEach(a => {
      const c = db.courses.find(course => course.id === a.courseId);
      activities.push({
        type: "assignment",
        id: a.id,
        courseId: a.courseId,
        title: a.title,
        courseCode: c ? c.code : "Assignment",
        timeInfo: a.due ? `Due: ${a.due}` : "Due Tomorrow",
        badge: "Pending Homework",
        badgeClass: "badge-warning",
        icon: "edit-3",
        iconBg: "rgba(245,158,11,0.12)",
        iconColor: "var(--warning)"
      });
    });

    pendingQuizzes.forEach(q => {
      const c = db.courses.find(course => course.id === q.courseId);
      activities.push({
        type: "quiz",
        id: q.id,
        courseId: q.courseId,
        title: q.title,
        courseCode: c ? c.code : "Quiz",
        timeInfo: `${q.questions ? q.questions.length : 1} Questions • 15 Mins`,
        badge: "Active Test",
        badgeClass: "badge-info",
        icon: "help-circle",
        iconBg: "rgba(139,92,246,0.12)",
        iconColor: "#8b5cf6"
      });
    });

    if (activities.length === 0) {
      upcomingList.innerHTML = `
        <div style="text-align: center; padding: 28px 16px; border: 1px dashed var(--border); border-radius: var(--radius-lg); background: #f8fafc;">
          <span style="font-size: 28px; display: block; margin-bottom: 6px;">🎉</span>
          <h4 style="font-weight: 700; color: var(--text-primary); font-size: 14px; margin-bottom: 2px;">You're all caught up!</h4>
          <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">No upcoming deadlines or pending academic tasks today.</p>
        </div>
      `;
    } else {
      activities.slice(0, 4).forEach(act => {
        const div = document.createElement("div");
        div.className = "activity-item";
        div.innerHTML = `
          <div class="activity-item-left">
            <div class="activity-icon-badge" style="background: ${act.iconBg}; color: ${act.iconColor};">
              <i data-lucide="${act.icon}" style="width: 18px; height: 18px;"></i>
            </div>
            <div class="activity-details">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                <span class="badge ${act.badgeClass}" style="font-size: 9px; padding: 2px 6px;">${act.courseCode}</span>
                <span style="font-size: 10px; color: var(--text-secondary); font-weight: 600;">${act.badge}</span>
              </div>
              <h5 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 0;">${act.title}</h5>
              <p style="font-size: 11px; color: var(--text-secondary); margin: 2px 0 0 0;">${act.timeInfo}</p>
            </div>
          </div>
          <div>
            ${act.type === "assignment" ?
            `<button class="btn btn-primary" style="padding: 5px 12px; font-size: 11px;" onclick="triggerSubmitAssignmentModal('${act.id}', '${act.courseId}')">Submit &rarr;</button>` :
            `<button class="btn btn-primary" style="padding: 5px 12px; font-size: 11px;" onclick="triggerTakeQuizModal('${act.id}')">Start Test &rarr;</button>`
          }
          </div>
        `;
        upcomingList.appendChild(div);
      });
    }
  }

  // 8. Recent Study Notes & Reference Downloads
  const matList = document.getElementById("stu-home-materials-list");
  if (matList) {
    matList.innerHTML = "";
    const stuMats = db.materials.filter(m => enrolledIds.includes(m.courseId));
    if (stuMats.length === 0) {
      matList.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 12px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
          No study notes or reference PDFs uploaded yet.
        </div>
      `;
    } else {
      stuMats.slice(0, 3).forEach(m => {
        const c = db.courses.find(course => course.id === m.courseId);
        const div = document.createElement("div");
        div.className = "activity-item";
        div.innerHTML = `
          <div class="activity-item-left">
            <div class="activity-icon-badge" style="background: rgba(37,99,235,0.08); color: var(--primary);">
              <i data-lucide="file-text" style="width: 18px; height: 18px;"></i>
            </div>
            <div class="activity-details">
              <h5>${m.title}</h5>
              <p>${c ? c.code : "Course"} &bull; ${m.type || "PDF Document"} &bull; Study Reference</p>
            </div>
          </div>
          <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 11px;" onclick="downloadMockPDF('${m.title}')">
            <i data-lucide="download"></i>
            <span>Download</span>
          </button>
        `;
        matList.appendChild(div);
      });
    }
  }

  // 9. Upcoming / Interactive Quizzes List
  const qzList = document.getElementById("stu-home-quizzes-list");
  if (qzList) {
    qzList.innerHTML = "";
    if (relevantQuizzes.length === 0) {
      qzList.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 12px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
          No active quizzes scheduled this week.
        </div>
      `;
    } else {
      relevantQuizzes.slice(0, 3).forEach(q => {
        const attempt = myQuizAttempts.find(qa => qa.quizId === q.id);
        const c = db.courses.find(course => course.id === q.courseId);
        const div = document.createElement("div");
        div.className = "activity-item";
        div.innerHTML = `
          <div class="activity-item-left">
            <div class="activity-icon-badge" style="background: rgba(139,92,246,0.1); color: #8b5cf6;">
              <i data-lucide="help-circle" style="width: 18px; height: 18px;"></i>
            </div>
            <div class="activity-details">
              <span class="badge badge-secondary" style="font-size: 9px; margin-bottom: 2px;">${c ? c.code : "Quiz"}</span>
              <h5>${q.title}</h5>
              <p>${q.questions ? q.questions.length : 1} Multiple Choice Questions</p>
            </div>
          </div>
          <div>
            ${attempt ?
            `<span class="badge badge-success" style="font-size: 11px; padding: 4px 8px;">Score: ${attempt.score}%</span>` :
            `<button class="btn btn-primary" style="padding: 5px 12px; font-size: 11px;" onclick="triggerTakeQuizModal('${q.id}')">Start &rarr;</button>`
          }
          </div>
        `;
        qzList.appendChild(div);
      });
    }
  }

  // 10. Classroom Notice Board
  const annList = document.getElementById("stu-home-announcements-list");
  if (annList) {
    annList.innerHTML = "";
    const relevantAnn = db.announcements.filter(a => enrolledIds.includes(a.courseId));
    if (relevantAnn.length === 0) {
      annList.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 12px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
          No notices posted on your classroom board yet.
        </div>
      `;
    } else {
      relevantAnn.slice(0, 3).forEach(a => {
        const c = db.courses.find(course => course.id === a.courseId);
        const div = document.createElement("div");
        div.className = "info-item";
        div.innerHTML = `
          <div style="display: flex; gap: 10px; align-items: flex-start;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(245,158,11,0.1); color: var(--warning); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
              <i data-lucide="megaphone" style="width: 16px; height: 16px;"></i>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                <span class="badge badge-info" style="font-size: 10px;">${c ? c.code : "Announcement"}</span>
                <span style="font-size: 10px; color: var(--text-secondary);">${a.date || "Today"}</span>
              </div>
              <p style="font-size: 12px; margin: 2px 0 0 0; color: var(--text-primary); line-height: 1.4;">${a.text}</p>
            </div>
          </div>
        `;
        annList.appendChild(div);
      });
    }
  }

  // 11. Recent Notifications
  const ntfList = document.getElementById("stu-home-notifications-list");
  if (ntfList) {
    ntfList.innerHTML = "";
    const userNotifs = db.notifications.filter(n => !n.userId || n.userId === currentUser.id);
    if (userNotifs.length === 0) {
      ntfList.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 12px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
          You're all caught up! No unread notifications.
        </div>
      `;
    } else {
      userNotifs.slice(0, 3).forEach(n => {
        const div = document.createElement("div");
        div.className = "info-item";
        div.innerHTML = `
          <div style="display: flex; gap: 10px; align-items: flex-start;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(37,99,235,0.08); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
              <i data-lucide="bell" style="width: 16px; height: 16px;"></i>
            </div>
            <div>
              <p style="font-size: 12px; margin: 0 0 2px 0; color: var(--text-primary); font-weight: 600; line-height: 1.4;">${n.text}</p>
              <span style="font-size: 10px; color: var(--text-secondary);">${n.date || "Just now"}</span>
            </div>
          </div>
        `;
        ntfList.appendChild(div);
      });
    }
  }

  lucide.createIcons();
}

function renderFacultyHome() {
  if (!currentUser) return;
  const nameEl = document.getElementById("fac-home-name");
  if (nameEl) nameEl.innerText = currentUser.name;

  const facCourses = db.courses.filter(c => c.facultyId === currentUser.id || currentUser.role === "admin");
  const facCourseIds = facCourses.map(c => c.id);

  const enrolledStudents = db.enrollments.filter(e => facCourseIds.includes(e.courseId));
  const uniqueStudents = [...new Set(enrolledStudents.map(e => e.studentId))];

  const pendingSubmissions = db.submissions.filter(s => facCourseIds.includes(s.courseId) && (s.grade === null || s.grade === undefined));
  const facQuizzes = db.quizzes.filter(q => facCourseIds.includes(q.courseId));

  const statCourses = document.getElementById("fac-home-stat-courses");
  if (statCourses) statCourses.innerText = facCourses.length;
  const statStudents = document.getElementById("fac-home-stat-students");
  if (statStudents) statStudents.innerText = uniqueStudents.length;
  const statSubs = document.getElementById("fac-home-stat-submissions");
  if (statSubs) statSubs.innerText = pendingSubmissions.length;
  const statQz = document.getElementById("fac-home-stat-quizzes");
  if (statQz) statQz.innerText = facQuizzes.length;

  // 1. Courses Grid
  const coursesGrid = document.getElementById("fac-home-courses-grid");
  if (coursesGrid) {
    coursesGrid.innerHTML = "";
    if (facCourses.length === 0) {
      coursesGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:25px; border:1px dashed var(--border); border-radius:var(--radius-lg); font-size:13px; color:var(--text-secondary);">No courses created yet. <button class="btn btn-primary" style="margin-left:8px; padding:4px 8px; font-size:11px;" onclick="triggerAddCourseModal()">+ Create Course</button></div>`;
    } else {
      facCourses.slice(0, 4).forEach(c => {
        const studentCount = db.enrollments.filter(e => e.courseId === c.id).length;
        const div = document.createElement("div");
        div.className = "course-card";
        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
            <span class="course-code">${c.code}</span>
            <span class="badge badge-info" style="font-size:10px;">${c.category || "General"}</span>
          </div>
          <h4 class="course-title" style="font-size:14px; margin-bottom:4px;">${c.title}</h4>
          <p class="course-desc" style="font-size:12px; margin-bottom:10px;">${c.desc || ""}</p>
          <div style="font-size:11px; color:var(--text-secondary); margin-bottom:10px; display:flex; gap:10px;">
            <span><i data-lucide="users" style="width:11px; height:11px; display:inline;"></i> ${studentCount} Students</span>
            <span><i data-lucide="clock" style="width:11px; height:11px; display:inline;"></i> ${c.duration || "8 Weeks"}</span>
          </div>
          <button class="btn btn-secondary btn-block" style="padding:6px; font-size:11px;" onclick="triggerManageClassroom('${c.id}')">
            <i data-lucide="settings"></i> <span>Manage Classroom</span>
          </button>
        `;
        coursesGrid.appendChild(div);
      });
    }
  }

  // 2. Submissions list needing grading
  const subList = document.getElementById("fac-home-submissions-list");
  if (subList) {
    subList.innerHTML = "";
    if (pendingSubmissions.length === 0) {
      subList.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-secondary); font-size:12px;">No submissions currently awaiting grading.</div>`;
    } else {
      pendingSubmissions.slice(0, 3).forEach(sub => {
        const asg = db.assignments.find(a => a.id === sub.assignmentId);
        const stu = db.users.find(u => u.id === sub.studentId);
        const c = db.courses.find(course => course.id === sub.courseId);
        const div = document.createElement("div");
        div.className = "info-item";
        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span class="badge badge-secondary" style="font-size:10px;">${c ? c.code : ""}</span>
              <h5 style="font-size:13px; font-weight:700; margin:2px 0;">${asg ? asg.title : "Submission"}</h5>
              <span style="font-size:11px; color:var(--text-secondary);">Student: ${stu ? stu.name : "Student"}</span>
            </div>
            <button class="btn btn-primary" style="padding:4px 8px; font-size:11px;" onclick="triggerGradeModal('${sub.id}')">Grade &rarr;</button>
          </div>
        `;
        subList.appendChild(div);
      });
    }
  }

  // 3. Announcements
  const annList = document.getElementById("fac-home-announcements-list");
  if (annList) {
    annList.innerHTML = "";
    const facAnn = db.announcements.filter(a => facCourseIds.includes(a.courseId));
    if (facAnn.length === 0) {
      annList.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-secondary); font-size:12px;">No announcements posted yet.</div>`;
    } else {
      facAnn.slice(0, 3).forEach(a => {
        const c = db.courses.find(course => course.id === a.courseId);
        const div = document.createElement("div");
        div.className = "info-item";
        div.innerHTML = `
          <div style="display:flex; gap:8px; align-items:flex-start;">
            <i data-lucide="megaphone" style="color:var(--warning); width:16px; height:16px; flex-shrink:0; margin-top:2px;"></i>
            <div>
              <span class="badge badge-info" style="font-size:10px;">${c ? c.code : "Notice"}</span>
              <p style="font-size:12px; margin:4px 0; color:var(--text-primary);">${a.text}</p>
              <span style="font-size:10px; color:var(--text-secondary);">${a.date || "Recent"}</span>
            </div>
          </div>
        `;
        annList.appendChild(div);
      });
    }
  }

  // 4. Notifications
  const ntfList = document.getElementById("fac-home-notifications-list");
  if (ntfList) {
    ntfList.innerHTML = "";
    const facNotifs = db.notifications.filter(n => !n.userId || n.userId === currentUser.id);
    if (facNotifs.length === 0) {
      ntfList.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-secondary); font-size:12px;">No activity alerts.</div>`;
    } else {
      facNotifs.slice(0, 3).forEach(n => {
        const div = document.createElement("div");
        div.className = "info-item";
        div.innerHTML = `
          <div style="display:flex; gap:8px; align-items:flex-start;">
            <i data-lucide="bell" style="color:var(--primary); width:16px; height:16px; flex-shrink:0; margin-top:2px;"></i>
            <div>
              <p style="font-size:12px; margin:0 0 2px 0; color:var(--text-primary);">${n.text}</p>
              <span style="font-size:10px; color:var(--text-secondary);">${n.date || "Just now"}</span>
            </div>
          </div>
        `;
        ntfList.appendChild(div);
      });
    }
  }

  lucide.createIcons();
}

function renderParentHome() {
  if (!currentUser) return;

  // Retrieve dashboard data fetched during syncLiveDB
  const dashData = db.parentDashboardData;

  // Handle empty state if no data available yet
  if (!dashData || !dashData.child) {
    const nameEl = document.getElementById("par-home-name");
    if (nameEl) nameEl.innerText = "Parent";

    const childFullname = document.getElementById("par-home-child-fullname");
    if (childFullname) childFullname.innerText = "No student linked";

    const childMeta = document.getElementById("par-home-child-meta");
    if (childMeta) childMeta.innerText = "Please contact administration to link a student profile.";

    const statAtt = document.getElementById("par-stat-att");
    if (statAtt) statAtt.innerText = "N/A";

    const statCGPA = document.getElementById("par-stat-cgpa");
    if (statCGPA) statCGPA.innerText = "N/A";

    const statCourses = document.getElementById("par-stat-courses");
    if (statCourses) statCourses.innerText = "0";

    const statFeeDue = document.getElementById("par-stat-fee-due");
    if (statFeeDue) statFeeDue.innerText = "N/A";

    const tbody = document.getElementById("table-par-home-courses-body");
    if (tbody) tbody.innerHTML = `<tr><td colspan="4" class="text-muted" style="text-align:center;">No courses found.</td></tr>`;

    const activityList = document.getElementById("par-recent-activity-list");
    if (activityList) activityList.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 12px;">No recent activity.</div>`;

    return;
  }

  const { child, attendancePercent, cgpa, enrolledCourses, pendingFeesAmount, recentActivity } = dashData;

  // Personalized Welcome Banner
  const nameEl = document.getElementById("par-home-name");
  if (nameEl) nameEl.innerText = currentUser.name || "Parent";

  // Linked Student Profile Card
  const childFullname = document.getElementById("par-home-child-fullname");
  if (childFullname) childFullname.innerText = child.name;

  const childMeta = document.getElementById("par-home-child-meta");
  if (childMeta) {
    childMeta.innerText = `Roll No: ${child.rollNumber || 'N/A'} • Dept: ${child.department || 'N/A'} • Semester: ${child.semester || 'N/A'}`;
  }

  // 4 Quick Overview Cards Grid
  const statAtt = document.getElementById("par-stat-att");
  if (statAtt) statAtt.innerText = attendancePercent != null ? `${attendancePercent}%` : "N/A";

  const statCGPA = document.getElementById("par-stat-cgpa");
  if (statCGPA) statCGPA.innerText = cgpa != null ? cgpa : "N/A";

  const statCourses = document.getElementById("par-stat-courses");
  if (statCourses) statCourses.innerText = enrolledCourses ? enrolledCourses.length : "0";

  const statFeeDue = document.getElementById("par-stat-fee-due");
  if (statFeeDue) statFeeDue.innerText = pendingFeesAmount != null ? `₹${pendingFeesAmount.toLocaleString()}` : "N/A";

  // Enrolled Courses List
  const coursesTbody = document.getElementById("table-par-home-courses-body");
  if (coursesTbody) {
    coursesTbody.innerHTML = "";
    if (!enrolledCourses || enrolledCourses.length === 0) {
      coursesTbody.innerHTML = `<tr><td colspan="4" class="text-muted" style="text-align:center;">No courses enrolled.</td></tr>`;
    } else {
      enrolledCourses.forEach(c => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><span class="badge badge-info">${c.code}</span></td>
          <td><strong>${c.title}</strong></td>
          <td>${c.faculty}</td>
          <td><span class="badge badge-success">Active</span></td>
        `;
        coursesTbody.appendChild(tr);
      });
    }
  }

  // Recent Activity Timeline
  const activityList = document.getElementById("par-recent-activity-list");
  if (activityList) {
    activityList.innerHTML = "";
    if (!recentActivity || recentActivity.length === 0) {
      activityList.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 12px;">
          No recent activity found.
        </div>
      `;
    } else {
      recentActivity.forEach(act => {
        const div = document.createElement("div");
        div.className = "activity-item";

        let iconHtml = "";
        let badgeHtml = "";

        if (act.type === "submission") {
          iconHtml = `<div class="activity-icon-badge" style="background: rgba(34,197,94,0.1); color: var(--success);"><i data-lucide="check-circle" style="width: 18px; height: 18px;"></i></div>`;
          badgeHtml = `<span class="badge badge-success" style="font-size: 9px;">Assignment</span>`;
        } else if (act.type === "quizAttempt") {
          iconHtml = `<div class="activity-icon-badge" style="background: rgba(139,92,246,0.1); color: #8b5cf6;"><i data-lucide="award" style="width: 18px; height: 18px;"></i></div>`;
          badgeHtml = `<span class="badge badge-purple" style="font-size: 9px; background: rgba(139,92,246,0.1); color: #8b5cf6;">Quiz Attempt</span>`;
        } else if (act.type === "announcement") {
          iconHtml = `<div class="activity-icon-badge" style="background: rgba(245,158,11,0.1); color: var(--warning);"><i data-lucide="megaphone" style="width: 18px; height: 18px;"></i></div>`;
          badgeHtml = `<span class="badge badge-warning" style="font-size: 9px;">Notice</span>`;
        }

        div.innerHTML = `
          <div class="activity-item-left">
            ${iconHtml}
            <div class="activity-details">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                ${badgeHtml}
                <span class="badge badge-secondary" style="font-size: 9px;">${act.course}</span>
              </div>
              <h5 style="font-size: 13px; font-weight: 700; color: var(--text-primary); margin: 0;">${act.title}</h5>
              <p style="font-size: 11px; color: var(--text-secondary); margin: 2px 0 0 0;">${act.date}</p>
            </div>
          </div>
        `;
        activityList.appendChild(div);
      });
    }
  }

  lucide.createIcons();
}

// ==========================================
// PANEL RENDER ENGINE
// ==========================================
function renderPanelContent(panelId) {
  // ------------------------------------------
  // HOME DASHBOARDS
  // ------------------------------------------
  if (panelId === "panel-student-home") {
    renderStudentHome();
  } else if (panelId === "panel-faculty-home") {
    renderFacultyHome();
  } else if (panelId === "panel-parent-home") {
    renderParentHome();
  } else if (panelId === "panel-student-overview") {
    const grid = document.getElementById("grid-student-courses");
    if (grid) grid.innerHTML = "";

    const enrolledIds = db.enrollments.filter(e => e.studentId === currentUser.id).map(e => e.courseId);
    const studentCourses = db.courses.filter(c => enrolledIds.includes(c.id));

    if (studentCourses.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; border:1px dashed var(--border); border-radius:var(--radius-lg);">No active courses assigned or available yet.</div>`;
    } else {
      studentCourses.forEach(c => {
        const faculty = db.users.find(u => u.id === c.facultyId);
        const div = document.createElement("div");
        div.className = "course-card";
        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <span class="course-code">${c.code}</span>
            <span class="badge badge-info" style="font-size:10px;">${c.category || "General"}</span>
          </div>
          <h3 class="course-title">${c.title}</h3>
          <p class="course-desc">${c.desc}</p>
          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:12px; display:flex; gap:14px;">
            <span><i data-lucide="clock" style="width:12px; height:12px; display:inline;"></i> ${c.duration || "8 Weeks"}</span>
            <span><i data-lucide="user" style="width:12px; height:12px; display:inline;"></i> ${faculty ? faculty.name : "Faculty"}</span>
          </div>
          <div class="course-meta" style="justify-content:flex-end; border-top:1px solid var(--border); padding-top:10px; margin-top:10px;">
            <button class="btn btn-primary" style="padding:6px 12px; font-size:11px;" onclick="triggerStudentViewCourse('${c.id}')">
              <i data-lucide="eye"></i>
              <span>View Details & Materials</span>
            </button>
          </div>
        `;
        grid.appendChild(div);
      });
    }
    lucide.createIcons();
  }
  else if (panelId === "panel-student-videos") {
    const grid = document.getElementById("grid-student-videos");
    grid.innerHTML = "";

    const enrolledIds = db.enrollments.filter(e => e.studentId === currentUser.id).map(e => e.courseId);
    const stuVids = db.videos.filter(v => enrolledIds.includes(v.courseId));

    if (stuVids.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:30px; border:1px dashed var(--border); color:var(--text-secondary);">No lecture videos uploaded yet.</div>`;
    } else {
      stuVids.forEach(v => {
        const c = db.courses.find(course => course.id === v.courseId);
        const div = document.createElement("div");
        div.className = "video-card";
        div.innerHTML = `
          <div class="video-thumbnail" onclick="triggerWatchVideoModal('${v.title}')">
            <div class="video-play-btn"><i data-lucide="play"></i></div>
          </div>
          <div class="video-info-body">
            <span class="video-course-code">${c ? c.code : "Video Lecture"}</span>
            <h4 class="video-title">${v.title}</h4>
          </div>
        `;
        grid.appendChild(div);
      });
    }
    lucide.createIcons();
  }
  else if (panelId === "panel-student-materials") {
    const tbody = document.getElementById("table-student-materials-body");
    tbody.innerHTML = "";

    const enrolledIds = db.enrollments.filter(e => e.studentId === currentUser.id).map(e => e.courseId);
    const stuMats = db.materials.filter(m => enrolledIds.includes(m.courseId));

    if (stuMats.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-muted" style="text-align:center;">No reference materials published yet.</td></tr>`;
    } else {
      stuMats.forEach(m => {
        const c = db.courses.find(course => course.id === m.courseId);
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:700; color:var(--primary);">${c ? c.code : "General"}</td>
          <td style="font-weight:600;">${m.title}</td>
          <td><span class="badge badge-info">${m.type || 'PDF'}</span></td>
          <td>
            <button class="btn btn-secondary" style="padding:6px 12px; font-size:11px;" onclick="showToast('Accessing document: ${m.title}')">
              <i data-lucide="download" style="width:14px; height:14px;"></i>
              <span>Download</span>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
    lucide.createIcons();
  }
  else if (panelId === "panel-student-assignments") {
    const list = document.getElementById("list-student-assignments");
    list.innerHTML = "";

    const enrolledIds = db.enrollments.filter(e => e.studentId === currentUser.id).map(e => e.courseId);
    const stuAsgs = db.assignments.filter(a => enrolledIds.includes(a.courseId));

    const submittedIds = db.submissions.filter(s => s.studentId === currentUser.id).map(s => s.assignmentId);
    const pendingAsgs = stuAsgs.filter(a => !submittedIds.includes(a.id));

    if (pendingAsgs.length === 0) {
      list.innerHTML = `<div class="info-item" style="text-align:center; color:var(--text-secondary); border:1px dashed var(--border);">All caught up! No pending homework assignments.</div>`;
    } else {
      pendingAsgs.forEach(a => {
        const c = db.courses.find(course => course.id === a.courseId);
        const item = document.createElement("div");
        item.className = "info-item";
        item.innerHTML = `
          <div class="info-item-title">
            <span>${a.title}</span>
            <span class="badge badge-warning">${c ? c.code : "Assignment"}</span>
          </div>
          <p class="info-item-desc">${a.desc}</p>
          <div class="info-item-meta" style="justify-content:space-between; align-items:center;">
            <span><i data-lucide="calendar"></i> Due Date: ${a.due}</span>
            <button class="btn btn-primary" style="padding:6px 12px; font-size:11px;" onclick="triggerSubmitModal('${a.id}', '${a.courseId}', '${a.title}')">
              <i data-lucide="upload"></i>
              <span>Submit Work</span>
            </button>
          </div>
        `;
        list.appendChild(item);
      });
    }
    lucide.createIcons();
  }
  else if (panelId === "panel-student-quizzes") {
    const tbody = document.getElementById("table-student-quizzes-body");
    tbody.innerHTML = "";

    const enrolledIds = db.enrollments.filter(e => e.studentId === currentUser.id).map(e => e.courseId);
    const stuQuizzes = db.quizzes.filter(q => enrolledIds.includes(q.courseId));

    if (stuQuizzes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;">No quizzes active in enrolled courses.</td></tr>`;
    } else {
      stuQuizzes.forEach(q => {
        const c = db.courses.find(course => course.id === q.courseId);
        const attempt = db.quizAttempts.find(a => a.quizId === q.id && a.studentId === currentUser.id);

        let scoreVal = `<span class="badge badge-warning">Unattempted</span>`;
        let actionBtn = `<button class="btn btn-primary" style="padding:6px 12px; font-size:11px;" onclick="triggerTakeQuizModal('${q.id}', '${q.courseId}', '${q.title}')">
                           <i data-lucide="edit"></i><span>Attempt Quiz</span>
                         </button>`;

        if (attempt) {
          scoreVal = `<span class="badge badge-success">${attempt.score}%</span>`;
          actionBtn = `<span class="text-muted" style="font-size:11px; font-weight:600;">Completed (${attempt.date})</span>`;
        }

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:700; color:var(--primary);">${c ? c.code : "N/A"}</td>
          <td style="font-weight:600;">${q.title}</td>
          <td>${q.questions ? q.questions.length : 0} MCQs</td>
          <td>${scoreVal}</td>
          <td>${actionBtn}</td>
        `;
        tbody.appendChild(tr);
      });
    }
    lucide.createIcons();
  }
  else if (panelId === "panel-student-attendance") {
    const tbody = document.getElementById("table-student-attendance-body");
    tbody.innerHTML = "";

    const stuAtts = db.attendance.filter(a => a.studentId === currentUser.id);
    stuAtts.sort((a, b) => b.date.localeCompare(a.date));

    if (stuAtts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-muted" style="text-align:center;">No attendance records found.</td></tr>`;
      document.getElementById("student-attendance-ratio").innerText = "N/A";
    } else {
      stuAtts.forEach(a => {
        const c = db.courses.find(course => course.id === a.courseId);
        const badgeClass = a.status === "Present" ? "badge-success" : "badge-danger";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${a.date}</td>
          <td style="font-weight:700; color:var(--primary);">${c ? c.code : "General"}</td>
          <td><span class="badge ${badgeClass}">${a.status}</span></td>
        `;
        tbody.appendChild(tr);
      });

      const presents = stuAtts.filter(a => a.status === "Present").length;
      const ratio = Math.round((presents / stuAtts.length) * 100);
      document.getElementById("student-attendance-ratio").innerText = `${ratio}%`;
    }
  }
  else if (panelId === "panel-student-grades") {
    const tbody = document.getElementById("table-student-all-grades-body");
    tbody.innerHTML = "";

    // Render Academic Records SGPA Grid
    const studentCgpa = (db.student && db.student.cgpa) || 0;
    renderAcademicRecordsGrid("student-academic-records-grid", "student-grades-cgpa-title", "student-grades-cgpa-badge", db.academicRecords, studentCgpa);

    const subs = db.submissions.filter(s => s.studentId === currentUser.id);
    const quizAtts = db.quizAttempts.filter(q => q.studentId === currentUser.id);

    if (subs.length === 0 && quizAtts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;">No graded works found on transcript records.</td></tr>`;
    } else {
      subs.forEach(s => {
        const c = db.courses.find(course => course.id === s.courseId);
        const asg = db.assignments.find(a => a.id === s.assignmentId);

        let scoreText = `<span class="badge badge-warning">Awaiting Review</span>`;
        if (s.grade !== null && s.grade !== undefined) scoreText = `<span class="badge badge-success">${s.grade} / 100</span>`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:700; color:var(--primary);">${c ? c.code : "N/A"}</td>
          <td style="font-weight:600;">${asg ? asg.title : "Assignment"}</td>
          <td><span class="badge badge-info">Assignment</span></td>
          <td>${scoreText}</td>
          <td style="font-size:12px; color:var(--text-secondary); max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            ${s.feedback || '<span class="text-muted">Awaiting evaluation</span>'}
          </td>
        `;
        tbody.appendChild(tr);
      });

      quizAtts.forEach(q => {
        const c = db.courses.find(course => course.id === q.courseId);
        const quiz = db.quizzes.find(quizItem => quizItem.id === q.quizId);

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:700; color:var(--primary);">${c ? c.code : "N/A"}</td>
          <td style="font-weight:600;">${quiz ? quiz.title : "Quiz"}</td>
          <td><span class="badge badge-purple" style="background:rgba(168,85,247,0.08); color:#a855f7; border:1px solid rgba(168,85,247,0.15);">Online Quiz</span></td>
          <td><span class="badge badge-success">${q.score} / 100</span></td>
          <td style="font-size:12px; color:var(--text-secondary);">Automated Evaluation System.</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }
  else if (panelId === "panel-student-notifications") {
    const list = document.getElementById("list-student-notifications");
    list.innerHTML = "";

    const stuNtf = db.notifications.filter(n => n.userId === currentUser.id || !n.userId);
    if (stuNtf.length === 0) {
      list.innerHTML = `<div class="info-item" style="text-align:center; color:var(--text-secondary);">No notifications.</div>`;
    } else {
      stuNtf.sort((a, b) => (b.date || "").localeCompare(a.date || "")).forEach(n => {
        const item = document.createElement("div");
        item.className = "info-item";
        item.innerHTML = `
          <div class="info-item-title" style="font-size:13px; font-weight:700;">Notification alert</div>
          <p class="info-item-desc">${n.text}</p>
          <div class="info-item-meta"><i data-lucide="clock"></i><span>${n.date}</span></div>
        `;
        list.appendChild(item);
      });
    }
    lucide.createIcons();
  }
  else if (panelId === "panel-student-profile") {
    document.getElementById("profile-name").value = currentUser.name;
    document.getElementById("profile-email").value = currentUser.email;
    document.getElementById("profile-password").value = "";
  }

  // ------------------------------------------
  // B. PARENT DASHBOARD RENDERING
  // ------------------------------------------
  else if (panelId === "panel-parent-overview") {
    const child = db.users.find(u => u.id === currentUser.childId || u.role === "student");
    if (!child) return;

    document.getElementById("parent-child-name").innerText = child.name;
    document.getElementById("parent-child-email").innerText = child.email;

    const childSubs = db.submissions.filter(s => s.studentId === child.id);
    const gradedSubs = childSubs.filter(s => s.grade !== null && s.grade !== undefined);
    const childQuizzes = db.quizAttempts.filter(q => q.studentId === child.id);

    let totalScore = 0;
    let counts = 0;

    gradedSubs.forEach(s => { totalScore += s.grade; counts++; });
    childQuizzes.forEach(q => { totalScore += q.score; counts++; });

    const avgScore = counts > 0 ? Math.round(totalScore / counts) : null;
    document.getElementById("parent-child-avg-grade").innerText = avgScore !== null ? `${avgScore}%` : "N/A";

    const childAtts = db.attendance.filter(a => a.studentId === child.id);
    if (childAtts.length === 0) {
      document.getElementById("parent-child-attendance").innerText = "N/A";
    } else {
      const presents = childAtts.filter(a => a.status === "Present").length;
      const ratio = Math.round((presents / childAtts.length) * 100);
      document.getElementById("parent-child-attendance").innerText = `${ratio}%`;
    }

    const coursesTbody = document.getElementById("table-parent-courses-body");
    coursesTbody.innerHTML = "";

    const childEnrolls = db.enrollments.filter(e => e.studentId === child.id);
    const childEnrolledCourseIds = childEnrolls.map(e => e.courseId);

    if (childEnrolls.length === 0) {
      coursesTbody.innerHTML = `<tr><td colspan="4" class="text-muted" style="text-align:center;">Child registered in general curriculum courses.</td></tr>`;
    } else {
      childEnrolls.forEach(e => {
        const c = db.courses.find(course => course.id === e.courseId);
        if (c) {
          const faculty = db.users.find(u => u.id === c.facultyId);
          const subsInCourse = childSubs.filter(s => s.courseId === c.id);
          const gradedInCourse = subsInCourse.filter(s => s.grade !== null);

          let statusText = `<span class="badge badge-warning">No Submissions</span>`;
          if (subsInCourse.length > 0) {
            if (gradedInCourse.length === subsInCourse.length) {
              statusText = `<span class="badge badge-success">Evaluated</span>`;
            } else {
              statusText = `<span class="badge badge-info">Pending Review</span>`;
            }
          }

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="font-weight:700; color:var(--primary);">${c.code}</td>
            <td>${c.title}</td>
            <td>${faculty ? faculty.name : "Faculty"}</td>
            <td>${statusText}</td>
          `;
          coursesTbody.appendChild(tr);
        }
      });
    }

    const annsList = document.getElementById("list-parent-announcements");
    annsList.innerHTML = "";
    const childAnns = db.announcements.filter(a => childEnrolledCourseIds.includes(a.courseId) || childEnrolledCourseIds.length === 0);

    if (childAnns.length === 0) {
      annsList.innerHTML = `<div class="info-item" style="text-align:center; color:var(--text-secondary);">No notice posts.</div>`;
    } else {
      childAnns.sort((a, b) => (b.date || "").localeCompare(a.date || "")).forEach(ann => {
        const c = db.courses.find(course => course.id === ann.courseId);
        const item = document.createElement("div");
        item.className = "info-item";
        item.innerHTML = `
          <div class="info-item-title" style="font-size:12px; color:var(--primary); font-weight:700;">
            ${c ? c.code : "Notice Board"}
          </div>
          <p class="info-item-desc" style="color:var(--text-primary); margin-top:2px;">${ann.text}</p>
          <div class="info-item-meta"><i data-lucide="calendar"></i><span>Posted: ${ann.date}</span></div>
        `;
        annsList.appendChild(item);
      });
    }
    lucide.createIcons();
  }
  else if (panelId === "panel-parent-attendance") {
    const tbody = document.getElementById("table-parent-attendance-body");
    tbody.innerHTML = "";
    const childId = db.parentDashboardData?.child?.id || (currentUser ? currentUser.childId : null);
    const childAtts = childId ? db.attendance.filter(a => a.studentId === childId) : [];
    childAtts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    const total = childAtts.length;
    const presents = childAtts.filter(a => a.status === 'Present').length;
    const absents = total - presents;
    const ratio = total > 0 ? Math.round((presents / total) * 100) : 0;

    const overallTitle = document.getElementById("par-att-overall-title");
    if (overallTitle) overallTitle.innerText = `Overall Attendance Performance (${total} Working Days)`;

    const overallBadge = document.getElementById("par-att-overall-badge");
    if (overallBadge) {
      overallBadge.innerText = `● ${ratio}% Presence Rate ${ratio >= 75 ? "(Good Standing)" : "(Needs Attention)"}`;
      overallBadge.className = `badge ${ratio >= 75 ? "badge-success" : "badge-danger"}`;
    }

    const progress = document.getElementById("par-att-progress");
    if (progress) {
      progress.style.width = `${ratio}%`;
      progress.className = `progress-bar-fill ${ratio >= 75 ? "success" : "danger"}`;
    }

    const presentDays = document.getElementById("par-att-present-days");
    if (presentDays) presentDays.innerText = `${presents} Days`;

    const absentDays = document.getElementById("par-att-absent-days");
    if (absentDays) absentDays.innerText = `${absents} Days`;

    const totalDays = document.getElementById("par-att-total-days");
    if (totalDays) totalDays.innerText = `${total} Days`;

    const logTitle = document.getElementById("par-att-log-title");
    if (logTitle) logTitle.innerText = `Individual Class Attendance Log (All ${total} Sessions)`;

    if (childAtts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-muted" style="text-align:center;">No presence check logs found.</td></tr>`;
    } else {
      childAtts.forEach(a => {
        const c = db.courses.find(course => course.id === a.courseId);
        const badgeClass = a.status === "Present" ? "badge-success" : "badge-danger";
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${a.date}</strong></td>
          <td><span class="badge badge-info">${c ? c.code : "Core"}</span> <strong>${c ? c.title : "Lecture Class"}</strong></td>
          <td><span class="badge ${badgeClass}">${a.status}</span></td>
        `;
        tbody.appendChild(tr);
      });
    }
  }
  else if (panelId === "panel-parent-grades") {
    const tbody = document.getElementById("table-parent-grades-body");
    tbody.innerHTML = "";

    // Render Academic Records SGPA Grid
    const childCgpa = (currentUser && currentUser.childCgpa) || (db.child && db.child.cgpa) || 0;
    renderAcademicRecordsGrid("parent-academic-records-grid", "parent-grades-cgpa-title", "parent-grades-cgpa-badge", db.academicRecords, childCgpa);


    const childSubs = db.submissions.filter(s => s.studentId === "usr_student" || (currentUser && s.studentId === currentUser.childId));
    const childQuizzes = db.quizAttempts.filter(q => q.studentId === "usr_student" || (currentUser && q.studentId === currentUser.childId));

    if (childSubs.length === 0 && childQuizzes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;">No academic evaluation records found.</td></tr>`;
    } else {
      childSubs.forEach(s => {
        const c = db.courses.find(course => course.id === s.courseId);
        const asg = db.assignments.find(a => a.id === s.assignmentId);
        let scoreText = `<span class="badge badge-warning">Awaiting Review</span>`;
        if (s.grade !== null && s.grade !== undefined) scoreText = `<span class="badge badge-success">${s.grade} / 100</span>`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:700; color:var(--primary);">${c ? c.code : "Core"}</td>
          <td style="font-weight:600;">${asg ? asg.title : "Assignment"}</td>
          <td><span class="badge badge-info">Lab Assignment</span></td>
          <td>${scoreText}</td>
          <td style="font-size:12px; color:var(--text-secondary);">${s.feedback || "Evaluated by Instructor"}</td>
        `;
        tbody.appendChild(tr);
      });

      childQuizzes.forEach(q => {
        const c = db.courses.find(course => course.id === q.courseId);
        const quiz = db.quizzes.find(quizItem => quizItem.id === q.quizId);

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:700; color:var(--primary);">${c ? c.code : "Core"}</td>
          <td style="font-weight:600;">${quiz ? quiz.title : "Quiz"}</td>
          <td><span class="badge badge-purple" style="background:rgba(168,85,247,0.08); color:#a855f7; border:1px solid rgba(168,85,247,0.15);">Online Quiz</span></td>
          <td><span class="badge badge-success">${q.score} / 100</span></td>
          <td style="font-size:12px; color:var(--text-secondary);">Automated Evaluation System. Grade: A+</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }
  else if (panelId === "panel-parent-fees") {
    const tbody = document.getElementById("table-parent-fees-body");
    tbody.innerHTML = "";

    const parentFees = db.fees.filter(f => f.parentId === "usr_parent" || !f.parentId || (currentUser && f.parentId === currentUser.id));
    if (parentFees.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;">No billing registers found.</td></tr>`;
    } else {
      parentFees.forEach(f => {
        const isPaid = f.status === "Paid";
        const badgeClass = isPaid ? "badge-success" : "badge-warning";
        const actionBtn = isPaid
          ? `<span style="font-size:11px; font-weight:600; color:var(--success);">Receipt: ${f.receipt || 'RCP-PAID'}</span>`
          : `<button class="btn btn-primary" style="padding:6px 12px; font-size:11px;" onclick="handlePayFee('${f.id}')">Pay ₹${f.amount.toLocaleString()}</button>`;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:600;">${f.title}</td>
          <td>${f.due}</td>
          <td style="font-weight:700; color:var(--text-primary);">₹${f.amount.toLocaleString()}</td>
          <td><span class="badge ${badgeClass}">${f.status}</span></td>
          <td>${actionBtn}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }
  else if (panelId === "panel-parent-messages") {
    const list = document.getElementById("list-parent-messages");
    list.innerHTML = "";

    const parentMsgs = db.messages.filter(m => m.parentId === "usr_parent" || !m.parentId || (currentUser && m.parentId === currentUser.id));
    if (parentMsgs.length === 0) {
      list.innerHTML = `<div class="info-item" style="text-align:center; color:var(--text-secondary);">No messages from teachers.</div>`;
    } else {
      parentMsgs.forEach(m => {
        const faculty = db.users.find(u => u.id === m.facultyId);
        const item = document.createElement("div");
        item.className = "info-item";
        item.innerHTML = `
          <div class="info-item-title">
            <span>From: ${faculty ? faculty.name : "Dr. K. Rao (Faculty Mentor)"}</span>
            <span class="badge badge-info" style="font-size:9px;">Faculty Advisory</span>
          </div>
          <p class="info-item-desc" style="color:var(--text-primary); margin-top:4px;">${m.text}</p>
          <div class="info-item-meta"><i data-lucide="clock"></i><span>${m.date}</span></div>
        `;
        list.appendChild(item);
      });
    }
    lucide.createIcons();
  }
  else if (panelId === "panel-parent-notifications") {
    const list = document.getElementById("list-parent-notifications");
    list.innerHTML = "";

    const parentNtf = db.notifications.filter(n => n.userId === "usr_parent" || !n.userId || (currentUser && n.userId === currentUser.id));
    if (parentNtf.length === 0) {
      list.innerHTML = `<div class="info-item" style="text-align:center; color:var(--text-secondary);">No notifications.</div>`;
    } else {
      parentNtf.sort((a, b) => (b.date || "").localeCompare(a.date || "")).forEach(n => {
        const item = document.createElement("div");
        item.className = "info-item";
        item.innerHTML = `
          <div class="info-item-title" style="font-size:13px; font-weight:700;">Alert notification</div>
          <p class="info-item-desc">${n.text}</p>
          <div class="info-item-meta"><i data-lucide="clock"></i><span>${n.date}</span></div>
        `;
        list.appendChild(item);
      });
    }
    lucide.createIcons();
  }

  // ------------------------------------------
  // C. FACULTY DASHBOARD RENDERING
  // ------------------------------------------
  else if (panelId === "panel-faculty-overview") {
    const grid = document.getElementById("grid-faculty-courses");
    grid.innerHTML = "";

    const courses = (currentUser.role === "admin") ? db.courses : db.courses.filter(c => c.facultyId === currentUser.id || !c.facultyId);

    if (courses.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; border:1px dashed var(--border); border-radius:var(--radius-lg);">You are not assigned to any courses.</div>`;
    } else {
      courses.forEach(c => {
        const studentsCount = db.enrollments.filter(e => e.courseId === c.id).length;
        const div = document.createElement("div");
        div.className = "course-card";
        div.innerHTML = `
          <span class="course-code">${c.code}</span>
          <h3 class="course-title">${c.title}</h3>
          <p class="course-desc">${c.desc}</p>
          <div class="course-meta">
            <span><i data-lucide="users"></i> ${studentsCount} Students Enrolled</span>
            <button class="btn btn-primary" style="padding:6px 12px; font-size:11px;" onclick="selectClassroom('${c.id}')">
              <span>Manage Desk</span>
              <i data-lucide="chevron-right"></i>
            </button>
          </div>
        `;
        grid.appendChild(div);
      });
    }
    lucide.createIcons();
  }
  else if (panelId === "panel-faculty-courses") {
    const grid = document.getElementById("grid-faculty-manage-courses");
    grid.innerHTML = "";

    const courses = (currentUser.role === "admin") ? db.courses : db.courses.filter(c => c.facultyId === currentUser.id || !c.facultyId);

    if (courses.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; border:1px dashed var(--border); border-radius:var(--radius-lg);">You have not created any courses yet. Click "Create New Course" above to add your first course.</div>`;
    } else {
      courses.forEach(c => {
        const enrolledCount = db.enrollments.filter(e => e.courseId === c.id).length;
        const div = document.createElement("div");
        div.className = "course-card";
        div.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <span class="course-code">${c.code}</span>
            <span class="badge badge-info" style="font-size:10px;">${c.category || "General"}</span>
          </div>
          <h3 class="course-title">${c.title}</h3>
          <p class="course-desc">${c.desc}</p>
          <div style="font-size:12px; color:var(--text-secondary); margin-bottom:12px; display:flex; flex-direction:column; gap:4px;">
            <span><strong>Duration:</strong> ${c.duration || "Self-Paced"}</span>
            <span><strong>Resources:</strong> ${c.resources ? c.resources.substring(0, 55) + '...' : 'None listed'}</span>
          </div>
          <div class="course-meta" style="justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:10px; margin-top:10px;">
            <span style="font-size:11px; color:var(--text-secondary);"><i data-lucide="users" style="width:12px; height:12px; display:inline;"></i> ${enrolledCount} Enrolled</span>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary" style="padding:6px 10px; font-size:11px;" onclick="triggerEditCourseModal('${c.id}')">
                <i data-lucide="edit"></i>
                <span>Edit</span>
              </button>
              <button class="btn btn-secondary" style="padding:6px 10px; font-size:11px; color:#ef4444; border-color:rgba(239,68,68,0.3);" onclick="triggerDeleteCourseConfirmation('${c.id}')">
                <i data-lucide="trash-2"></i>
                <span>Delete</span>
              </button>
            </div>
          </div>
        `;
        grid.appendChild(div);
      });
    }
    lucide.createIcons();
  }
  else if (panelId === "panel-faculty-classroom") {
    const course = db.courses.find(c => c.id === currentSelectedClassroomId);
    if (!course) return;

    document.getElementById("classroom-faculty-code").innerText = course.code;

    const parentSelect = document.getElementById("msg-parent-select");
    parentSelect.innerHTML = "";

    const enrolls = db.enrollments.filter(e => e.courseId === course.id);
    const childIds = enrolls.map(e => e.studentId);
    const parents = db.users.filter(u => u.role === "parent" && (childIds.includes(u.childId) || childIds.length === 0));

    if (parents.length === 0) {
      const opt = document.createElement("option");
      opt.innerText = "No parents linked to enrolled students";
      opt.disabled = true;
      parentSelect.appendChild(opt);
    } else {
      parents.forEach(p => {
        const student = db.users.find(u => u.id === p.childId);
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.innerText = `${p.name} (Parent of ${student ? student.name : "Student"})`;
        parentSelect.appendChild(opt);
      });
    }

    const rosterTbody = document.getElementById("table-faculty-roster-body");
    rosterTbody.innerHTML = "";

    if (enrolls.length === 0) {
      rosterTbody.innerHTML = `<tr><td colspan="2" class="text-muted" style="text-align:center;">No students enrolled.</td></tr>`;
    } else {
      enrolls.forEach(e => {
        const stu = db.users.find(u => u.id === e.studentId);
        if (stu) {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="font-weight:600;">${stu.name}</td>
            <td>${stu.email}</td>
          `;
          rosterTbody.appendChild(tr);
        }
      });
    }

    const asgsList = document.getElementById("list-faculty-assignments");
    asgsList.innerHTML = "";

    const courseAsgs = db.assignments.filter(a => a.courseId === course.id);
    if (courseAsgs.length === 0) {
      asgsList.innerHTML = `<div class="info-item" style="text-align:center; color:var(--text-secondary);">No assignments published.</div>`;
    } else {
      courseAsgs.forEach(a => {
        const countSub = db.submissions.filter(s => s.assignmentId === a.id).length;
        const item = document.createElement("div");
        item.className = "info-item";
        item.innerHTML = `
          <div class="info-item-title">
            <span>${a.title}</span>
            <span class="badge badge-info">${countSub} Submissions</span>
          </div>
          <p class="info-item-desc">${a.desc}</p>
          <div class="info-item-meta"><i data-lucide="calendar"></i><span>Due Date: ${a.due}</span></div>
        `;
        asgsList.appendChild(item);
      });
    }

    const subsList = document.getElementById("list-faculty-submissions");
    subsList.innerHTML = "";

    const pendingSubs = db.submissions.filter(s => s.courseId === course.id && (s.grade === null || s.grade === undefined));
    if (pendingSubs.length === 0) {
      subsList.innerHTML = `<div class="info-item" style="text-align:center; color:var(--text-secondary); border:1px dashed var(--border);">All submitted homework graded!</div>`;
    } else {
      pendingSubs.forEach(s => {
        const student = db.users.find(u => u.id === s.studentId);
        const asg = db.assignments.find(a => a.id === s.assignmentId);

        const item = document.createElement("div");
        item.className = "info-item";
        item.innerHTML = `
          <div class="info-item-title">
            <span>${student ? student.name : "Student"}</span>
            <span style="font-size:11px; font-weight:700; color:var(--primary);">${asg ? asg.title : "Assignment"}</span>
          </div>
          <div class="info-item-meta" style="justify-content:space-between; align-items:center; width:100%; margin-top:6px;">
            <span><i data-lucide="clock"></i> Submitted: ${s.submittedAt}</span>
            <button class="btn btn-success" style="padding:6px 12px; font-size:11px;" onclick="triggerGradeModal('${s.id}')">
              <i data-lucide="check-square"></i><span>Evaluate</span>
            </button>
          </div>
        `;
        subsList.appendChild(item);
      });
    }
    lucide.createIcons();
  }
  else if (panelId === "panel-faculty-materials") {
    const pdfSelect = document.getElementById("pdf-course-select");
    const videoSelect = document.getElementById("video-course-select");
    pdfSelect.innerHTML = "";
    videoSelect.innerHTML = "";

    const courses = db.courses.filter(c => c.facultyId === currentUser.id || currentUser.role === "admin" || !c.facultyId);
    courses.forEach(c => {
      const opt1 = document.createElement("option"); opt1.value = c.id; opt1.innerText = c.title; pdfSelect.appendChild(opt1);
      const opt2 = document.createElement("option"); opt2.value = c.id; opt2.innerText = c.title; videoSelect.appendChild(opt2);
    });

    const tbody = document.getElementById("table-faculty-materials-body");
    tbody.innerHTML = "";

    const myCourseIds = courses.map(c => c.id);
    const pdfs = db.materials.filter(m => myCourseIds.includes(m.courseId));
    const vids = db.videos.filter(v => myCourseIds.includes(v.courseId));

    if (pdfs.length === 0 && vids.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-muted" style="text-align:center;">No course materials uploaded.</td></tr>`;
    } else {
      pdfs.forEach(m => {
        const c = db.courses.find(course => course.id === m.courseId);
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:700; color:var(--primary);">${c ? c.code : "N/A"}</td>
          <td style="font-weight:600;">${m.title}</td>
          <td><span class="badge badge-info">PDF Doc</span></td>
        `;
        tbody.appendChild(tr);
      });
      vids.forEach(v => {
        const c = db.courses.find(course => course.id === v.courseId);
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:700; color:var(--primary);">${c ? c.code : "N/A"}</td>
          <td style="font-weight:600;">${v.title}</td>
          <td><span class="badge badge-purple" style="background:rgba(168,85,247,0.08); color:#a855f7; border:1px solid rgba(168,85,247,0.15);">Video</span></td>
        `;
        tbody.appendChild(tr);
      });
    }
  }
  else if (panelId === "panel-faculty-creator") {
    const qSelect = document.getElementById("quiz-course-select");
    const aSelect = document.getElementById("assign-course-select");
    qSelect.innerHTML = "";
    aSelect.innerHTML = "";

    const courses = db.courses.filter(c => c.facultyId === currentUser.id || currentUser.role === "admin" || !c.facultyId);
    courses.forEach(c => {
      const opt1 = document.createElement("option"); opt1.value = c.id; opt1.innerText = c.title; qSelect.appendChild(opt1);
      const opt2 = document.createElement("option"); opt2.value = c.id; opt2.innerText = c.title; aSelect.appendChild(opt2);
    });
  }
  else if (panelId === "panel-faculty-attendance") {
    const attSelect = document.getElementById("attendance-course-select");
    attSelect.innerHTML = "";

    const courses = db.courses.filter(c => c.facultyId === currentUser.id || currentUser.role === "admin" || !c.facultyId);
    courses.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.innerText = c.title;
      attSelect.appendChild(opt);
    });

    if (!document.getElementById("attendance-register-date").value) {
      document.getElementById("attendance-register-date").value = new Date().toISOString().split("T")[0];
    }

    loadAttendanceRegisterSheet();
  }
  else if (panelId === "panel-faculty-reports") {
    const myCourses = db.courses.filter(c => c.facultyId === currentUser.id || currentUser.role === "admin" || !c.facultyId);
    const myCourseIds = myCourses.map(c => c.id);

    const enrolls = db.enrollments.filter(e => myCourseIds.includes(e.courseId));
    const totalStudents = new Set(enrolls.map(e => e.studentId)).size || db.users.filter(u => u.role === 'student').length;
    const totalQuizzes = db.quizzes.filter(q => myCourseIds.includes(q.courseId)).length;
    const totalAsgs = db.assignments.filter(a => myCourseIds.includes(a.courseId)).length;

    const statsGrid = document.getElementById("faculty-report-stats-grid");
    statsGrid.innerHTML = `
      <div class="stats-card">
        <div class="stats-info">
          <span class="stats-label">Active Enrolled Roster</span>
          <span class="stats-value">${totalStudents} Students</span>
        </div>
        <div class="stats-icon blue"><i data-lucide="users"></i></div>
      </div>
      <div class="stats-card">
        <div class="stats-info">
          <span class="stats-label">Published Quizzes</span>
          <span class="stats-value">${totalQuizzes} Tests</span>
        </div>
        <div class="stats-icon purple"><i data-lucide="help-circle"></i></div>
      </div>
      <div class="stats-card">
        <div class="stats-info">
          <span class="stats-label">Published Assignments</span>
          <span class="stats-value">${totalAsgs} Deadlines</span>
        </div>
        <div class="stats-icon green"><i data-lucide="file-text"></i></div>
      </div>
    `;

    const gradesBody = document.getElementById("table-faculty-reports-grades-body");
    gradesBody.innerHTML = "";

    const studentIds = [...new Set(enrolls.map(e => e.studentId))];
    const targetStudents = studentIds.length > 0 ? studentIds : db.users.filter(u => u.role === 'student').map(u => u.id);

    if (targetStudents.length === 0) {
      gradesBody.innerHTML = `<tr><td colspan="4" class="text-muted" style="text-align:center;">No student enrolled yet.</td></tr>`;
    } else {
      targetStudents.forEach(sid => {
        const student = db.users.find(u => u.id === sid);
        if (student) {
          const subs = db.submissions.filter(s => s.studentId === sid && (myCourseIds.includes(s.courseId) || myCourseIds.length === 0));
          const graded = subs.filter(s => s.grade !== null && s.grade !== undefined);
          const quizAttempts = db.quizAttempts.filter(qa => qa.studentId === sid && (myCourseIds.includes(qa.courseId) || myCourseIds.length === 0));

          let totalScore = 0;
          let counts = 0;

          graded.forEach(s => { totalScore += s.grade; counts++; });
          quizAttempts.forEach(q => { totalScore += q.score; counts++; });

          const avgScore = counts > 0 ? `${Math.round(totalScore / counts)}%` : "N/A";

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td style="font-weight:600;">${student.name}</td>
            <td style="font-weight:700; color:var(--primary);">${avgScore}</td>
            <td>${quizAttempts.length} Attempts</td>
            <td>${graded.length} evaluated</td>
          `;
          gradesBody.appendChild(tr);
        }
      });
    }

    const quizzesBody = document.getElementById("table-faculty-reports-quizzes-body");
    quizzesBody.innerHTML = "";

    const attempts = db.quizAttempts.filter(a => myCourseIds.includes(a.courseId) || myCourseIds.length === 0);
    attempts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

    if (attempts.length === 0) {
      quizzesBody.innerHTML = `<tr><td colspan="3" class="text-muted" style="text-align:center;">No quiz attempts logged.</td></tr>`;
    } else {
      attempts.forEach(a => {
        const student = db.users.find(u => u.id === a.studentId);
        const quiz = db.quizzes.find(q => q.id === a.quizId);

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:600;">${student ? student.name : "Student"}</td>
          <td>${quiz ? quiz.title : "Quiz"}</td>
          <td style="font-weight:700; color:var(--success);">${a.score}%</td>
        `;
        quizzesBody.appendChild(tr);
      });
    }
    lucide.createIcons();
  }
}

function selectClassroom(courseId) {
  currentSelectedClassroomId = courseId;
  navigatePanel("panel-faculty-classroom");
}

// ==========================================
// VIDEO MODAL
// ==========================================
function triggerWatchVideoModal(videoTitle) {
  document.getElementById("modal-watch-video-title").innerText = videoTitle;
  openModal("modal-watch-video");
  lucide.createIcons();
}

// ==========================================
// QUIZ ENGINE
// ==========================================
function triggerTakeQuizModal(quizId, courseId, quizTitle) {
  const quiz = db.quizzes.find(q => q.id === quizId);
  if (!quiz) return;

  document.getElementById("take-quiz-id").value = quizId;
  document.getElementById("take-quiz-course-id").value = courseId;
  document.getElementById("modal-take-quiz-title").innerText = quizTitle;

  const viewport = document.getElementById("take-quiz-questions-viewport");
  viewport.innerHTML = "";

  quiz.questions.forEach((q, qidx) => {
    const card = document.createElement("div");
    card.className = "quiz-question-card";

    let optionsHTML = "";
    q.options.forEach((opt, oidx) => {
      optionsHTML += `
        <label class="quiz-option-item" id="opt-label-${qidx}-${oidx}">
          <input type="radio" name="q-option-${qidx}" value="${oidx}" onchange="highlightOptionLabel(${qidx}, ${oidx}, ${q.options.length})" required>
          <span>${opt}</span>
        </label>
      `;
    });

    card.innerHTML = `
      <div class="quiz-question-text">${qidx + 1}. ${q.text}</div>
      <div class="quiz-options-list">${optionsHTML}</div>
    `;
    viewport.appendChild(card);
  });

  openModal("modal-take-quiz");
}

function highlightOptionLabel(qidx, oidx, totalOpts) {
  for (let i = 0; i < totalOpts; i++) {
    const el = document.getElementById(`opt-label-${qidx}-${i}`);
    if (el) el.classList.remove("selected");
  }
  document.getElementById(`opt-label-${qidx}-${oidx}`).classList.add("selected");
}

async function handleQuizSubmit(e) {
  e.preventDefault();
  const quizId = document.getElementById("take-quiz-id").value;
  const courseId = document.getElementById("take-quiz-course-id").value;

  const quiz = db.quizzes.find(q => q.id === quizId);
  if (!quiz) return;

  const answers = [];
  quiz.questions.forEach((q, qidx) => {
    const radios = document.getElementsByName(`q-option-${qidx}`);
    let selectedVal = null;
    radios.forEach(r => {
      if (r.checked) selectedVal = parseInt(r.value);
    });
    answers.push(selectedVal);
  });

  try {
    const data = await apiFetch("/student/quizzes/attempt", {
      method: "POST",
      body: JSON.stringify({ quizId, courseId, answers })
    });
    closeModal("modal-take-quiz");
    showToast(`Quiz completed! You scored ${data.score}%!`);
    if (data.score >= 70 && typeof confetti === "function") {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
    await syncLiveDB();
    renderPanelContent("panel-student-quizzes");
  } catch (err) {
    showToast(err.message || "Failed to submit quiz.", "danger");
  }
}

// ==========================================
// PROFILE UPDATE
// ==========================================
async function handleProfileUpdate(e) {
  e.preventDefault();
  const name = document.getElementById("profile-name").value.trim();
  const pass = document.getElementById("profile-password").value;

  try {
    const data = await apiFetch("/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name, password: pass.trim().length >= 6 ? pass.trim() : undefined })
    });
    currentUser = data.user;
    localStorage.setItem("pathshala_current_user", JSON.stringify(currentUser));
    showToast(data.message || "Profile credentials updated.");
    enterAppShell();
  } catch (err) {
    showToast(err.message || "Profile update failed.", "danger");
  }
}

// ==========================================
// STUDENT ASSIGNMENT UPLOAD
// ==========================================
function triggerSubmitModal(asgId, courseId, title) {
  document.getElementById("submit-assignment-id").value = asgId;
  document.getElementById("submit-course-id").value = courseId;
  document.getElementById("modal-submit-title").innerText = `Submit: ${title}`;
  document.getElementById("submit-content").value = "";
  openModal("modal-submit-assignment");
}

async function handleAssignmentSubmit(e) {
  e.preventDefault();
  const asgId = document.getElementById("submit-assignment-id").value;
  const courseId = document.getElementById("submit-course-id").value;
  const content = document.getElementById("submit-content").value.trim();

  try {
    await apiFetch("/student/submissions", {
      method: "POST",
      body: JSON.stringify({ assignmentId: asgId, courseId, content })
    });
    closeModal("modal-submit-assignment");
    showToast("Assignment submitted successfully!");
    if (typeof confetti === "function") {
      confetti({ particleCount: 40, spread: 50, origin: { x: 0.1 } });
      confetti({ particleCount: 40, spread: 50, origin: { x: 0.9 } });
    }
    await syncLiveDB();
    renderPanelContent("panel-student-assignments");
  } catch (err) {
    showToast(err.message || "Assignment submission failed.", "danger");
  }
}

// ==========================================
// PARENT FEE INVOICES PAYMENT
// ==========================================
async function handlePayFee(feeId) {
  try {
    const data = await apiFetch(`/parent/fees/${feeId}/pay`, { method: "POST" });
    showToast(`Payment processed. Receipt: ${data.receipt}`);
    if (typeof confetti === "function") {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    await syncLiveDB();
    renderPanelContent("panel-parent-fees");
  } catch (err) {
    showToast(err.message || "Fee payment failed.", "danger");
  }
}

// ==========================================
// FACULTY UPLOADS (MATERIALS & VIDEOS)
// ==========================================
async function handleUploadPDF(e) {
  e.preventDefault();
  const courseId = document.getElementById("pdf-course-select").value;
  const title = document.getElementById("pdf-title").value.trim();
  const link = document.getElementById("pdf-link").value.trim();

  try {
    await apiFetch("/faculty/materials", {
      method: "POST",
      body: JSON.stringify({ courseId, title, link, type: "PDF" })
    });
    showToast(`Material "${title}" successfully published.`);
    e.target.reset();
    await syncLiveDB();
    renderPanelContent("panel-faculty-materials");
  } catch (err) {
    showToast(err.message || "Failed to publish material.", "danger");
  }
}

async function handleUploadVideo(e) {
  e.preventDefault();
  const courseId = document.getElementById("video-course-select").value;
  const title = document.getElementById("video-title").value.trim();
  const link = document.getElementById("video-link").value.trim();

  try {
    await apiFetch("/faculty/videos", {
      method: "POST",
      body: JSON.stringify({ courseId, title, link })
    });
    showToast(`Video lecture "${title}" uploaded.`);
    e.target.reset();
    await syncLiveDB();
    renderPanelContent("panel-faculty-materials");
  } catch (err) {
    showToast(err.message || "Failed to upload video.", "danger");
  }
}

// ==========================================
// FACULTY QUIZ & ASSIGNMENT DESIGNERS
// ==========================================
async function handleCreateQuiz(e) {
  e.preventDefault();
  const courseId = document.getElementById("quiz-course-select").value;
  const title = document.getElementById("quiz-title").value.trim();
  const qText = document.getElementById("quiz-q-text").value.trim();
  const optA = document.getElementById("quiz-opt-a").value.trim();
  const optB = document.getElementById("quiz-opt-b").value.trim();
  const optC = document.getElementById("quiz-opt-c").value.trim();
  const correct = parseInt(document.getElementById("quiz-correct-opt").value);

  try {
    await apiFetch("/faculty/quizzes", {
      method: "POST",
      body: JSON.stringify({
        courseId,
        title,
        questions: [{ text: qText, options: [optA, optB, optC], correct }]
      })
    });
    showToast(`Interactive quiz "${title}" deployed successfully.`);
    e.target.reset();
    await syncLiveDB();
  } catch (err) {
    showToast(err.message || "Failed to deploy quiz.", "danger");
  }
}

async function handleCreateAssignment(e) {
  e.preventDefault();
  let courseId, title, due, desc;
  const courseSelect = document.getElementById("assign-course-select");
  if (courseSelect && courseSelect.offsetParent !== null) {
    courseId = courseSelect.value;
  } else {
    courseId = currentSelectedClassroomId;
  }
  title = document.getElementById("assign-title").value.trim();
  due = document.getElementById("assign-due").value;
  desc = document.getElementById("assign-desc").value.trim();

  try {
    await apiFetch("/faculty/assignments", {
      method: "POST",
      body: JSON.stringify({ courseId, title, due, desc })
    });
    showToast(`Assignment "${title}" published.`);
    e.target.reset();
    await syncLiveDB();
    if (currentSelectedClassroomId) {
      renderPanelContent("panel-faculty-classroom");
    }
  } catch (err) {
    showToast(err.message || "Failed to create assignment.", "danger");
  }
}

// ==========================================
// FACULTY EVALUATION GRADING
// ==========================================
function triggerGradeModal(submissionId) {
  const sub = db.submissions.find(s => s.id === submissionId);
  if (!sub) return;

  document.getElementById("grade-submission-id").value = submissionId;
  document.getElementById("grade-student-work").innerText = sub.content;
  document.getElementById("grade-value").value = "";
  document.getElementById("grade-feedback").value = "";

  openModal("modal-grade-submission");
}

async function handleGradeSubmit(e) {
  e.preventDefault();
  const subId = document.getElementById("grade-submission-id").value;
  const gradeVal = parseInt(document.getElementById("grade-value").value);
  const feedback = document.getElementById("grade-feedback").value.trim();

  try {
    await apiFetch(`/faculty/submissions/${subId}/grade`, {
      method: "POST",
      body: JSON.stringify({ grade: gradeVal, feedback })
    });
    closeModal("modal-grade-submission");
    showToast("Evaluation grade successfully committed.");
    if (gradeVal >= 85 && typeof confetti === "function") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    await syncLiveDB();
    renderPanelContent("panel-faculty-classroom");
  } catch (err) {
    showToast(err.message || "Failed to submit evaluation.", "danger");
  }
}

// ==========================================
// FACULTY NOTICES & MESSAGING
// ==========================================
async function handleCreateAnnouncement(e) {
  e.preventDefault();
  const text = document.getElementById("announce-text").value.trim();

  try {
    await apiFetch("/faculty/announcements", {
      method: "POST",
      body: JSON.stringify({ courseId: currentSelectedClassroomId, text })
    });
    showToast("Notice posted to the classroom board.");
    e.target.reset();
    await syncLiveDB();
    renderPanelContent("panel-faculty-classroom");
  } catch (err) {
    showToast(err.message || "Failed to post notice.", "danger");
  }
}

async function handleSendTeacherMessage(e) {
  e.preventDefault();
  const parentId = document.getElementById("msg-parent-select").value;
  const text = document.getElementById("msg-parent-body").value.trim();

  try {
    await apiFetch("/faculty/messages", {
      method: "POST",
      body: JSON.stringify({ parentId, text })
    });
    showToast("Advisory message sent successfully to parent inbox.");
    e.target.reset();
    await syncLiveDB();
  } catch (err) {
    showToast(err.message || "Failed to send message.", "danger");
  }
}

// ==========================================
// ATTENDANCE REGISTER
// ==========================================
function loadAttendanceRegisterSheet() {
  const courseId = document.getElementById("attendance-course-select").value;
  const dateStr = document.getElementById("attendance-register-date").value;

  const tbody = document.getElementById("table-faculty-attendance-register-body");
  tbody.innerHTML = "";

  if (!courseId) return;

  const enrolls = db.enrollments.filter(e => e.courseId === courseId);
  const students = enrolls.length > 0
    ? enrolls.map(e => db.users.find(u => u.id === e.studentId)).filter(Boolean)
    : db.users.filter(u => u.role === 'student');

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-muted" style="text-align:center;">No students enrolled.</td></tr>`;
    return;
  }

  students.forEach(student => {
    const record = db.attendance.find(a => a.studentId === student.id && a.courseId === courseId && a.date === dateStr);
    const isChecked = record ? record.status === "Present" : true;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight:600;">${student.name}</td>
      <td>${student.email}</td>
      <td>
        <input type="checkbox" id="att-chk-${student.id}" style="width:16px; height:16px; cursor:pointer;" ${isChecked ? "checked" : ""}>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function saveAttendanceRegisterSheet() {
  const courseId = document.getElementById("attendance-course-select").value;
  const dateStr = document.getElementById("attendance-register-date").value;

  if (!courseId || !dateStr) return;

  const records = [];
  const enrolls = db.enrollments.filter(e => e.courseId === courseId);
  const students = enrolls.length > 0
    ? enrolls.map(e => db.users.find(u => u.id === e.studentId)).filter(Boolean)
    : db.users.filter(u => u.role === 'student');

  students.forEach(student => {
    const chk = document.getElementById(`att-chk-${student.id}`);
    const status = chk && chk.checked ? "Present" : "Absent";
    records.push({ studentId: student.id, status });
  });

  try {
    await apiFetch("/faculty/attendance", {
      method: "POST",
      body: JSON.stringify({ courseId, date: dateStr, records })
    });
    showToast("Attendance register sheet committed.");
    await syncLiveDB();
  } catch (err) {
    showToast(err.message || "Failed to commit attendance.", "danger");
  }
}

// ==========================================
// COURSE MANAGEMENT CONTROLLERS
// ==========================================
function triggerAddCourseModal() {
  document.getElementById("course-edit-id").value = "";
  document.getElementById("modal-course-form-title").innerText = "Create New Course";
  document.getElementById("btn-save-course-label").innerText = "Create & Publish Course";

  document.getElementById("course-title-input").value = "";
  document.getElementById("course-code-input").value = "";
  document.getElementById("course-duration-input").value = "";
  document.getElementById("course-category-input").value = "";
  document.getElementById("course-desc-input").value = "";
  document.getElementById("course-resources-input").value = "";

  openModal("modal-course-form");
}

function triggerEditCourseModal(courseId) {
  const course = db.courses.find(c => c.id === courseId);
  if (!course) return;

  document.getElementById("course-edit-id").value = course.id;
  document.getElementById("modal-course-form-title").innerText = `Edit Course: ${course.code}`;
  document.getElementById("btn-save-course-label").innerText = "Update Course Details";

  document.getElementById("course-title-input").value = course.title || "";
  document.getElementById("course-code-input").value = course.code || "";
  document.getElementById("course-duration-input").value = course.duration || "";
  document.getElementById("course-category-input").value = course.category || "";
  document.getElementById("course-desc-input").value = course.desc || "";
  document.getElementById("course-resources-input").value = course.resources || "";

  openModal("modal-course-form");
}

async function handleSaveCourse(e) {
  e.preventDefault();

  const editId = document.getElementById("course-edit-id").value;
  const title = document.getElementById("course-title-input").value.trim();
  const code = document.getElementById("course-code-input").value.trim().toUpperCase();
  const duration = document.getElementById("course-duration-input").value.trim();
  const category = document.getElementById("course-category-input").value.trim();
  const desc = document.getElementById("course-desc-input").value.trim();
  const resources = document.getElementById("course-resources-input").value.trim();

  try {
    if (editId) {
      await apiFetch(`/courses/${editId}`, {
        method: "PUT",
        body: JSON.stringify({ title, code, duration, category, desc, resources })
      });
      showToast(`Course "${code}: ${title}" updated successfully.`);
    } else {
      await apiFetch("/courses", {
        method: "POST",
        body: JSON.stringify({ code, title, duration, category, desc, resources })
      });
      showToast(`Course "${code}: ${title}" created and published!`);
      if (typeof confetti === "function") {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }
    }
    closeModal("modal-course-form");
    await syncLiveDB();
    renderPanelContent("panel-faculty-courses");
    renderPanelContent("panel-faculty-overview");
  } catch (err) {
    showToast(err.message || "Failed to save course.", "danger");
  }
}

function triggerDeleteCourseConfirmation(courseId) {
  const course = db.courses.find(c => c.id === courseId);
  if (!course) return;

  document.getElementById("delete-course-target-id").value = course.id;
  document.getElementById("delete-course-confirm-msg").innerText =
    `Are you sure you want to delete the course "${course.code}: ${course.title}"?`;

  openModal("modal-delete-course-confirm");
}

async function executeDeleteCourse() {
  const courseId = document.getElementById("delete-course-target-id").value;
  try {
    await apiFetch(`/courses/${courseId}`, { method: "DELETE" });
    closeModal("modal-delete-course-confirm");
    showToast(`Course permanently deleted.`, "danger");
    await syncLiveDB();
    renderPanelContent("panel-faculty-courses");
    renderPanelContent("panel-faculty-overview");
  } catch (err) {
    showToast(err.message || "Failed to delete course.", "danger");
  }
}

function triggerStudentViewCourse(courseId) {
  const course = db.courses.find(c => c.id === courseId);
  if (!course) return;

  const faculty = db.users.find(u => u.id === course.facultyId);

  document.getElementById("stu-modal-course-code").innerText = course.code;
  document.getElementById("stu-modal-course-title").innerText = course.title;
  document.getElementById("stu-modal-course-faculty").innerText = faculty ? faculty.name : "Instructor";
  document.getElementById("stu-modal-course-duration").innerText = course.duration || "N/A";
  document.getElementById("stu-modal-course-category").innerText = course.category || "General";
  document.getElementById("stu-modal-course-desc").innerText = course.desc || "No description provided.";
  document.getElementById("stu-modal-course-resources").innerText = course.resources || "No specific resources listed.";

  openModal("modal-student-view-course");
}

// ==========================================
// WINDOW LOAD SETUP
// ==========================================
window.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();

  // Always show the public Landing Homepage by default on fresh page load/visit
  showHomeView();
  await syncLiveDB();
});

// Helper for Academic Records
function renderAcademicRecordsGrid(gridId, titleId, badgeId, academicRecords, cgpa) {
  const grid = document.getElementById(gridId);
  const title = document.getElementById(titleId);
  const badge = document.getElementById(badgeId);

  if (!grid) return;
  grid.innerHTML = '';

  if (!academicRecords || academicRecords.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-secondary); padding: 10px;">No academic records available.</div>';
    return;
  }

  if (title && cgpa) {
    title.innerText = `Semester-Wise Academic History (Cumulative CGPA: ${cgpa})`;
  }
  if (badge) {
    badge.style.display = 'inline-block';
    badge.innerText = cgpa >= 9.0 ? 'Grade: A+ (First Class with Distinction)' : 'Grade: Pass';
  }

  academicRecords.sort((a, b) => a.semester.localeCompare(b.semester)).forEach(record => {
    const div = document.createElement('div');
    div.style = 'background: #f8fafc; padding: 14px; border-radius: var(--radius-md); border: 1px solid #edf2f7;';
    div.innerHTML = `
      <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary);">${record.semester}</span>
      <h4 style="font-size: 17px; font-weight: 800; color: var(--primary); margin: 4px 0 2px 0;">${record.sgpa} SGPA</h4>
      <span style="font-size: 10px; color: var(--text-secondary);">${record.cleared ? 'All Cleared' : 'Not Cleared'}</span>
    `;
    grid.appendChild(div);
  });
}