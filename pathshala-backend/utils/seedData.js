const User = require('../models/user');
const Course = require('../models/course');
const {
  Enrollment,
  Announcement,
  Assignment,
  Submission,
  Quiz,
  QuizAttempt,
  Attendance,
  Fee,
  Message,
  Material,
  Video,
  Notification,
  AcademicRecord
} = require('../models/schemas');

const seedInitialData = async () => {
  try {
    // Clear and rebuild to ensure exact consistency
    console.log('Seeding Pathshala Real Academic System Data for Sathwik (24211a6797)...');

    await User.deleteMany({});
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    await Announcement.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await Quiz.deleteMany({});
    await QuizAttempt.deleteMany({});
    await Attendance.deleteMany({});
    await Fee.deleteMany({});
    await Message.deleteMany({});
    await Material.deleteMany({});
    await Video.deleteMany({});
    await Notification.deleteMany({});
    await AcademicRecord.deleteMany({});

    // 1. Users
    const admin = await User.create({
      name: 'Pathshala Administrator',
      email: 'admin@bvrit.ac.in',
      password: 'admin123',
      role: 'admin'
    });

    const profRao = await User.create({
      name: 'Dr. K. Rao',
      email: 'k.rao@bvrit.ac.in',
      password: 'faculty123',
      role: 'faculty',
      department: 'Computer Science & Engineering'
    });

    const profPriya = await User.create({
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@bvrit.ac.in',
      password: 'faculty123',
      role: 'faculty',
      department: 'Computer Science & Engineering'
    });

    const profAnil = await User.create({
      name: 'Dr. Anil Kumar',
      email: 'anil.kumar@bvrit.ac.in',
      password: 'faculty123',
      role: 'faculty',
      department: 'Computer Science & Engineering'
    });

    const profMeena = await User.create({
      name: 'Dr. Meena Reddy',
      email: 'meena.reddy@bvrit.ac.in',
      password: 'faculty123',
      role: 'faculty',
      department: 'Computer Science & Engineering'
    });

    const profRajesh = await User.create({
      name: 'Prof. Rajesh Kumar',
      email: 'rajesh.kumar@bvrit.ac.in',
      password: 'faculty123',
      role: 'faculty',
      department: 'Computer Science & Engineering'
    });

    const profNeha = await User.create({
      name: 'Dr. Neha Rao',
      email: 'neha.rao@bvrit.ac.in',
      password: 'faculty123',
      role: 'faculty',
      department: 'Computer Science & Engineering'
    });

    // Central Student: Sathwik
    const student = await User.create({
      name: 'Sathwik',
      email: 'student@bvrit.ac.in',
      password: 'student123',
      role: 'student',
      studentId: '24211a6797',
      mobileNumber: '9876543210',
      department: 'Computer Science & Engineering',
      semester: 'Semester 4'
    });

    // Parent
    const parent = await User.create({
      name: "Sathwik's Parent",
      email: 'parent@bvrit.ac.in',
      password: 'parent123',
      role: 'parent',
      childRoll: '24211a6797',
      mobileNumber: '9876543210',
      childId: student._id
    });

    // 2. Active 6 Semester 4 Classrooms/Courses
    const c1 = await Course.create({
      code: 'CS401',
      title: 'Machine Learning',
      desc: 'Supervised learning, linear & logistic regression, neural networks, decision trees, and model evaluation techniques.',
      duration: '14 Weeks',
      category: 'Semester 4 Core',
      resources: '• Regression Models Lecture Slides\n• Neural Networks Formulation Guide PDF\n• Lab Dataset: Scikit-learn datasets',
      facultyId: profRao._id
    });

    const c2 = await Course.create({
      code: 'CS402',
      title: 'Computer Networks',
      desc: 'OSI Reference Model, TCP/IP architecture, socket programming, routing algorithms, flow and congestion control.',
      duration: '14 Weeks',
      category: 'Semester 4 Core',
      resources: '• TCP/IP Protocol Suite RFCs\n• Wireshark Packet Analysis Manual\n• Subnetting & IP Addressing Sheets',
      facultyId: profPriya._id
    });

    const c3 = await Course.create({
      code: 'CS403',
      title: 'Software Engineering',
      desc: 'Agile methodologies, requirements engineering, UML modeling, architectural patterns, CI/CD and software testing.',
      duration: '14 Weeks',
      category: 'Semester 4 Core',
      resources: '• SRS Documentation IEEE Template\n• UML Design Patterns Handbook\n• Scrum Framework Reference Guide',
      facultyId: profAnil._id
    });

    const c4 = await Course.create({
      code: 'CS404',
      title: 'Compiler Design',
      desc: 'Lexical analysis, syntax analysis (LL/LR parsers), syntax-directed translation, intermediate code generation, and optimization.',
      duration: '14 Weeks',
      category: 'Semester 4 Core',
      resources: '• Lex & Yacc Tutorial Notes\n• Parsing Table Construction Slides\n• Code Optimization Reference Document',
      facultyId: profMeena._id
    });

    const c5 = await Course.create({
      code: 'CS405',
      title: 'Data Mining',
      desc: 'Data preprocessing, association rule mining (Apriori, FP-Growth), classification, clustering (K-Means, DBSCAN), and warehouse OLAP.',
      duration: '14 Weeks',
      category: 'Semester 4 Core',
      resources: '• Data Preprocessing Python Notebook\n• Apriori Algorithm Handout\n• WEKA Tool User Handbook',
      facultyId: profRajesh._id
    });

    const c6 = await Course.create({
      code: 'CS406',
      title: 'Artificial Intelligence',
      desc: 'State space search, uninformed & heuristic search (A*, IDA*), adversarial game trees (Minimax, Alpha-Beta), and knowledge representation.',
      duration: '14 Weeks',
      category: 'Semester 4 Core',
      resources: '• Search Algorithms Implementation Guide\n• Alpha-Beta Pruning Practice Sheet\n• First-Order Logic Inference Slides',
      facultyId: profNeha._id
    });

    const allCourses = [c1, c2, c3, c4, c5, c6];

    // 3. Enrollments for Sathwik in all 6 courses
    await Enrollment.create(allCourses.map(c => ({
      studentId: student._id,
      courseId: c._id
    })));

    // Seed AcademicRecords
    await AcademicRecord.create([
      { studentId: student._id, semester: 'Semester 1', sgpa: 7.8, cleared: true },
      { studentId: student._id, semester: 'Semester 2', sgpa: 8.2, cleared: true },
      { studentId: student._id, semester: 'Semester 3', sgpa: 8.7, cleared: true },
      { studentId: student._id, semester: 'Semester 4', sgpa: 8.9, cleared: true }
    ]);


    // 4. Attendance: Exactly 120 Total Working Days (110 Present, 10 Absent = 91.67% => 92%)
    const attendanceLogs = [];
    const baseDate = new Date('2026-02-01');
    let dayCount = 0;
    let presentAdded = 0;
    let absentAdded = 0;

    // Distribute 120 records across 6 courses (20 classes each)
    allCourses.forEach((c, cIdx) => {
      // 20 sessions per course
      // Course attendance: c1=94% (19/20 or 18/20), c2=91%, c3=93%, c4=89%, c5=90%, c6=95%
      const absentsForCourse = [1, 2, 1, 3, 2, 1][cIdx]; // Total = 10 absents exactly!
      
      for (let s = 1; s <= 20; s++) {
        const isAbsent = s <= absentsForCourse;
        const status = isAbsent ? 'Absent' : 'Present';
        if (isAbsent) absentAdded++; else presentAdded++;
        
        const dateObj = new Date(baseDate.getTime() + (dayCount * 1.5 * 24 * 60 * 60 * 1000));
        const dateStr = dateObj.toISOString().split('T')[0];
        dayCount++;

        attendanceLogs.push({
          studentId: student._id,
          courseId: c._id,
          date: dateStr,
          status
        });
      }
    });

    await Attendance.create(attendanceLogs);
    console.log(`Generated ${attendanceLogs.length} Attendance records: ${presentAdded} Present, ${absentAdded} Absent (92%).`);

    // 5. Assignments
    const asg1 = await Assignment.create({
      courseId: c1._id,
      title: 'Assignment 3 — Regression Models',
      desc: 'Implement multivariate linear regression and polynomial curve fitting on the housing pricing dataset.',
      due: '2026-08-24'
    });

    const asg2 = await Assignment.create({
      courseId: c2._id,
      title: 'Assignment 2 — TCP/IP Protocol Analysis',
      desc: 'Capture packet traces using Wireshark and analyze the TCP 3-way handshake and congestion window adjustments.',
      due: '2026-08-27'
    });

    const asg3 = await Assignment.create({
      courseId: c3._id,
      title: 'Requirements Engineering Case Study Report',
      desc: 'Prepare a comprehensive IEEE 830 compliant Software Requirements Specification (SRS) for the Hospital Management System.',
      due: '2026-08-29'
    });

    const asg4 = await Assignment.create({
      courseId: c4._id,
      title: 'Lexical Analyzer & Syntax Tree Parser',
      desc: 'Design a Lex specification for C-tokens and construct an LALR(1) parser using Yacc.',
      due: '2026-09-02'
    });

    const asg5 = await Assignment.create({
      courseId: c5._id,
      title: 'Association Rule Mining & Apriori Algorithm',
      desc: 'Implement the Apriori algorithm in Python to generate frequent itemsets and association rules with min-support 0.3.',
      due: '2026-09-05'
    });

    const asg6 = await Assignment.create({
      courseId: c6._id,
      title: 'Heuristic A* Search Algorithm Lab',
      desc: 'Implement A* search algorithm for the 8-puzzle game problem with Manhattan distance heuristic.',
      due: '2026-09-08'
    });

    // 6. Submissions (Completed & Evaluated)
    await Submission.create([
      {
        assignmentId: asg2._id,
        courseId: c2._id,
        studentId: student._id,
        content: 'Submitted Wireshark packet capture logs and TCP analysis diagrams. Sequence and ACK numbers verified.',
        submittedAt: '2026-08-15',
        grade: 91,
        feedback: 'Thorough packet capture analysis and clean window size tracking graphs. Excellent work!'
      },
      {
        assignmentId: asg1._id,
        courseId: c1._id,
        studentId: student._id,
        content: 'Python notebooks with gradient descent implementations and regression residual graphs.',
        submittedAt: '2026-08-18',
        grade: 94,
        feedback: 'Outstanding mathematical derivation and accurate loss curves convergence.'
      }
    ]);

    // 7. Quizzes
    const q1 = await Quiz.create({
      courseId: c1._id,
      title: 'Machine Learning — Neural Networks Quiz',
      questions: [
        {
          text: 'Which activation function is most commonly used in hidden layers of deep neural networks?',
          options: ['ReLU', 'Sigmoid', 'Linear', 'Binary Step'],
          correct: 0
        },
        {
          text: 'What optimization technique helps prevent overfitting by penalizing large weights?',
          options: ['L2 Regularization (Ridge)', 'Batch Normalization', 'Gradient Clipping', 'Max Pooling'],
          correct: 0
        }
      ]
    });

    const q2 = await Quiz.create({
      courseId: c2._id,
      title: 'Computer Networks — Routing Protocols Quiz',
      questions: [
        {
          text: 'Which routing protocol utilizes the Bellman-Ford distance vector algorithm?',
          options: ['RIP', 'OSPF', 'BGP', 'IS-IS'],
          correct: 0
        }
      ]
    });

    // 8. Quiz Attempts
    await QuizAttempt.create({
      quizId: q1._id,
      studentId: student._id,
      courseId: c1._id,
      score: 95,
      date: '2026-08-12'
    });

    // 8.5 Attendance Records
    const attendanceRecords = [];
    const seedDate = new Date('2026-08-20');
    let workingDays = 0;
    for (let i = 0; i < 150 && workingDays < 120; i++) {
      const d = new Date(seedDate);
      d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      
      workingDays++;
      // Assign roughly 110 presents and 10 absents
      const status = workingDays <= 110 ? 'Present' : 'Absent';
      
      attendanceRecords.push({
        studentId: student._id,
        courseId: c1._id,
        date: d.toISOString().split('T')[0],
        status
      });
    }
    await Attendance.insertMany(attendanceRecords);

    // 9. Fee Structure & Payment History
    // Total Fee = ₹1,20,000 | Paid = ₹90,000 | Remaining = ₹30,000
    await Fee.create([
      {
        parentId: parent._id,
        childId: student._id,
        title: 'Tuition Fee Installment 1',
        due: '2026-06-10',
        amount: 40000,
        status: 'Paid',
        receipt: 'RCP-2026-0812'
      },
      {
        parentId: parent._id,
        childId: student._id,
        title: 'Academic & Lab Fee Installment 2',
        due: '2026-07-15',
        amount: 30000,
        status: 'Paid',
        receipt: 'RCP-2026-1490'
      },
      {
        parentId: parent._id,
        childId: student._id,
        title: 'Infrastructure & Library Installment 3',
        due: '2026-08-05',
        amount: 20000,
        status: 'Paid',
        receipt: 'RCP-2026-2184'
      },
      {
        parentId: parent._id,
        childId: student._id,
        title: 'Final Semester Fee Installment 4',
        due: '2026-09-10',
        amount: 30000,
        status: 'Pending',
        receipt: null
      }
    ]);

    // 10. Faculty Messages
    await Message.create({
      parentId: parent._id,
      facultyId: profRao._id,
      text: 'Sathwik has performed exceptionally well in the latest Machine Learning lab assignments and has maintained consistent attendance.',
      date: 'Today, 10:30 AM'
    });

    // 11. Announcements & College Notices
    await Announcement.create([
      {
        courseId: c1._id,
        text: 'Parent-Teacher Academic Conference: Scheduled for August 25, 2026 at 10:00 AM via institutional portal.',
        date: '2026-08-20'
      },
      {
        courseId: c2._id,
        text: 'Semester Fee Installment Due: Next semester installment due on or before September 10, 2026.',
        date: '2026-08-19'
      },
      {
        courseId: c3._id,
        text: 'Semester IV Comprehensive Examination: Scheduled to commence from September 15, 2026.',
        date: '2026-08-18'
      }
    ]);

    // 12. Materials & Reference Documents
    await Material.create([
      {
        courseId: c1._id,
        title: 'CS401 Regression Models & Neural Formulations',
        type: 'PDF Document',
        link: 'materials/cs401_regression.pdf'
      },
      {
        courseId: c2._id,
        title: 'CS402 TCP/IP Protocol Analysis & RFCs',
        type: 'PDF Document',
        link: 'materials/cs402_tcpip.pdf'
      },
      {
        courseId: c3._id,
        title: 'CS403 Software Requirements Specification (SRS) IEEE Template',
        type: 'PDF Document',
        link: 'materials/cs403_srs.pdf'
      }
    ]);

    // 13. Lecture Stream Videos
    await Video.create([
      {
        courseId: c1._id,
        title: 'Machine Learning: Gradient Descent & Loss Minimization',
        link: 'lessons/ml_gradient_descent.mp4'
      },
      {
        courseId: c2._id,
        title: 'Computer Networks: TCP Sliding Window & Flow Control',
        link: 'lessons/cn_flow_control.mp4'
      }
    ]);

    // 14. Notifications
    await Notification.create([
      {
        userId: student._id,
        text: 'Dr. K. Rao graded your Machine Learning Assignment 3 with 94/100.',
        date: 'Today',
        read: false
      },
      {
        userId: parent._id,
        text: 'Dr. K. Rao (Faculty Mentor) posted a new academic performance advisory regarding Sathwik.',
        date: 'Today',
        read: false
      },
      {
        userId: parent._id,
        text: 'Fee Reminder: Final Semester installment of ₹30,000 is due on September 10, 2026.',
        date: 'Yesterday',
        read: false
      }
    ]);

    console.log('Pathshala Database Seeding Successfully Completed for Sathwik (24211a6797).');
  } catch (err) {
    console.error('Seeding Error:', err.message);
  }
};

// If run directly
if (require.main === module) {
  const connectDB = require('../config/db');
  require('dotenv').config();
  connectDB().then(async () => {
    await seedInitialData();
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
} else {
  module.exports = seedInitialData;
}