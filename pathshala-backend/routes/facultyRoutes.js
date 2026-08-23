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
  Message,
  Notification
} = require('../models/Schemas');

const router = express.Router();

// Middleware: all routes below are protected and restricted to faculty or admin
router.use(protect);
router.use(authorize('faculty', 'admin'));

// Helper: helper function to filter courses owned by faculty (or all if admin)
const getFacultyCourseFilter = (req) => {
  return req.user.role === 'admin' ? {} : { facultyId: req.user.id };
};

// @route GET /api/faculty/courses
// @desc Get courses taught by authenticated faculty (or all if admin)
router.get('/courses', async (req, res, next) => {
  try {
    const filter = getFacultyCourseFilter(req);
    const courses = await Course.find(filter)
      .populate('facultyId', 'name email role')
      .sort({ createdAt: -1 });

    // Include enrollment count for each course
    const courseIds = courses.map(c => c._id);
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });

    const countMap = {};
    enrollments.forEach(e => {
      const cid = e.courseId.toString();
      countMap[cid] = (countMap[cid] || 0) + 1;
    });

    const results = courses.map(c => ({
      ...c.toObject(),
      enrolledCount: countMap[c._id.toString()] || 0
    }));

    res.json({ success: true, count: results.length, courses: results });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/faculty/classroom/:courseId
// @desc Get complete classroom bundle (roster, assignments, pending submissions, notices, parent contacts)
router.get('/classroom/:courseId', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId).populate('facultyId', 'name email');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role === 'faculty' && course.facultyId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized for this classroom' });
    }

    const courseId = course._id;

    // 1. Roster of enrolled students
    const enrollments = await Enrollment.find({ courseId }).populate('studentId', 'name email');
    const roster = enrollments.map(e => e.studentId).filter(Boolean);
    const studentIds = roster.map(s => s._id);

    // 2. Parents of enrolled students
    const parents = await User.find({
      role: 'parent',
      childId: { $in: studentIds }
    }).populate('childId', 'name email');

    // 3. Course assignments with submission counts
    const assignments = await Assignment.find({ courseId }).sort({ createdAt: -1 });
    const allSubs = await Submission.find({ courseId });

    const assignmentStats = assignments.map(a => {
      const subs = allSubs.filter(s => s.assignmentId.toString() === a._id.toString());
      return {
        ...a.toObject(),
        submissionCount: subs.length
      };
    });

    // 4. Pending submissions awaiting grading
    const pendingSubmissions = await Submission.find({ courseId, grade: null })
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title desc due')
      .sort({ createdAt: -1 });

    // 5. Announcements / notices
    const announcements = await Announcement.find({ courseId }).sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      course,
      roster,
      parents: parents.map(p => ({
        id: p._id,
        name: p.name,
        email: p.email,
        child: p.childId ? { id: p.childId._id, name: p.childId.name, email: p.childId.email } : null
      })),
      assignments: assignmentStats,
      pendingSubmissions,
      announcements
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/faculty/assignments
// @desc Create assignment & notify enrolled students
router.post('/assignments', async (req, res, next) => {
  try {
    const { courseId, title, desc, due } = req.body;

    if (!courseId || !title || !desc || !due) {
      return res.status(400).json({ success: false, message: 'Please provide courseId, title, description, and due date' });
    }

    const assignment = await Assignment.create({
      courseId,
      title: title.trim(),
      desc: desc.trim(),
      due: due.trim()
    });

    // Notify enrolled students
    const enrollments = await Enrollment.find({ courseId });
    const today = new Date().toISOString().split('T')[0];

    for (const enr of enrollments) {
      await Notification.create({
        userId: enr.studentId,
        text: `New homework assignment published: "${title.trim()}".`,
        date: today,
        read: false
      });
    }

    res.status(201).json({
      success: true,
      message: `Assignment "${assignment.title}" published.`,
      assignment
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/faculty/submissions/pending
// @desc Get all pending submissions across faculty's courses
router.get('/submissions/pending', async (req, res, next) => {
  try {
    const filter = getFacultyCourseFilter(req);
    const courses = await Course.find(filter);
    const courseIds = courses.map(c => c._id);

    const pending = await Submission.find({ courseId: { $in: courseIds }, grade: null })
      .populate('studentId', 'name email')
      .populate('courseId', 'code title')
      .populate('assignmentId', 'title due')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: pending.length, submissions: pending });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/faculty/submissions/:id/grade
// @desc Grade/evaluate a student submission
router.post('/submissions/:id/grade', async (req, res, next) => {
  try {
    const { grade, feedback } = req.body;

    if (grade === undefined || grade === null || isNaN(Number(grade))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid numeric grade (0-100)' });
    }

    const numericGrade = Math.max(0, Math.min(100, Math.round(Number(grade))));

    const submission = await Submission.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title')
      .populate('courseId', 'code title');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    submission.grade = numericGrade;
    submission.feedback = feedback ? feedback.trim() : '';
    await submission.save();

    const today = new Date().toISOString().split('T')[0];

    // Notify student
    await Notification.create({
      userId: submission.studentId._id,
      text: `Your submission for "${submission.assignmentId ? submission.assignmentId.title : 'Assignment'}" has been graded. Score: ${numericGrade}/100.`,
      date: today,
      read: false
    });

    // Notify parent if linked
    const parent = await User.findOne({ role: 'parent', childId: submission.studentId._id });
    if (parent) {
      await Notification.create({
        userId: parent._id,
        text: `${req.user.name} graded ${submission.studentId.name}'s submission: ${numericGrade}/100.`,
        date: today,
        read: false
      });
    }

    res.json({
      success: true,
      message: 'Evaluation grade successfully committed.',
      submission
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/faculty/quizzes
// @desc Create multi-question quiz & notify enrolled students
router.post('/quizzes', async (req, res, next) => {
  try {
    const { courseId, title, questions } = req.body;

    if (!courseId || !title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide courseId, title, and at least one question' });
    }

    const quiz = await Quiz.create({
      courseId,
      title: title.trim(),
      questions: questions.map(q => ({
        text: q.text.trim(),
        options: q.options.map(o => o.trim()),
        correct: Number(q.correct)
      }))
    });

    // Notify enrolled students
    const enrollments = await Enrollment.find({ courseId });
    const today = new Date().toISOString().split('T')[0];

    for (const enr of enrollments) {
      await Notification.create({
        userId: enr.studentId,
        text: `A new interactive quiz is now active: "${title.trim()}".`,
        date: today,
        read: false
      });
    }

    res.status(201).json({
      success: true,
      message: `Interactive quiz "${quiz.title}" deployed successfully.`,
      quiz
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/faculty/materials
// @desc Upload reference PDF/document & notify students
router.post('/materials', async (req, res, next) => {
  try {
    const { courseId, title, link, type } = req.body;

    if (!courseId || !title || !link) {
      return res.status(400).json({ success: false, message: 'Please provide courseId, title, and link' });
    }

    const material = await Material.create({
      courseId,
      title: title.trim(),
      link: link.trim(),
      type: type ? type.trim() : 'PDF'
    });

    const enrollments = await Enrollment.find({ courseId });
    const today = new Date().toISOString().split('T')[0];

    for (const enr of enrollments) {
      await Notification.create({
        userId: enr.studentId,
        text: `New study reference notes posted: "${title.trim()}".`,
        date: today,
        read: false
      });
    }

    res.status(201).json({
      success: true,
      message: `Material "${material.title}" successfully published.`,
      material
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/faculty/videos
// @desc Upload video lecture link & notify students
router.post('/videos', async (req, res, next) => {
  try {
    const { courseId, title, link } = req.body;

    if (!courseId || !title || !link) {
      return res.status(400).json({ success: false, message: 'Please provide courseId, title, and link' });
    }

    const video = await Video.create({
      courseId,
      title: title.trim(),
      link: link.trim()
    });

    const enrollments = await Enrollment.find({ courseId });
    const today = new Date().toISOString().split('T')[0];

    for (const enr of enrollments) {
      await Notification.create({
        userId: enr.studentId,
        text: `New video lecture published: "${title.trim()}".`,
        date: today,
        read: false
      });
    }

    res.status(201).json({
      success: true,
      message: `Video lecture "${video.title}" uploaded.`,
      video
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/faculty/announcements
// @desc Post notice board announcement & notify students
router.post('/announcements', async (req, res, next) => {
  try {
    const { courseId, text } = req.body;

    if (!courseId || !text) {
      return res.status(400).json({ success: false, message: 'Please provide courseId and text' });
    }

    const today = new Date().toISOString().split('T')[0];
    const announcement = await Announcement.create({
      courseId,
      text: text.trim(),
      date: today
    });

    const enrollments = await Enrollment.find({ courseId });

    for (const enr of enrollments) {
      await Notification.create({
        userId: enr.studentId,
        text: `New bulletin notice posted on the notice board.`,
        date: today,
        read: false
      });
    }

    res.status(201).json({
      success: true,
      message: 'Notice posted to the classroom board.',
      announcement
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/faculty/messages
// @desc Send direct teacher message to parent & notify parent
router.post('/messages', async (req, res, next) => {
  try {
    const { parentId, text } = req.body;

    if (!parentId || !text) {
      return res.status(400).json({ success: false, message: 'Please provide parentId and message text' });
    }

    const today = new Date().toISOString().split('T')[0];
    const message = await Message.create({
      parentId,
      facultyId: req.user.id,
      text: text.trim(),
      date: today
    });

    await Notification.create({
      userId: parentId,
      text: `New direct advisory message received from ${req.user.name}.`,
      date: today,
      read: false
    });

    res.status(201).json({
      success: true,
      message: 'Advisory message sent successfully to parent inbox.',
      sentMessage: message
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/faculty/attendance
// @desc Get attendance register for a course on a date
router.get('/attendance', async (req, res, next) => {
  try {
    const { courseId, date } = req.query;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Please specify courseId' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    const enrollments = await Enrollment.find({ courseId }).populate('studentId', 'name email');
    const existingRecords = await Attendance.find({ courseId, date: targetDate });
    const recordMap = new Map(existingRecords.map(r => [r.studentId.toString(), r.status]));

    const rosterSheet = enrollments.map(e => {
      const stu = e.studentId;
      if (!stu) return null;
      return {
        studentId: stu._id,
        name: stu.name,
        email: stu.email,
        status: recordMap.get(stu._id.toString()) || 'Present'
      };
    }).filter(Boolean);

    res.json({
      success: true,
      courseId,
      date: targetDate,
      roster: rosterSheet
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/faculty/attendance
// @desc Save batch attendance register (upsert records + alert parent if Absent)
router.post('/attendance', async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body;

    if (!courseId || !date || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Please provide courseId, date, and records array' });
    }

    const today = new Date().toISOString().split('T')[0];

    for (const rec of records) {
      const studentId = rec.studentId;
      const status = rec.status === 'Absent' ? 'Absent' : 'Present';

      await Attendance.findOneAndUpdate(
        { studentId, courseId, date },
        { status },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // If Absent, notify parent
      if (status === 'Absent') {
        const student = await User.findById(studentId);
        const parent = await User.findOne({ role: 'parent', childId: studentId });

        if (parent && student) {
          await Notification.create({
            userId: parent._id,
            text: `Absence alert: ${student.name} was marked absent on ${date}.`,
            date: today,
            read: false
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Attendance register sheet committed.'
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/faculty/reports
// @desc Aggregate faculty analytics (total students, total quizzes, total assignments, student performance table, recent quiz attempts)
router.get('/reports', async (req, res, next) => {
  try {
    const filter = getFacultyCourseFilter(req);
    const courses = await Course.find(filter);
    const courseIds = courses.map(c => c._id);

    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
    const uniqueStudentIds = [...new Set(enrollments.map(e => e.studentId.toString()))];

    const totalStudents = uniqueStudentIds.length;
    const totalQuizzes = await Quiz.countDocuments({ courseId: { $in: courseIds } });
    const totalAssignments = await Assignment.countDocuments({ courseId: { $in: courseIds } });

    // Performance for each enrolled student
    const students = await User.find({ _id: { $in: uniqueStudentIds } });
    const allSubs = await Submission.find({ courseId: { $in: courseIds } });
    const allQuizAttempts = await QuizAttempt.find({ courseId: { $in: courseIds } });

    const studentBreakdown = students.map(stu => {
      const stuSubs = allSubs.filter(s => s.studentId.toString() === stu._id.toString() && s.grade !== null);
      const stuQuizAtts = allQuizAttempts.filter(q => q.studentId.toString() === stu._id.toString());

      let totalScore = 0;
      let count = 0;

      stuSubs.forEach(s => { totalScore += s.grade; count++; });
      stuQuizAtts.forEach(q => { totalScore += q.score; count++; });

      const avgScore = count > 0 ? `${Math.round(totalScore / count)}%` : 'N/A';

      return {
        id: stu._id,
        name: stu.name,
        email: stu.email,
        averageScore: avgScore,
        quizAttemptsCount: stuQuizAtts.length,
        evaluatedSubmissionsCount: stuSubs.length
      };
    });

    // Recent quiz attempts list
    const recentAttempts = await QuizAttempt.find({ courseId: { $in: courseIds } })
      .populate('studentId', 'name email')
      .populate('quizId', 'title')
      .sort({ date: -1, createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalQuizzes,
        totalAssignments
      },
      studentBreakdown,
      recentQuizAttempts: recentAttempts
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/faculty/sync
// @desc Get all data for faculty (courses, enrollments, submissions, quizzes, attempts, attendance, etc.)
router.get('/sync', async (req, res, next) => {
  try {
    const filter = getFacultyCourseFilter(req);
    const courses = await Course.find(filter);
    const courseIds = courses.map(c => c._id);

    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } });
    const assignments = await Assignment.find({ courseId: { $in: courseIds } });
    const submissions = await Submission.find({ courseId: { $in: courseIds } });
    const quizzes = await Quiz.find({ courseId: { $in: courseIds } });
    const quizAttempts = await QuizAttempt.find({ courseId: { $in: courseIds } });
    const attendance = await Attendance.find({ courseId: { $in: courseIds } });
    const materials = await Material.find({ courseId: { $in: courseIds } });
    const videos = await Video.find({ courseId: { $in: courseIds } });
    const announcements = await Announcement.find({ courseId: { $in: courseIds } });

    res.json({
      success: true,
      courses,
      enrollments,
      assignments,
      submissions,
      quizzes,
      quizAttempts,
      attendance,
      materials,
      videos,
      announcements
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
