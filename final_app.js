// ==========================================
// MOCK DATABASE & STATE MANAGEMENT (PATHSHALA)
// ==========================================

const DEFAULT_USERS = [
  { id: "usr_admin", email: "admin@bvrit.ac.in", password: "admin123", name: "Global Administrator", role: "admin" },
  { id: "usr_smith", email: "prof.smith@bvrit.ac.in", password: "prof123", name: "Dr. Alistair Smith", role: "faculty" },
  { id: "usr_jones", email: "prof.jones@bvrit.ac.in", password: "prof123", name: "Dr. Evelyn Jones", role: "faculty" },
  { id: "usr_faculty_default", email: "faculty@bvrit.ac.in", password: "faculty123", name: "Professor Rogers", role: "faculty" },
  { id: "usr_student", email: "student@bvrit.ac.in", password: "student123", name: "Alexander Mercer", role: "student" },
  { id: "usr_jane", email: "jane.doe@bvrit.ac.in", password: "jane123", name: "Jane Doe", role: "student" },
  { id: "usr_parent", email: "parent@bvrit.ac.in", password: "parent123", name: "David Mercer", role: "parent", childId: "usr_student" }
];

const DEFAULT_COURSES = [
  { id: "crs_cs101", code: "CS-101", title: "Intro to Neural Networks", facultyId: "usr_smith", desc: "Explore fundamentals of artificial intelligence, convolutional neural layers, backpropagation, and training optimization algorithms.", duration: "8 Weeks", category: "Computer Science", resources: "• Lecture 1 Notes: Intro to Neural Nodes\n• Textbook Chapter 3: Perceptrons & Sigmoids\n• Lab Dataset: MNIST Digits zip" },
  { id: "crs_astro202", code: "ASTRO-202", title: "Cosmological Physics", facultyId: "usr_jones", desc: "A mathematical deep-dive into general relativity, gravity wells, dark energy, and stellar mechanics.", duration: "10 Weeks", category: "Physics", resources: "• General Relativity Field Equations PDF\n• Schwarzschild Singularity Calculation Sheet\n• Astrophysics Reference Manual" },
  { id: "crs_db303", code: "DB-303", title: "Database Systems & SQL", facultyId: "usr_faculty_default", desc: "Master relational database designs, schema normalization, indexing, transaction control logs, and advanced SQL scripting.", duration: "6 Weeks", category: "Software Engineering", resources: "• PostgreSQL Cheatsheet\n• E-R Diagram Modeling Guide\n• Normalization 1NF to 3NF Slides" }
];

const DEFAULT_ENROLLMENTS = [
  { id: "enr_1", studentId: "usr_student", courseId: "crs_cs101" },
  { id: "enr_2", studentId: "usr_student", courseId: "crs_db303" },
  { id: "enr_3", studentId: "usr_jane", courseId: "crs_astro202" }
];

const DEFAULT_ANNOUNCEMENTS = [
  { id: "ann_1", courseId: "crs_cs101", text: "Welcome to CS-101. Slides for the first lecture are posted under syllabus resources.", date: "2026-06-20" },
  { id: "ann_2", courseId: "crs_astro202", text: "Term paper guidelines are finalized. Mid-semester drafts are due by next Friday.", date: "2026-06-22" },
  { id: "ann_3", courseId: "crs_db303", text: "Assignment 1 on E-R diagrams is live. Submission deadline is July 4th.", date: "2026-06-28" }
];

const DEFAULT_ASSIGNMENTS = [
  { id: "asg_1", courseId: "crs_cs101", title: "Perceptron Weight Calculations", desc: "Manually compute the weight changes after 2 epochs for a 3-input perceptron with learning rate eta = 0.1.", due: "2026-07-10" },
  { id: "asg_2", courseId: "crs_astro202", title: "Schwarzschild Radius Calculation", desc: "Calculate the Schwarzschild radius for a supermassive black hole at the center of galaxy M87 using relativity formulas.", due: "2026-07-15" }
];

const DEFAULT_SUBMISSIONS = [
  { 
    id: "sub_1", 
    assignmentId: "asg_1", 
    courseId: "crs_cs101",
    studentId: "usr_student", 
    content: "My submission for weights calculations:\n- Initial weights: [0.2, -0.4, 0.1]\n- Inputs: [1.0, 0.5, -0.2], Expected: 1.0\n- Calc Epoch 1: Error = 1 - 0 = 1\n- New weights w1=0.3, w2=-0.35, w3=0.08\n- Calc Epoch 2: Output matching expected.\nVerified delta calculations.", 
    submittedAt: "2026-06-23",
    grade: null, 
    feedback: null 
  }
];

// Pathshala Quizzes
const DEFAULT_QUIZZES = [
  { 
    id: "qz_1", 
    courseId: "crs_cs101", 
    title: "Neural Networks Fundamentals Quiz", 
    questions: [
      { text: "What is the standard activation function in modern neural nets to solve vanishing gradient?", options: ["Sigmoid", "ReLU (Rectified Linear Unit)", "Linear Function"], correct: 1 },
      { text: "Which algorithm updates weight parameters recursively based on error output?", options: ["Backpropagation", "Bubble Sort", "Gradient Binary Search"], correct: 0 }
    ]
  },
  { 
    id: "qz_2", 
    courseId: "crs_astro202", 
    title: "Relativity & Cosmology Short Quiz", 
    questions: [
      { text: "What is the Schwarzschild radius equation relative to mass M?", options: ["Rs = 2GM/c^2", "E = mc^2", "F = G*(m1*m2)/r^2"], correct: 0 },
      { text: "Which cosmic element is believed to cause the accelerating expansion of the universe?", options: ["Cosmic Dust", "Dark Matter", "Dark Energy"], correct: 2 }
    ]
  }
];

const DEFAULT_QUIZ_ATTEMPTS = [
  { id: "qza_1", quizId: "qz_1", studentId: "usr_student", courseId: "crs_cs101", score: 100, date: "2026-06-28" }
];

// Pathshala Attendance Logs
const DEFAULT_ATTENDANCE = [
  { id: "att_1", studentId: "usr_student", courseId: "crs_cs101", date: "2026-06-25", status: "Present" },
  { id: "att_2", studentId: "usr_student", courseId: "crs_cs101", date: "2026-06-26", status: "Present" },
  { id: "att_3", studentId: "usr_student", courseId: "crs_cs101", date: "2026-06-29", status: "Present" },
  { id: "att_4", studentId: "usr_student", courseId: "crs_db303", date: "2026-06-25", status: "Present" },
  { id: "att_5", studentId: "usr_student", courseId: "crs_db303", date: "2026-06-26", status: "Absent" }
];

// Pathshala Fee Status Sheets (Parent link child)
const DEFAULT_FEES = [
  { id: "fee_1", parentId: "usr_parent", childId: "usr_student", title: "Term 1 Tuition Fees", due: "2026-07-20", amount: 2500, status: "Pending", receipt: null },
  { id: "fee_2", parentId: "usr_parent", childId: "usr_student", title: "Semester Exam fee", due: "2026-06-15", amount: 150, status: "Paid", receipt: "RCP-77489" },
  { id: "fee_3", parentId: "usr_parent", childId: "usr_student", title: "Computer Lab Access Charge", due: "2026-06-10", amount: 100, status: "Paid", receipt: "RCP-77402" }
];

// Direct Teacher Messages to Parents
const DEFAULT_MESSAGES = [
  { id: "msg_1", parentId: "usr_parent", facultyId: "usr_smith", text: "Alexander has been demonstrating excellent computational skills in Perceptron weight assignments. Great progress!", date: "2026-06-26" }
];

