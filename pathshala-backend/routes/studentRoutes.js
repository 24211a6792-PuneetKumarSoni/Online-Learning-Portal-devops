const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');
const {
  Enrollment,
  Assignment,
  Submission,
  Quiz,
  QuizAttempt,
  Attendance,
  Material,
  Video,
  Announcement,
  Notification,
  Fee
} = require('../models/Schemas');

const router = express.Router();

// Middleware: all routes below are protected and restricted to student (or admin)
router.use(protect);
router.use(authorize('student', 'admin'));

// @route GET /api/student/courses
// @desc Get all courses student is enrolled in
router.get('/courses', async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id })
      .populate({
        path: 'courseId',
        populate: { path: 'facultyId', select: 'name email role' }
      });

    const courses = enrollments.map(e => e.courseId).filter(Boolean);
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/student/materials
// @desc Get reference materials for enrolled courses
router.get('/materials', async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id });
    const courseIds = enrollments.map(e => e.courseId);

    const materials = await Material.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'code title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: materials.length, materials });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/student/videos
// @desc Get video lectures for enrolled courses
router.get('/videos', async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id });
    const courseIds = enrollments.map(e => e.courseId);

    const videos = await Video.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'code title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: videos.length, videos });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/student/assignments
// @desc Get assignments for enrolled courses with student submission info
router.get('/assignments', async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id });
    const courseIds = enrollments.map(e => e.courseId);

    const assignments = await Assignment.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'code title')
      .sort({ createdAt: -1 });

    const submissions = await Submission.find({ studentId: req.user.id });
    const submissionMap = new Map(submissions.map(s => [s.assignmentId.toString(), s]));

    const result = assignments.map(a => {
      const sub = submissionMap.get(a._id.toString());
      return {
        ...a.toObject(),
        submission: sub || null,
        isSubmitted: !!sub
      };
    });

    res.json({ success: true, assignments: result });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/student/submissions