// Study Notes/PDFs and Videos
const DEFAULT_MATERIALS = [
  { id: "mat_1", courseId: "crs_cs101", title: "CS-101 Syllabus & Grading Policy", type: "PDF", link: "materials/syllabus_cs101.pdf" },
  { id: "mat_2", courseId: "crs_cs101", title: "Perceptrons & Neural Nodes Guide", type: "PDF", link: "materials/nn_guide.pdf" },
  { id: "mat_3", courseId: "crs_astro202", title: "Schwarzschild Gravity Singularity calculations", type: "PDF", link: "materials/astro202_schwarzschild.pdf" }
];

const DEFAULT_VIDEOS = [
  { id: "vid_1", courseId: "crs_cs101", title: "Lecture 1: Introduction to Neurons & Thresholds", link: "lessons/intro_neurons.mp4" },
  { id: "vid_2", courseId: "crs_cs101", title: "Lecture 2: Backpropagation Chain Rule calculations", link: "lessons/backpropagation_math.mp4" },
  { id: "vid_3", courseId: "crs_astro202", title: "Lecture 1: General Relativity Core Tenets", link: "lessons/relativity_intro.mp4" }
];

// Notification feeds
const DEFAULT_NOTIFICATIONS = [
  { id: "ntf_1", userId: "usr_student", text: "Dr. Alistair Smith published a new homework assignment in CS-101.", date: "2026-06-25", read: false },
  { id: "ntf_2", userId: "usr_parent", text: "Teacher message received from Dr. Alistair Smith.", date: "2026-06-26", read: false }
];

// Force reset storage if migrating from old database format
const storedSchema = localStorage.getItem("pathshala_schema_ver");
if (!storedSchema || storedSchema !== "1.2") {
  localStorage.removeItem("portal_users");
  localStorage.removeItem("portal_courses");
  localStorage.removeItem("portal_enrollments");
  localStorage.removeItem("portal_announcements");
  localStorage.removeItem("portal_assignments");
  localStorage.removeItem("portal_submissions");
  // Clear new tables
  localStorage.removeItem("portal_quizzes");
  localStorage.removeItem("portal_quiz_attempts");
  localStorage.removeItem("portal_attendance");
  localStorage.removeItem("portal_fees");
  localStorage.removeItem("portal_messages");
  localStorage.removeItem("portal_materials");
  localStorage.removeItem("portal_videos");
  localStorage.removeItem("portal_notifications");
  
  localStorage.setItem("pathshala_schema_ver", "1.2");
}

// Initialise DB states
let db = {
  users: JSON.parse(localStorage.getItem("portal_users")) || DEFAULT_USERS,
  courses: JSON.parse(localStorage.getItem("portal_courses")) || DEFAULT_COURSES,
  enrollments: JSON.parse(localStorage.getItem("portal_enrollments")) || DEFAULT_ENROLLMENTS,
  announcements: JSON.parse(localStorage.getItem("portal_announcements")) || DEFAULT_ANNOUNCEMENTS,
  assignments: JSON.parse(localStorage.getItem("portal_assignments")) || DEFAULT_ASSIGNMENTS,
  submissions: JSON.parse(localStorage.getItem("portal_submissions")) || DEFAULT_SUBMISSIONS,
  quizzes: JSON.parse(localStorage.getItem("portal_quizzes")) || DEFAULT_QUIZZES,
  quizAttempts: JSON.parse(localStorage.getItem("portal_quiz_attempts")) || DEFAULT_QUIZ_ATTEMPTS,
  attendance: JSON.parse(localStorage.getItem("portal_attendance")) || DEFAULT_ATTENDANCE,
  fees: JSON.parse(localStorage.getItem("portal_fees")) || DEFAULT_FEES,
  messages: JSON.parse(localStorage.getItem("portal_messages")) || DEFAULT_MESSAGES,
  materials: JSON.parse(localStorage.getItem("portal_materials")) || DEFAULT_MATERIALS,
  videos: JSON.parse(localStorage.getItem("portal_videos")) || DEFAULT_VIDEOS,
  notifications: JSON.parse(localStorage.getItem("portal_notifications")) || DEFAULT_NOTIFICATIONS
};

function saveDB() {
  localStorage.setItem("portal_users", JSON.stringify(db.users));
  localStorage.setItem("portal_courses", JSON.stringify(db.courses));
  localStorage.setItem("portal_enrollments", JSON.stringify(db.enrollments));
  localStorage.setItem("portal_announcements", JSON.stringify(db.announcements));
  localStorage.setItem("portal_assignments", JSON.stringify(db.assignments));
  localStorage.setItem("portal_submissions", JSON.stringify(db.submissions));
  localStorage.setItem("portal_quizzes", JSON.stringify(db.quizzes));
  localStorage.setItem("portal_quiz_attempts", JSON.stringify(db.quizAttempts));
  localStorage.setItem("portal_attendance", JSON.stringify(db.attendance));
  localStorage.setItem("portal_fees", JSON.stringify(db.fees));
  localStorage.setItem("portal_messages", JSON.stringify(db.messages));
  localStorage.setItem("portal_materials", JSON.stringify(db.materials));
  localStorage.setItem("portal_videos", JSON.stringify(db.videos));
  localStorage.setItem("portal_notifications", JSON.stringify(db.notifications));
}

function generateId(prefix) {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
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
  
  toggleForgotPasswordView(false);
  switchLoginRole(role);
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
  
  // Tab highlights
  document.querySelectorAll(".auth-tab").forEach(tab => tab.classList.remove("active"));
  const activeTab = document.getElementById(`tab-${role}`);
  if (activeTab) activeTab.classList.add("active");
  
  // Elements toggle
  const formGroupName = document.getElementById("form-group-name");
  const formGroupFacultyId = document.getElementById("form-group-faculty-id");
  const formGroupPhone = document.getElementById("form-group-phone");
  const formGroupDepartment = document.getElementById("form-group-department");
  const formGroupPassword = document.getElementById("form-group-password");
  const formGroupConfirmPassword = document.getElementById("form-group-confirm-password");
  const btnSubmit = document.getElementById("btn-auth-submit");
  const autofills = document.getElementById("demo-autofills-container");
  
  // Reset Visibility Defaults
  formGroupName.style.display = "none";
  if (formGroupFacultyId) formGroupFacultyId.style.display = "none";
  if (formGroupPhone) formGroupPhone.style.display = "none";
  if (formGroupDepartment) formGroupDepartment.style.display = "none";
  if (formGroupConfirmPassword) formGroupConfirmPassword.style.display = "none";
  
  formGroupPassword.style.display = "block";
  autofills.style.display = "none";
  
  document.getElementById("auth-name").required = false;
  if (document.getElementById("auth-faculty-id")) document.getElementById("auth-faculty-id").required = false;
  if (document.getElementById("auth-phone")) document.getElementById("auth-phone").required = false;
  if (document.getElementById("auth-department")) document.getElementById("auth-department").required = false;
  if (document.getElementById("auth-confirm-password")) document.getElementById("auth-confirm-password").required = false;
  document.getElementById("auth-password").required = true;
  
  document.getElementById("auth-main-title").innerText = "Pathshala Sign In";
  document.getElementById("auth-main-subtitle").innerText = "Access your personal dashboard";
  document.getElementById("auth-logo-badge").innerHTML = `<i data-lucide="graduation-cap"></i>`;
  
  const labelEmail = document.querySelector('label[for="auth-email"]');
  labelEmail.innerText = "Email Address *";
  
  if (role === "student") {
    btnSubmit.querySelector("span").innerText = "Sign In as Student";
    setupAutofillBox("student@bvrit.ac.in", "student123", "Student");
  } else if (role === "parent") {
    btnSubmit.querySelector("span").innerText = "Sign In as Parent";
    setupAutofillBox("parent@bvrit.ac.in", "parent123", "Parent");
  } else if (role === "faculty") {
    btnSubmit.querySelector("span").innerText = "Sign In as Faculty";
    setupAutofillBox("faculty@bvrit.ac.in", "faculty123", "Faculty");
  } else if (role === "signup") {
    document.getElementById("auth-main-title").innerText = "Student Registration";
    document.getElementById("auth-main-subtitle").innerText = "Create a new student profile";
    formGroupName.style.display = "block";
    if (formGroupConfirmPassword) formGroupConfirmPassword.style.display = "block";
    document.getElementById("auth-name").required = true;
    if (document.getElementById("auth-confirm-password")) document.getElementById("auth-confirm-password").required = true;
    btnSubmit.querySelector("span").innerText = "Register Student Account";
  } else if (role === "faculty-signup") {
    document.getElementById("auth-main-title").innerText = "Faculty Registration";
    document.getElementById("auth-main-subtitle").innerText = "Create a new faculty instructor account";
    
    formGroupName.style.display = "block";
    if (formGroupFacultyId) formGroupFacultyId.style.display = "block";
    if (formGroupPhone) formGroupPhone.style.display = "block";
    if (formGroupDepartment) formGroupDepartment.style.display = "block";
    if (formGroupConfirmPassword) formGroupConfirmPassword.style.display = "block";
    
    document.getElementById("auth-name").required = true;
    if (document.getElementById("auth-faculty-id")) document.getElementById("auth-faculty-id").required = true;
    if (document.getElementById("auth-phone")) document.getElementById("auth-phone").required = true;
    if (document.getElementById("auth-department")) document.getElementById("auth-department").required = true;
    if (document.getElementById("auth-confirm-password")) document.getElementById("auth-confirm-password").required = true;
    
    btnSubmit.querySelector("span").innerText = "Register Faculty Account";
  }
  
  lucide.createIcons();
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

// Toggle forgot password subview
let isForgotPasswordMode = false;
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
    tabs.style.display = "none";
    formGroupPass.style.display = "none";
    formGroupName.style.display = "none";
    if (autofills) autofills.style.display = "none";
    document.getElementById("auth-password").required = false;
    
    btnSubmit.querySelector("span").innerText = "Send Recovery Link";
    
    footerOptions.innerHTML = `
      <a href="#" class="auth-link" onclick="toggleForgotPasswordView(false)">Back to Sign In</a>
      <a href="#" class="auth-link" onclick="showHomeView()">Home</a>
    `;
  } else {
    tabs.style.display = "grid";
    footerOptions.innerHTML = `
      <a href="#" class="auth-link" id="link-forgot-pwd" onclick="toggleForgotPasswordView(true)">Forgot Password?</a>
      <a href="#" class="auth-link" onclick="showHomeView()"><i data-lucide="arrow-left" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:3px;"></i>Back to Homepage</a>
    `;
    switchLoginRole(currentRoleTab);
  }
  lucide.createIcons();
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("auth-email").value.trim().toLowerCase();
  
  // 1. Forgot password execution
  if (isForgotPasswordMode) {
    if (!email.endsWith("@bvrit.ac.in")) {
      showToast("Verification failed. Institutional domain @bvrit.ac.in required.", "danger");
      return;
    }
    showToast(`Password reset link dispatched to ${email}. Check your inbox.`);
    toggleForgotPasswordView(false);
    return;
  }
  
  // 2. Signup Student account
  if (currentRoleTab === "signup") {
    const name = document.getElementById("auth-name").value.trim();
    const pass = document.getElementById("auth-password").value;
    const confirmPass = document.getElementById("auth-confirm-password") ? document.getElementById("auth-confirm-password").value : pass;
    
    if (!name) {
      showToast("Please enter your full name.", "danger");
      return;
    }
    if (!email.endsWith("@bvrit.ac.in")) {
      showToast("Failed. Sign up restricted to @bvrit.ac.in domain.", "danger");
      return;
    }
    if (pass.length < 6) {
      showToast("Password must be at least 6 characters.", "danger");
      return;
    }
    if (pass !== confirmPass) {
      showToast("Password and Confirm Password do not match.", "danger");
      return;
    }
    if (db.users.some(u => u.email.toLowerCase() === email)) {
      showToast("An account with this email is already registered.", "danger");
      return;
    }
    
    const newStudent = {
      id: generateId("usr"),
      email,
      password: pass,
      name,
      role: "student"
    };
    db.users.push(newStudent);
    
    // Auto-enroll in existing courses
    db.courses.forEach(c => {
      if (!db.enrollments.some(e => e.studentId === newStudent.id && e.courseId === c.id)) {
        db.enrollments.push({
          id: generateId("enr"),
          studentId: newStudent.id,
          courseId: c.id
        });
      }
    });
    
    saveDB();
    showToast(`Student account registered! Please sign in.`);
    switchLoginRole("student");
    document.getElementById("auth-email").value = email;
    document.getElementById("auth-password").value = pass;
    return;
  }

  // 3. Signup Faculty account
  if (currentRoleTab === "faculty-signup") {
    const name = document.getElementById("auth-name").value.trim();
    const facultyId = document.getElementById("auth-faculty-id").value.trim().toUpperCase();
    const phone = document.getElementById("auth-phone").value.trim();
    const department = document.getElementById("auth-department").value.trim();
    const pass = document.getElementById("auth-password").value;
    const confirmPass = document.getElementById("auth-confirm-password").value;
    
    // Validations
    if (!name || !facultyId || !phone || !department || !email || !pass || !confirmPass) {
      showToast("Please fill in all required fields.", "danger");
      return;
    }
    if (!email.endsWith("@bvrit.ac.in")) {
      showToast("Faculty registration restricted to @bvrit.ac.in domain.", "danger");
      return;
    }
    if (pass.length < 6) {
      showToast("Password must be at least 6 characters long.", "danger");
      return;
    }
    if (pass !== confirmPass) {
      showToast("Password and Confirm Password do not match.", "danger");
      return;
    }
    // Unique Email Check
    if (db.users.some(u => u.email.toLowerCase() === email)) {
      showToast("Duplicate account: Email address is already registered.", "danger");
      return;
    }
    // Unique Faculty ID Check
    if (db.users.some(u => u.facultyId && u.facultyId.toUpperCase() === facultyId)) {
      showToast("Duplicate account: Faculty ID is already registered.", "danger");
      return;
    }
    
    const newFaculty = {
      id: generateId("usr_fac"),
      facultyId,
      email,
      password: pass,
      name,
      phone,
      department,
      role: "faculty"
    };
    
    db.users.push(newFaculty);
    saveDB();
    
    showToast(`Faculty account created successfully! Please sign in.`, "success");
    switchLoginRole("faculty");
    
    document.getElementById("auth-email").value = email;
    document.getElementById("auth-password").value = pass;
    return;
  }
  
  // 4. Standard Sign in logins
  const pass = document.getElementById("auth-password").value;
  if (!email.endsWith("@bvrit.ac.in")) {
    showToast("Access Denied. Only @bvrit.ac.in email domains are permitted.", "danger");
    return;
  }
  
  const matchedUser = db.users.find(u => u.email.toLowerCase() === email && u.password === pass && u.role === currentRoleTab);
  
  if (matchedUser) {
    currentUser = matchedUser;
    showToast(`Welcome back to Pathshala, ${matchedUser.name}!`);
    enterAppShell();
  } else {
    showToast("Invalid credentials for chosen role.", "danger");
  }
}