// @desc Submit homework for an assignment
router.post('/submissions', async (req, res, next) => {
  try {
    const { assignmentId, courseId, content } = req.body;

    if (!assignmentId || !courseId || !content) {
      return res.status(400).json({ success: false, message: 'Please provide assignmentId, courseId, and content' });
    }

    const existingSub = await Submission.findOne({ assignmentId, studentId: req.user.id });
    if (existingSub) {
      existingSub.content = content.trim();
      existingSub.submittedAt = new Date().toISOString().split('T')[0];
      await existingSub.save();
      return res.json({ success: true, message: 'Submission updated successfully', submission: existingSub });
    }

    const today = new Date().toISOString().split('T')[0];
    const submission = await Submission.create({
      assignmentId,
      courseId,
      studentId: req.user.id,
      content: content.trim(),
      submittedAt: today
    });

    // Notify parent if linked
    const parent = await User.findOne({ role: 'parent', childId: req.user.id });
    if (parent) {
      await Notification.create({
        userId: parent._id,
        text: `${req.user.name} uploaded a submission for assignment homework.`,
        date: today,
        read: false
      });
    }

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully!',
      submission
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/student/submissions
// @desc Get all submissions for logged-in student
router.get('/submissions', async (req, res, next) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.id })
      .populate('assignmentId', 'title desc due')
      .populate('courseId', 'code title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/student/quizzes
// @desc Get quizzes for enrolled courses with student attempt status
router.get('/quizzes', async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id });
    const courseIds = enrollments.map(e => e.courseId);

    const quizzes = await Quiz.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'code title')
      .sort({ createdAt: -1 });

    const attempts = await QuizAttempt.find({ studentId: req.user.id });
    const attemptMap = new Map(attempts.map(a => [a.quizId.toString(), a]));

    const result = quizzes.map(q => {
      const att = attemptMap.get(q._id.toString());
      return {
        ...q.toObject(),
        attempt: att || null,
        isAttempted: !!att
      };
    });

    res.json({ success: true, quizzes: result });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/student/quizzes/attempt
// @desc Submit quiz attempt and auto-grade
router.post('/quizzes/attempt', async (req, res, next) => {
  try {
    const { quizId, courseId, answers, score: manualScore } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let calculatedScore;

    if (manualScore !== undefined && typeof manualScore === 'number') {
      calculatedScore = Math.max(0, Math.min(100, Math.round(manualScore)));
    } else if (Array.isArray(answers)) {
      let correctCount = 0;
      quiz.questions.forEach((q, idx) => {
        if (answers[idx] !== undefined && Number(answers[idx]) === q.correct) {
          correctCount++;
        }
      });
      calculatedScore = quiz.questions.length > 0
        ? Math.round((correctCount / quiz.questions.length) * 100)
        : 100;
    } else {
      return res.status(400).json({ success: false, message: 'Please provide answers or score' });
    }

    const today = new Date().toISOString().split('T')[0];

    const attempt = await QuizAttempt.create({
      quizId,
      courseId: courseId || quiz.courseId,
      studentId: req.user.id,
      score: calculatedScore,
      date: today
    });

    res.status(201).json({
      success: true,
      score: calculatedScore,
      attempt
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/student/attendance
// @desc Get attendance records and computed ratio for student
router.get('/attendance', async (req, res, next) => {
  try {
    const attendance = await Attendance.find({ studentId: req.user.id })
      .populate('courseId', 'code title')
      .sort({ date: -1 });

    const total = attendance.length;
    const presents = attendance.filter(a => a.status === 'Present').length;
    const ratio = total > 0 ? Math.round((presents / total) * 100) : null;

    res.json({
      success: true,
      totalRecords: total,
      presentCount: presents,
      attendanceRatio: ratio !== null ? `${ratio}%` : 'N/A',
      ratioNumber: ratio,
      records: attendance
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/student/grades
// @desc Get combined academic evaluations (assignments + quizzes)
router.get('/grades', async (req, res, next) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.id })
      .populate('assignmentId', 'title desc')
      .populate('courseId', 'code title')
      .sort({ submittedAt: -1 });

    const quizAttempts = await QuizAttempt.find({ studentId: req.user.id })
      .populate('quizId', 'title')
      .populate('courseId', 'code title')
      .sort({ date: -1 });

    res.json({
      success: true,
      assignments: submissions,
      quizzes: quizAttempts
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/student/announcements
// @desc Get notice board announcements for enrolled courses
router.get('/announcements', async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id });
    const courseIds = enrollments.map(e => e.courseId);

    const announcements = await Announcement.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'code title')
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, count: announcements.length, announcements });
  } catch (err) {
    next(err);
  }
});


// @route GET /api/student/sync
// @desc Get all data for student in one call
router.get('/sync', async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const studentUser = await require('../models/User').findById(studentId);

    const enrollments = await Enrollment.find({ studentId }).populate({
      path: 'courseId',
      populate: { path: 'facultyId', select: 'name email role' }
    });
    const courses = enrollments.map(e => e.courseId).filter(Boolean);
    const courseIds = courses.map(c => c._id);

    const materials = await Material.find({ courseId: { $in: courseIds } }).populate('courseId', 'code title');
    const videos = await Video.find({ courseId: { $in: courseIds } }).populate('courseId', 'code title');
    const assignments = await Assignment.find({ courseId: { $in: courseIds } }).populate('courseId', 'code title');
    const submissions = await Submission.find({ studentId }).populate('assignmentId').populate('courseId', 'code title');
    const quizzes = await Quiz.find({ courseId: { $in: courseIds } }).populate('courseId', 'code title');
    const quizAttempts = await QuizAttempt.find({ studentId }).populate('quizId').populate('courseId', 'code title');
    const attendance = await Attendance.find({ studentId }).populate('courseId', 'code title');
    const announcements = await Announcement.find({ courseId: { $in: courseIds } }).populate('courseId', 'code title');
    const notifications = await Notification.find({ userId: studentId });
    const fees = await Fee.find({ studentId });
    const academicRecords = await require('../models/Schemas').AcademicRecord.find({ studentId });

    res.json({
      success: true,
      student: {
        cgpa: studentUser.cgpa
      },
      courses,
      materials,
      videos,
      assignments,
      submissions,
      quizzes,
      quizAttempts,
      attendance,
      announcements,
      notifications,
      fees,
      academicRecords
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