function handleLogout() {
  currentUser = null;
  currentSelectedClassroomId = null;
  
  document.getElementById("app-shell").style.display = "none";
  document.getElementById("view-auth").style.display = "none";
  document.getElementById("view-home").style.display = "block";
  
  // Clear credentials inputs
  document.getElementById("auth-email").value = "";
  document.getElementById("auth-password").value = "";
  
  showToast("Logged out successfully.");
}

// ==========================================
// SIDEBAR & ROUTING CONTROLS
// ==========================================
function enterAppShell() {
  document.getElementById("view-auth").style.display = "none";
  document.getElementById("app-shell").style.display = "flex";
  
  document.getElementById("user-display-name").innerText = currentUser.name;
  document.getElementById("user-display-role").innerText = currentUser.role;
  
  const initials = currentUser.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  document.getElementById("user-avatar").innerText = initials;
  
  buildSidebar();
  
  if (currentUser.role === "admin") {
    // Admin uses faculty panel as overlay for class deployers
    navigatePanel("panel-faculty-overview");
  } else if (currentUser.role === "faculty") {
    navigatePanel("panel-faculty-overview");
  } else if (currentUser.role === "student") {
    navigatePanel("panel-student-overview");
  } else if (currentUser.role === "parent") {
    navigatePanel("panel-parent-overview");
  }
  
  lucide.createIcons();
}

function buildSidebar() {
  const menu = document.getElementById("sidebar-nav");
  menu.innerHTML = "";
  
  let navItems = [];
  
  if (currentUser.role === "admin" || currentUser.role === "faculty") {
    navItems = [
      { id: "nav-fac-overview", label: "My Classrooms", icon: "book-open", panel: "panel-faculty-overview" },
      { id: "nav-fac-courses", label: "Course Management", icon: "folder-plus", panel: "panel-faculty-courses" },
      { id: "nav-fac-materials", label: "Course Materials", icon: "upload-cloud", panel: "panel-faculty-materials" },
      { id: "nav-fac-creator", label: "Quiz/Assign Creator", icon: "plus-circle", panel: "panel-faculty-creator" },
      { id: "nav-fac-attendance", label: "Attendance Register", icon: "calendar", panel: "panel-faculty-attendance" },
      { id: "nav-fac-reports", label: "Performance Reports", icon: "bar-chart-2", panel: "panel-faculty-reports" }
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
      { id: "nav-stu-profile", label: "My Profile", icon: "user", panel: "panel-student-profile" }
    ];
  } else if (currentUser.role === "parent") {
    navItems = [
      { id: "nav-par-overview", label: "Child Progress", icon: "home", panel: "panel-parent-overview" },
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
    document.getElementById(navItemId).classList.add("active");
  } else {
    // Map panel highlights fallback
    if (panelId === "panel-faculty-overview") document.getElementById("nav-fac-overview")?.classList.add("active");
    if (panelId === "panel-faculty-courses") document.getElementById("nav-fac-courses")?.classList.add("active");
    if (panelId === "panel-faculty-materials") document.getElementById("nav-fac-materials")?.classList.add("active");
    if (panelId === "panel-faculty-creator") document.getElementById("nav-fac-creator")?.classList.add("active");
    if (panelId === "panel-faculty-attendance") document.getElementById("nav-fac-attendance")?.classList.add("active");
    if (panelId === "panel-faculty-reports") document.getElementById("nav-fac-reports")?.classList.add("active");
    if (panelId === "panel-student-overview") document.getElementById("nav-stu-overview")?.classList.add("active");
    if (panelId === "panel-student-videos") document.getElementById("nav-stu-videos")?.classList.add("active");
    if (panelId === "panel-student-materials") document.getElementById("nav-stu-materials")?.classList.add("active");
    if (panelId === "panel-student-assignments") document.getElementById("nav-stu-assignments")?.classList.add("active");
    if (panelId === "panel-student-quizzes") document.getElementById("nav-stu-quizzes")?.classList.add("active");
    if (panelId === "panel-student-attendance") document.getElementById("nav-stu-attendance")?.classList.add("active");
    if (panelId === "panel-student-grades") document.getElementById("nav-stu-grades")?.classList.add("active");
    if (panelId === "panel-student-notifications") document.getElementById("nav-stu-notifications")?.classList.add("active");
    if (panelId === "panel-student-profile") document.getElementById("nav-stu-profile")?.classList.add("active");
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
  
  if (panelId === "panel-student-overview") {
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
// PANEL RENDER ENGINE
// ==========================================
function renderPanelContent(panelId) {
  
  // ------------------------------------------
  // A. STUDENT DASHBOARD RENDERING
  // ------------------------------------------
  if (panelId === "panel-student-overview") {
    const grid = document.getElementById("grid-student-courses");
    grid.innerHTML = "";
    
    // Filter student courses (enrolled or auto-assigned)
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
    
    // Find courses student is enrolled in
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
          <td><span class="badge badge-info">${m.type}</span></td>
          <td>
            <button class="btn btn-secondary" style="padding:6px 12px; font-size:11px;" onclick="showToast('Downloading document: ${m.title}')">
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
    
    // Filter out already submitted
    const submittedIds = db.submissions.filter(s => s.studentId === currentUser.id).map(s => s.assignmentId);
    const pendingAsgs = stuAsgs.filter(a => !submittedIds.includes(a.id));
    
    if (pendingAsgs.length === 0) {
      list.innerHTML = `<div class="info-item" style="text-align:center; color:var(--text-secondary); border:1px dashed var(--border);">All caught up! No pending homework assignment logs.</div>`;
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
          <td>${q.questions.length} MCQs</td>
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
    
    // Sort recent checkins first
    stuAtts.sort((a,b) => b.date.localeCompare(a.date));
    
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
    
    // Submissions
    const subs = db.submissions.filter(s => s.studentId === currentUser.id);
    // Quiz attempts
    const quizAtts = db.quizAttempts.filter(q => q.studentId === currentUser.id);
    
    if (subs.length === 0 && quizAtts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;">No graded works found on transcript records.</td></tr>`;
    } else {
      // Add assignments rows
      subs.forEach(s => {
        const c = db.courses.find(course => course.id === s.courseId);
        const asg = db.assignments.find(a => a.id === s.assignmentId);
        
        let scoreText = `<span class="badge badge-warning">Awaiting Review</span>`;
        if (s.grade !== null) scoreText = `<span class="badge badge-success">${s.grade} / 100</span>`;
        
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
      
      // Add quiz rows
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
    
    const stuNtf = db.notifications.filter(n => n.userId === currentUser.id);
    if (stuNtf.length === 0) {
      list.innerHTML = `<div class="info-item" style="text-align:center; color:var(--text-secondary);">No notifications.</div>`;
    } else {
      stuNtf.sort((a,b) => b.date.localeCompare(a.date)).forEach(n => {
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
    const child = db.users.find(u => u.id === currentUser.childId);
    if (!child) return;
    
    document.getElementById("parent-child-name").innerText = child.name;
    document.getElementById("parent-child-email").innerText = child.email;
    
    // Fetch grades summaries
    const childSubs = db.submissions.filter(s => s.studentId === child.id);
    const gradedSubs = childSubs.filter(s => s.grade !== null);
    const childQuizzes = db.quizAttempts.filter(q => q.studentId === child.id);
    
    let totalScore = 0;
    let counts = 0;
    
    gradedSubs.forEach(s => { totalScore += s.grade; counts++; });
    childQuizzes.forEach(q => { totalScore += q.score; counts++; });
    
    const avgScore = counts > 0 ? Math.round(totalScore / counts) : null;
    document.getElementById("parent-child-avg-grade").innerText = avgScore !== null ? `${avgScore}%` : "N/A";
    
    // Fetch attendance log
    const childAtts = db.attendance.filter(a => a.studentId === child.id);
    if (childAtts.length === 0) {
      document.getElementById("parent-child-attendance").innerText = "N/A";
    } else {
      const presents = childAtts.filter(a => a.status === "Present").length;
      const ratio = Math.round((presents / childAtts.length) * 100);
      document.getElementById("parent-child-attendance").innerText = `${ratio}%`;
    }
    
    // Course progress table
    const coursesTbody = document.getElementById("table-parent-courses-body");
    coursesTbody.innerHTML = "";
    
    const childEnrolls = db.enrollments.filter(e => e.studentId === child.id);
    const childEnrolledCourseIds = childEnrolls.map(e => e.courseId);
    
    if (childEnrolls.length === 0) {
      coursesTbody.innerHTML = `<tr><td colspan="4" class="text-muted" style="text-align:center;">Child not registered in any course.</td></tr>`;
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
            <td>${faculty ? faculty.name : "Unassigned"}</td>
            <td>${statusText}</td>
          `;
          coursesTbody.appendChild(tr);
        }
      });
    }
    
    // Announcements list for child's classes
    const annsList = document.getElementById("list-parent-announcements");
    annsList.innerHTML = "";
    const childAnns = db.announcements.filter(a => childEnrolledCourseIds.includes(a.courseId));
    
    if (childAnns.length === 0) {
      annsList.innerHTML = `<div class="info-item" style="text-align:center; color:var(--text-secondary);">No notice posts.</div>`;
    } else {
      childAnns.sort((a,b) => b.date.localeCompare(a.date)).forEach(ann => {
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
    const child = db.users.find(u => u.id === currentUser.childId);
    
    const childAtts = db.attendance.filter(a => a.studentId === child.id);
    childAtts.sort((a,b) => b.date.localeCompare(a.date));
    
    if (childAtts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-muted" style="text-align:center;">No presence check logs found.</td></tr>`;
    } else {
      childAtts.forEach(a => {
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
    }
  }
  else if (panelId === "panel-parent-grades") {
    const tbody = document.getElementById("table-parent-grades-body");
    tbody.innerHTML = "";
    const child = db.users.find(u => u.id === currentUser.childId);
    
    const childSubs = db.submissions.filter(s => s.studentId === child.id);
    const childQuizzes = db.quizAttempts.filter(q => q.studentId === child.id);
    
    if (childSubs.length === 0 && childQuizzes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;">No academic evaluation records found.</td></tr>`;
    } else {
      childSubs.forEach(s => {
        const c = db.courses.find(course => course.id === s.courseId);
        const asg = db.assignments.find(a => a.id === s.assignmentId);
        let scoreText = `<span class="badge badge-warning">Awaiting Review</span>`;
        if (s.grade !== null) scoreText = `<span class="badge badge-success">${s.grade} / 100</span>`;
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:700; color:var(--primary);">${c ? c.code : "N/A"}</td>
          <td style="font-weight:600;">${asg ? asg.title : "Assignment"}</td>
          <td><span class="badge badge-info">Assignment</span></td>
          <td>${scoreText}</td>
          <td style="font-size:12px; color:var(--text-secondary);">${s.feedback || "Awaiting grading review"}</td>
        `;
        tbody.appendChild(tr);
      });
      
      childQuizzes.forEach(q => {
        const c = db.courses.find(course => course.id === q.courseId);
        const quiz = db.quizzes.find(quizItem => quizItem.id === q.quizId);
        
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:700; color:var(--primary);">${c ? c.code : "N/A"}</td>
          <td style="font-weight:600;">${quiz ? quiz.title : "Quiz"}</td>
          <td><span class="badge badge-purple" style="background:rgba(168,85,247,0.08); color:#a855f7; border:1px solid rgba(168,85,247,0.15);">Quiz</span></td>
          <td><span class="badge badge-success">${q.score} / 100</span></td>
          <td style="font-size:12px; color:var(--text-secondary);">Automated Evaluation System.</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }
  else if (panelId === "panel-parent-fees") {
    const tbody = document.getElementById("table-parent-fees-body");
    tbody.innerHTML = "";
    
    const parentFees = db.fees.filter(f => f.parentId === currentUser.id);
    if (parentFees.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align:center;">No billing registers found.</td></tr>`;
    } else {
      parentFees.forEach(f => {
        const isPaid = f.status === "Paid";
        const badgeClass = isPaid ? "badge-success" : "badge-warning";
        const actionBtn = isPaid 
          ? `<span style="font-size:11px; font-weight:600; color:var(--text-secondary);">Receipt: ${f.receipt}</span>` 
          : `<button class="btn btn-primary" style="padding:6px 12px; font-size:11px;" onclick="handlePayFee('${f.id}')">Pay Invoice</button>`;
          
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="font-weight:600;">${f.title}</td>
          <td>${f.due}</td>
          <td style="font-weight:700; color:var(--text-primary);">$${f.amount}</td>
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
    
    const parentMsgs = db.messages.filter(m => m.parentId === currentUser.id);
    if (parentMsgs.length === 0) {
      list.innerHTML = `<div class="info-item" style="text-align:center; color:var(--text-secondary);">No messages from teachers.</div>`;
    } else {
      parentMsgs.forEach(m => {
        const faculty = db.users.find(u => u.id === m.facultyId);
        const item = document.createElement("div");
        item.className = "info-item";
        item.innerHTML = `
          <div class="info-item-title">
            <span>From: ${faculty ? faculty.name : "Teacher"}</span>
            <span class="badge badge-info" style="font-size:9px;">Inbox message</span>
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
    
    const parentNtf = db.notifications.filter(n => n.userId === currentUser.id);
    if (parentNtf.length === 0) {
      list.innerHTML = `<div class="info-item" style="text-align:center; color:var(--text-secondary);">No notifications.</div>`;
    } else {
      parentNtf.sort((a,b) => b.date.localeCompare(a.date)).forEach(n => {
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
    
    // If admin is active, render all courses, else faculty-specific
    const courses = currentUser.role === "admin" ? db.courses : db.courses.filter(c => c.facultyId === currentUser.id);
    
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
    
    const courses = currentUser.role === "admin" ? db.courses : db.courses.filter(c => c.facultyId === currentUser.id);
    
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
    
    // Fill Parent direct messaging selector
    const parentSelect = document.getElementById("msg-parent-select");
    parentSelect.innerHTML = "";
    
    const enrolls = db.enrollments.filter(e => e.courseId === course.id);
    
    // Find parents of enrolled students
    const childIds = enrolls.map(e => e.studentId);
    const parents = db.users.filter(u => u.role === "parent" && childIds.includes(u.childId));
    
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
    
    // Class Roster
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
    
    // Classroom assignments list
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
    
    // Pending submissions grading
    const subsList = document.getElementById("list-faculty-submissions");
    subsList.innerHTML = "";
    
    const pendingSubs = db.submissions.filter(s => s.courseId === course.id && s.grade === null);
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
            <span>${student ? student.name : "Unknown Student"}</span>
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
    // Fill course selectors
    const pdfSelect = document.getElementById("pdf-course-select");
    const videoSelect = document.getElementById("video-course-select");
    pdfSelect.innerHTML = "";
    videoSelect.innerHTML = "";
    
    const courses = db.courses.filter(c => c.facultyId === currentUser.id || currentUser.role === "admin");
    courses.forEach(c => {
      const opt1 = document.createElement("option"); opt1.value = c.id; opt1.innerText = c.title; pdfSelect.appendChild(opt1);
      const opt2 = document.createElement("option"); opt2.value = c.id; opt2.innerText = c.title; videoSelect.appendChild(opt2);
    });
    
    // Existing Materials Table
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
    
    const courses = db.courses.filter(c => c.facultyId === currentUser.id || currentUser.role === "admin");
    courses.forEach(c => {
      const opt1 = document.createElement("option"); opt1.value = c.id; opt1.innerText = c.title; qSelect.appendChild(opt1);
      const opt2 = document.createElement("option"); opt2.value = c.id; opt2.innerText = c.title; aSelect.appendChild(opt2);
    });
  }
  else if (panelId === "panel-faculty-attendance") {
    // Fill course select
    const attSelect = document.getElementById("attendance-course-select");
    attSelect.innerHTML = "";
    
    const courses = db.courses.filter(c => c.facultyId === currentUser.id || currentUser.role === "admin");
    courses.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.innerText = c.title;
      attSelect.appendChild(opt);
    });
    
    // Set default date to today
    if (!document.getElementById("attendance-register-date").value) {
      document.getElementById("attendance-register-date").value = new Date().toISOString().split("T")[0];
    }
    
    loadAttendanceRegisterSheet();
  }
  else if (panelId === "panel-faculty-reports") {
    const myCourses = db.courses.filter(c => c.facultyId === currentUser.id || currentUser.role === "admin");
    const myCourseIds = myCourses.map(c => c.id);
    
    // Calculate global stats counters
    const enrolls = db.enrollments.filter(e => myCourseIds.includes(e.courseId));
    const totalStudents = new Set(enrolls.map(e => e.studentId)).size;
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
    
    // Render student grades report list
    const gradesBody = document.getElementById("table-faculty-reports-grades-body");
    gradesBody.innerHTML = "";
    
    // Distinct students enrolled in courses
    const studentIds = [...new Set(enrolls.map(e => e.studentId))];
    if (studentIds.length === 0) {
      gradesBody.innerHTML = `<tr><td colspan="4" class="text-muted" style="text-align:center;">No student enrolled yet.</td></tr>`;
    } else {
      studentIds.forEach(sid => {
        const student = db.users.find(u => u.id === sid);
        if (student) {
          const subs = db.submissions.filter(s => s.studentId === sid && myCourseIds.includes(s.courseId));
          const graded = subs.filter(s => s.grade !== null);
          const quizAttempts = db.quizAttempts.filter(qa => qa.studentId === sid && myCourseIds.includes(qa.courseId));
          
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
    
    // Recent quiz attempts list
    const quizzesBody = document.getElementById("table-faculty-reports-quizzes-body");
    quizzesBody.innerHTML = "";
    
    const attempts = db.quizAttempts.filter(a => myCourseIds.includes(a.courseId));
    attempts.sort((a,b) => b.date.localeCompare(a.date));
    
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
// MOCK VIDEO PLAYER TRIGGERS
// ==========================================
function triggerWatchVideoModal(videoTitle) {
  document.getElementById("modal-watch-video-title").innerText = videoTitle;
  openModal("modal-watch-video");
  lucide.createIcons();
}

// ==========================================
// STUDENT INTERACTIVE QUIZ LOGIC
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

function handleQuizSubmit(e) {
  e.preventDefault();
  const quizId = document.getElementById("take-quiz-id").value;
  const courseId = document.getElementById("take-quiz-course-id").value;
  
  const quiz = db.quizzes.find(q => q.id === quizId);
  if (!quiz) return;
  
  let correctCount = 0;
  quiz.questions.forEach((q, qidx) => {
    const radios = document.getElementsByName(`q-option-${qidx}`);
    let selectedVal = null;
    radios.forEach(r => {
      if (r.checked) selectedVal = parseInt(r.value);
    });
    
    if (selectedVal === q.correct) {
      correctCount++;
    }
  });
  
  const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);
  
  // Save Attempt
  const attempt = {
    id: generateId("qza"),
    quizId,
    studentId: currentUser.id,
    courseId,
    score: scorePercent,
    date: new Date().toISOString().split("T")[0]
  };
  
  db.quizAttempts.push(attempt);
  saveDB();
  
  closeModal("modal-take-quiz");
  showToast(`Quiz completed! You scored ${scorePercent}%!`);
  
  // Confetti trigger
  if (scorePercent >= 70 && typeof confetti === "function") {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  }
  
  renderPanelContent("panel-student-quizzes");
}

// ==========================================
// STUDENT PROFILE UPDATES
// ==========================================
function handleProfileUpdate(e) {
  e.preventDefault();
  const name = document.getElementById("profile-name").value.trim();
  const pass = document.getElementById("profile-password").value;
  
  const userIdx = db.users.findIndex(u => u.id === currentUser.id);
  if (userIdx > -1) {
    db.users[userIdx].name = name;
    if (pass.trim().length >= 6) {
      db.users[userIdx].password = pass.trim();
      showToast("Profile credentials and password updated.");
    } else {
      showToast("Profile details updated.");
    }
    
    currentUser = db.users[userIdx];
    saveDB();
    enterAppShell();
  }
}

// ==========================================
// STUDENT ASSIGNMENT UPLOADS
// ==========================================
function triggerSubmitModal(asgId, courseId, title) {
  document.getElementById("submit-assignment-id").value = asgId;
  document.getElementById("submit-course-id").value = courseId;
  document.getElementById("modal-submit-title").innerText = `Submit: ${title}`;
  document.getElementById("submit-content").value = "";
  openModal("modal-submit-assignment");
}

function handleAssignmentSubmit(e) {
  e.preventDefault();
  const asgId = document.getElementById("submit-assignment-id").value;
  const courseId = document.getElementById("submit-course-id").value;
  const content = document.getElementById("submit-content").value.trim();
  
  const newSub = {
    id: generateId("sub"),
    assignmentId: asgId,
    courseId,
    studentId: currentUser.id,
    content,
    submittedAt: new Date().toISOString().split("T")[0],
    grade: null,
    feedback: null
  };
  
  db.submissions.push(newSub);
  
  // Send notification to parent
  const parent = db.users.find(u => u.role === "parent" && u.childId === currentUser.id);
  if (parent) {
    db.notifications.push({
      id: generateId("ntf"),
      userId: parent.id,
      text: `${currentUser.name} uploaded a submission for assignment homework.`,
      date: new Date().toISOString().split("T")[0],
      read: false
    });
  }
  
  saveDB();
  
  closeModal("modal-submit-assignment");
  showToast("Assignment submitted successfully!");
  
  if (typeof confetti === "function") {
    confetti({ particleCount: 40, spread: 50, origin: { x: 0.1 } });
    confetti({ particleCount: 40, spread: 50, origin: { x: 0.9 } });
  }
  
  renderPanelContent("panel-student-assignments");
}

// ==========================================
// PARENT FEE INVOICES PAYMENT SIMULATOR
// ==========================================
function handlePayFee(feeId) {
  const feeIdx = db.fees.findIndex(f => f.id === feeId);
  if (feeIdx > -1) {
    const receiptNum = `RCP-${Math.floor(10000 + Math.random() * 90000)}`;
    db.fees[feeIdx].status = "Paid";
    db.fees[feeIdx].receipt = receiptNum;
    
    // Add parent notification
    db.notifications.push({
      id: generateId("ntf"),
      userId: currentUser.id,
      text: `Fee transaction completed successfully. Reference ID: ${receiptNum}`,
      date: new Date().toISOString().split("T")[0],
      read: false
    });
    
    saveDB();
    showToast(`Payment of $${db.fees[feeIdx].amount} processed. Receipt: ${receiptNum}`);
    
    if (typeof confetti === "function") {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    
    renderPanelContent("panel-parent-fees");
  }
}

// ==========================================
// FACULTY UPLOADS (VIDEOS & REFERENCE PDFs)
// ==========================================
function handleUploadPDF(e) {
  e.preventDefault();
  const courseId = document.getElementById("pdf-course-select").value;
  const title = document.getElementById("pdf-title").value.trim();
  const link = document.getElementById("pdf-link").value.trim();
  
  const newPDF = {
    id: generateId("mat"),
    courseId,
    title,
    type: "PDF",
    link
  };
  
  db.materials.push(newPDF);
  
  // Alert enrolled students
  const enrollments = db.enrollments.filter(enr => enr.courseId === courseId);
  enrollments.forEach(enr => {
    db.notifications.push({
      id: generateId("ntf"),
      userId: enr.studentId,
      text: `New study reference notes posted: "${title}".`,
      date: new Date().toISOString().split("T")[0],
      read: false
    });
  });
  
  saveDB();
  showToast(`Material "${title}" successfully published.`);
  e.target.reset();
  
  renderPanelContent("panel-faculty-materials");
}

function handleUploadVideo(e) {
  e.preventDefault();
  const courseId = document.getElementById("video-course-select").value;
  const title = document.getElementById("video-title").value.trim();
  const link = document.getElementById("video-link").value.trim();
  
  const newVid = {
    id: generateId("vid"),
    courseId,
    title,
    link
  };
  
  db.videos.push(newVid);
  
  // Alert enrolled students
  const enrollments = db.enrollments.filter(enr => enr.courseId === courseId);
  enrollments.forEach(enr => {
    db.notifications.push({
      id: generateId("ntf"),
      userId: enr.studentId,
      text: `New video lecture published: "${title}".`,
      date: new Date().toISOString().split("T")[0],
      read: false
    });
  });
  
  saveDB();
  showToast(`Video lecture "${title}" uploaded.`);
  e.target.reset();
  
  renderPanelContent("panel-faculty-materials");
}

// ==========================================
// FACULTY QUIZ & ASSIGNMENT DESIGNERS
// ==========================================
function handleCreateQuiz(e) {
  e.preventDefault();
  const courseId = document.getElementById("quiz-course-select").value;
  const title = document.getElementById("quiz-title").value.trim();
  
  const qText = document.getElementById("quiz-q-text").value.trim();
  const optA = document.getElementById("quiz-opt-a").value.trim();
  const optB = document.getElementById("quiz-opt-b").value.trim();
  const optC = document.getElementById("quiz-opt-c").value.trim();
  const correct = parseInt(document.getElementById("quiz-correct-opt").value);
  
  const newQuiz = {
    id: generateId("qz"),
    courseId,
    title,
    questions: [
      { text: qText, options: [optA, optB, optC], correct }
    ]
  };
  
  db.quizzes.push(newQuiz);
  
  // Alert student
  const enrollments = db.enrollments.filter(enr => enr.courseId === courseId);
  enrollments.forEach(enr => {
    db.notifications.push({
      id: generateId("ntf"),
      userId: enr.studentId,
      text: `A new interactive quiz is now active: "${title}".`,
      date: new Date().toISOString().split("T")[0],
      read: false
    });
  });
  
  saveDB();
  showToast(`Interactive quiz "${title}" deployed successfully.`);
  e.target.reset();
}

function handleCreateAssignment(e) {
  e.preventDefault();
  // Form elements varies depending on panel context (creation desk vs classroom page)
  let courseId, title, due, desc;
  
  const courseSelect = document.getElementById("assign-course-select");
  if (courseSelect.offsetParent !== null) {
    // Designer Panel
    courseId = courseSelect.value;
    title = document.getElementById("assign-title").value.trim();
    due = document.getElementById("assign-due").value;
    desc = document.getElementById("assign-desc").value.trim();
  } else {
    // Classroom Page Creator
    courseId = currentSelectedClassroomId;
    title = document.getElementById("assign-title").value.trim();
    due = document.getElementById("assign-due").value;
    desc = document.getElementById("assign-desc").value.trim();
  }
  
  const newAsg = {
    id: generateId("asg"),
    courseId,
    title,
    desc,
    due
  };
  
  db.assignments.push(newAsg);
  
  // Notify students
  const enrolls = db.enrollments.filter(enr => enr.courseId === courseId);
  enrolls.forEach(enr => {
    db.notifications.push({
      id: generateId("ntf"),
      userId: enr.studentId,
      text: `New homework assignment published: "${title}".`,
      date: new Date().toISOString().split("T")[0],
      read: false
    });
  });
  
  saveDB();
  showToast(`Assignment "${title}" published.`);
  e.target.reset();
  
  if (currentSelectedClassroomId) {
    renderPanelContent("panel-faculty-classroom");
  }
}

// ==========================================
// FACULTY SUBMISSION EVALUATOR
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

function handleGradeSubmit(e) {
  e.preventDefault();
  const subId = document.getElementById("grade-submission-id").value;
  const gradeVal = parseInt(document.getElementById("grade-value").value);
  const feedback = document.getElementById("grade-feedback").value.trim();
  
  const subIdx = db.submissions.findIndex(s => s.id === subId);
  if (subIdx > -1) {
    db.submissions[subIdx].grade = gradeVal;
    db.submissions[subIdx].feedback = feedback;
    
    // Notify student
    const studentId = db.submissions[subIdx].studentId;
    const cId = db.submissions[subIdx].courseId;
    const course = db.courses.find(c => c.id === cId);
    
    db.notifications.push({
      id: generateId("ntf"),
      userId: studentId,
      text: `Your submission for assignment has been graded. Score: ${gradeVal}/100.`,
      date: new Date().toISOString().split("T")[0],
      read: false
    });
    
    // Notify parent
    const parent = db.users.find(u => u.role === "parent" && u.childId === studentId);
    if (parent) {
      db.notifications.push({
        id: generateId("ntf"),
        userId: parent.id,
        text: `${currentUser.name} graded ${db.users.find(u=>u.id===studentId).name}'s submission: ${gradeVal}/100.`,
        date: new Date().toISOString().split("T")[0],
        read: false
      });
    }
    
    saveDB();
    closeModal("modal-grade-submission");
    showToast("Evaluation grade successfully committed.");
    
    if (gradeVal >= 85 && typeof confetti === "function") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    
    renderPanelContent("panel-faculty-classroom");
  }
}

// ==========================================
// FACULTY CLASSROOM NOTICE POSTER
// ==========================================
function handleCreateAnnouncement(e) {
  e.preventDefault();
  const text = document.getElementById("announce-text").value.trim();
  
  const newAnn = {
    id: generateId("ann"),
    courseId: currentSelectedClassroomId,
    text,
    date: new Date().toISOString().split("T")[0]
  };
  
  db.announcements.push(newAnn);
  
  // Alert student enrollments
  const enrolls = db.enrollments.filter(enr => enr.courseId === currentSelectedClassroomId);
  enrolls.forEach(enr => {
    db.notifications.push({
      id: generateId("ntf"),
      userId: enr.studentId,
      text: `New bulletin notice posted on the notice board.`,
      date: new Date().toISOString().split("T")[0],
      read: false
    });
  });
  
  saveDB();
  showToast("Notice posted to the classroom board.");
  e.target.reset();
  
  renderPanelContent("panel-faculty-classroom");
}

// ==========================================
// FACULTY DIRECT MESSAGING PARENTS
// ==========================================
function handleSendTeacherMessage(e) {
  e.preventDefault();
  const parentId = document.getElementById("msg-parent-select").value;
  const text = document.getElementById("msg-parent-body").value.trim();
  
  const newMsg = {
    id: generateId("msg"),
    parentId,
    facultyId: currentUser.id,
    text,
    date: new Date().toISOString().split("T")[0]
  };
  
  db.messages.push(newMsg);
  
  // Notify parent
  db.notifications.push({
    id: generateId("ntf"),
    userId: parentId,
    text: `New direct advisory message received from ${currentUser.name}.`,
    date: new Date().toISOString().split("T")[0],
    read: false
  });
  
  saveDB();
  showToast("Advisory message sent successfully to parent inbox.");
  e.target.reset();
}

// ==========================================
// FACULTY ATTENDANCE SHEETS LOGS
// ==========================================
function loadAttendanceRegisterSheet() {
  const courseId = document.getElementById("attendance-course-select").value;
  const dateStr = document.getElementById("attendance-register-date").value;
  
  const tbody = document.getElementById("table-faculty-attendance-register-body");
  tbody.innerHTML = "";
  
  if (!courseId) return;
  
  const enrolls = db.enrollments.filter(e => e.courseId === courseId);
  if (enrolls.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-muted" style="text-align:center;">No students enrolled.</td></tr>`;
    return;
  }
  
  enrolls.forEach(e => {
    const student = db.users.find(u => u.id === e.studentId);
    if (student) {
      // Check if attendance already logged for student on date
      const record = db.attendance.find(a => a.studentId === student.id && a.courseId === courseId && a.date === dateStr);
      const isChecked = record ? record.status === "Present" : true; // Default present
      
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight:600;">${student.name}</td>
        <td>${student.email}</td>
        <td>
          <input type="checkbox" id="att-chk-${student.id}" style="width:16px; height:16px; cursor:pointer;" ${isChecked ? "checked" : ""}>
        </td>
      `;
      tbody.appendChild(tr);
    }
  });
}

function saveAttendanceRegisterSheet() {
  const courseId = document.getElementById("attendance-course-select").value;
  const dateStr = document.getElementById("attendance-register-date").value;
  
  if (!courseId || !dateStr) return;
  
  const enrolls = db.enrollments.filter(e => e.courseId === courseId);
  enrolls.forEach(e => {
    const student = db.users.find(u => u.id === e.studentId);
    if (student) {
      const chk = document.getElementById(`att-chk-${student.id}`);
      const status = chk && chk.checked ? "Present" : "Absent";
      
      const recIdx = db.attendance.findIndex(a => a.studentId === student.id && a.courseId === courseId && a.date === dateStr);
      if (recIdx > -1) {
        db.attendance[recIdx].status = status;
      } else {
        db.attendance.push({
          id: generateId("att"),
          studentId: student.id,
          courseId,
          date: dateStr,
          status
        });
      }
      
      // Notify parent if child is absent
      if (status === "Absent") {
        const parent = db.users.find(u => u.role === "parent" && u.childId === student.id);
        if (parent) {
          db.notifications.push({
            id: generateId("ntf"),
            userId: parent.id,
            text: `Absence alert: ${student.name} was marked absent on ${dateStr}.`,
            date: new Date().toISOString().split("T")[0],
            read: false
          });
        }
      }
    }
  });
  
  saveDB();
  showToast("Attendance register sheet committed.");
}

// ==========================================
// FACULTY COURSE MANAGEMENT CONTROLLERS
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

function handleSaveCourse(e) {
  e.preventDefault();
  
  const editId = document.getElementById("course-edit-id").value;
  const title = document.getElementById("course-title-input").value.trim();
  const code = document.getElementById("course-code-input").value.trim().toUpperCase();
  const duration = document.getElementById("course-duration-input").value.trim();
  const category = document.getElementById("course-category-input").value.trim();
  const desc = document.getElementById("course-desc-input").value.trim();
  const resources = document.getElementById("course-resources-input").value.trim();
  
  if (editId) {
    // Edit existing course
    const idx = db.courses.findIndex(c => c.id === editId);
    if (idx > -1) {
      db.courses[idx].title = title;
      db.courses[idx].code = code;
      db.courses[idx].duration = duration;
      db.courses[idx].category = category;
      db.courses[idx].desc = desc;
      db.courses[idx].resources = resources;
      
      saveDB();
      closeModal("modal-course-form");
      showToast(`Course "${code}: ${title}" updated successfully.`);
    }
  } else {
    // Create new course
    const newCourseId = generateId("crs");
    const newCourse = {
      id: newCourseId,
      code,
      title,
      facultyId: currentUser.id,
      desc,
      duration,
      category,
      resources
    };
    
    db.courses.push(newCourse);
    
    // Automatically assign/enroll all students so course immediately appears in their course list
    const students = db.users.filter(u => u.role === "student");
    students.forEach(stu => {
      if (!db.enrollments.some(en => en.studentId === stu.id && en.courseId === newCourseId)) {
        db.enrollments.push({
          id: generateId("enr"),
          studentId: stu.id,
          courseId: newCourseId
        });
      }
      
      // Send notification alert
      db.notifications.push({
        id: generateId("ntf"),
        userId: stu.id,
        text: `New course published: ${code} - ${title}. Now available in your courses list.`,
        date: new Date().toISOString().split("T")[0],
        read: false
      });
    });
    
    saveDB();
    closeModal("modal-course-form");
    showToast(`Course "${code}: ${title}" created and published!`);
    
    if (typeof confetti === "function") {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  }
  
  renderPanelContent("panel-faculty-courses");
  renderPanelContent("panel-faculty-overview");
  renderPanelContent("panel-student-overview");
}

function triggerDeleteCourseConfirmation(courseId) {
  const course = db.courses.find(c => c.id === courseId);
  if (!course) return;
  
  document.getElementById("delete-course-target-id").value = course.id;
  document.getElementById("delete-course-confirm-msg").innerText = 
    `Are you sure you want to delete the course "${course.code}: ${course.title}"?`;
    
  openModal("modal-delete-course-confirm");
}

function executeDeleteCourse() {
  const courseId = document.getElementById("delete-course-target-id").value;
  const idx = db.courses.findIndex(c => c.id === courseId);
  
  if (idx > -1) {
    const deletedCourse = db.courses[idx];
    
    // Remove course from db
    db.courses.splice(idx, 1);
    
    // Remove all associated enrollments
    db.enrollments = db.enrollments.filter(e => e.courseId !== courseId);
    
    saveDB();
    closeModal("modal-delete-course-confirm");
    showToast(`Course "${deletedCourse.code}" permanently deleted.`, "danger");
    
    renderPanelContent("panel-faculty-courses");
    renderPanelContent("panel-faculty-overview");
    renderPanelContent("panel-student-overview");
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
window.addEventListener("DOMContentLoaded", () => {
  // Pre-initialize icons on first page render
  lucide.createIcons();
});
