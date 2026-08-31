const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Course = require('../models/course');
const User = require('../models/user');
const {
  Enrollment,
  Assignment,
  Submission,
  Quiz,
  QuizAttempt,
  Attendance,
  Announcement,
  Fee,
  Message,
  Notification
} = require('../models/schemas');

const router = express.Router();

// Middleware: all parent routes protected & restricted to parent (or admin)
router.use(protect);
router.use(authorize('parent', 'admin'));

// Helper: retrieve parent's linked child
const getParentChild = async (req) => {
  if (req.user.childId) {
    return await User.findById(req.user.childId);
  }
  // No fallback to random student; strict lookup
  return null;
};

// @route GET /api/parent/dashboard
// @desc Get parent dashboard overview (actual data, no mock)
router.get('/dashboard', async (req, res, next) => {
  try {
    const parentName = req.user.name;
    const child = await getParentChild(req);
    
    if (!child) {
      return res.json({
        success: true,
        data: {
          parentName,
          childLinked: false,
          message: 'No student linked to this parent account.'
        }
      });
    }

    const childId = child._id;

    // Attendance
    const attendanceRecords = await Attendance.find({ studentId: childId });
    let attendanceRatio = 'N/A';
    if (attendanceRecords.length > 0) {
      const presents = attendanceRecords.filter(a => a.status === 'Present').length;
      attendanceRatio = `${Math.round((presents / attendanceRecords.length) * 100)}%`;
    }

    // Courses
    const enrollments = await Enrollment.find({ studentId: childId }).populate({
      path: 'courseId',
      populate: { path: 'facultyId' }
    });
    const enrolledCourses = enrollments.map(e => ({
      code: e.courseId ? e.courseId.code : 'N/A',
      title: e.courseId ? e.courseId.title : 'N/A',
      faculty: (e.courseId && e.courseId.facultyId) ? e.courseId.facultyId.name : 'Faculty'
    }));

    // Fees Due
    const pendingFees = await Fee.find({ parentId: req.user._id, status: 'Pending' });
    let totalFeeDue = 0;
    pendingFees.forEach(fee => totalFeeDue += fee.amount);

    // Recent Activity (Submissions & Quizzes)
    const submissions = await Submission.find({ studentId: childId, grade: { $ne: null } })
      .populate('courseId', 'code title')
      .populate('assignmentId', 'title')
      .sort({ submittedAt: -1 })
      .limit(3);
    
    const quizzes = await QuizAttempt.find({ studentId: childId })
      .populate('quizId', 'title')
      .populate('courseId', 'code title')
      .sort({ date: -1 })
      .limit(3);

    const activities = [
      ...submissions.map(s => ({
        type: 'submission',
        course: s.courseId ? s.courseId.code : 'Course',
        title: s.assignmentId ? s.assignmentId.title : 'Assignment Evaluated',
        score: s.grade,
        date: new Date(s.submittedAt || Date.now()).toLocaleDateString()
      })),
      ...quizzes.map(q => ({
        type: 'quizAttempt',
        course: q.courseId ? q.courseId.code : 'Course',
        title: q.quizId ? q.quizId.title : 'Quiz Attempted',
        score: q.score,
        date: new Date(q.date || Date.now()).toLocaleDateString()
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

    // Notifications (Announcements)
    const courseIds = enrollments.map(e => e.courseId ? e.courseId._id : null).filter(Boolean);
    const notifications = await Announcement.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'title')
      .sort({ date: -1 })
      .limit(3);

    res.json({
      success: true,
      data: {
        parentName,
        childLinked: true,
        child: {
          name: child.name,
          rollNumber: child.studentId || child.childRoll,
          department: child.department || 'N/A',
          semester: child.semester || 'N/A',
          cgpa: child.cgpa || 'N/A'
        },
        attendancePercent: attendanceRatio,
        cgpa: child.cgpa || 'N/A',
        enrolledCourses,
        pendingFeesAmount: totalFeeDue,
        recentActivity: activities,
        notifications: notifications.map(n => ({
          title: n.title,
          course: n.courseId ? n.courseId.title : 'General',
          date: n.date
        }))
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/parent/child
// @desc Get child overview (name, email, avg grade, attendance %, course progress table, announcements)
router.get('/child', async (req, res, next) => {
  try {
    const child = await getParentChild(req);
    if (!child) {
      return res.status(404).json({ success: false, message: 'No linked child student record found' });
    }

    const childId = child._id;

    // 1. Fetch child submissions & quizzes to compute avg grade
    const childSubs = await Submission.find({ studentId: childId, grade: { $ne: null } });
    const childQuizzes = await QuizAttempt.find({ studentId: childId });

    let totalScore = 0;
    let counts = 0;

    childSubs.forEach(s => { totalScore += s.grade; counts++; });
    childQuizzes.forEach(q => { totalScore += q.score; counts++; });

    const avgScore = counts > 0 ? `${Math.round(totalScore / counts)}%` : 'N/A';

    // 2. Fetch attendance log to compute attendance ratio
    const childAtts = await Attendance.find({ studentId: childId });
    let attendanceRatio = 'N/A';
    if (childAtts.length > 0) {
      const presents = childAtts.filter(a => a.status === 'Present').length;
      attendanceRatio = `${Math.round((presents / childAtts.length) * 100)}%`;
    }

    // 3. Child course progress table
    const childEnrolls = await Enrollment.find({ studentId: childId }).populate({
      path: 'courseId',
      populate: { path: 'facultyId', select: 'name email' }
    });

    const allSubs = await Submission.find({ studentId: childId });

    const coursesProgress = childEnrolls.map(e => {
      const c = e.courseId;
      if (!c) return null;

      const subsInCourse = allSubs.filter(s => s.courseId.toString() === c._id.toString());
      const gradedInCourse = subsInCourse.filter(s => s.grade !== null);

      let status = 'No Submissions';
      if (subsInCourse.length > 0) {
        status = gradedInCourse.length === subsInCourse.length ? 'Evaluated' : 'Pending Review';
      }

      return {
        id: c._id,
        code: c.code,
        title: c.title,
        faculty: c.facultyId ? c.facultyId.name : 'Unassigned',
        status
      };
    }).filter(Boolean);

    // 4. Announcements for child's courses
    const childCourseIds = childEnrolls.map(e => e.courseId ? e.courseId._id : null).filter(Boolean);
    const announcements = await Announcement.find({ courseId: { $in: childCourseIds } })
      .populate('courseId', 'code title')
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      child: {
        id: child._id,
        name: child.name,
        email: child.email,
        avgGrade: avgScore,
        attendanceRatio,
        courses: coursesProgress
      },
      announcements
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/parent/attendance
// @desc Get child attendance history and ratio
router.get('/attendance', async (req, res, next) => {
  try {
    const child = await getParentChild(req);
    if (!child) {
      return res.status(404).json({ success: false, message: 'No linked child record found' });
    }

    const attendance = await Attendance.find({ studentId: child._id })
      .populate('courseId', 'code title')
      .sort({ date: -1 });

    const presents = attendance.filter(a => a.status === 'Present').length;
    const ratio = attendance.length > 0 ? `${Math.round((presents / attendance.length) * 100)}%` : 'N/A';

    res.json({
      success: true,
      child: { id: child._id, name: child.name },
      attendanceRatio: ratio,
      records: attendance
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/parent/grades
// @desc Get child grades (evaluated assignments + quizzes)
router.get('/grades', async (req, res, next) => {
  try {
    const child = await getParentChild(req);
    if (!child) {
      return res.status(404).json({ success: false, message: 'No linked child record found' });
    }

    const submissions = await Submission.find({ studentId: child._id })
      .populate('assignmentId', 'title desc')
      .populate('courseId', 'code title')
      .sort({ submittedAt: -1 });

    const quizzes = await QuizAttempt.find({ studentId: child._id })
      .populate('quizId', 'title')
      .populate('courseId', 'code title')
      .sort({ date: -1 });

    res.json({
      success: true,
      child: { id: child._id, name: child.name },
      assignments: submissions,
      quizzes
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/parent/fees
// @desc Get billing invoices for parent
router.get('/fees', async (req, res, next) => {
  try {
    const fees = await Fee.find({ parentId: req.user.id })
      .populate('childId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: fees.length,
      fees
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/parent/fees/:id/pay
// @desc Pay fee invoice (generates receipt and notification)
router.post('/fees/:id/pay', async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    if (fee.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Fee invoice is already paid', receipt: fee.receipt });
    }

    const receiptNum = `RCP-${Math.floor(10000 + Math.random() * 90000)}`;
    fee.status = 'Paid';
    fee.receipt = receiptNum;
    await fee.save();

    const today = new Date().toISOString().split('T')[0];

    // Create notification
    await Notification.create({
      userId: req.user.id,
      text: `Fee transaction completed successfully. Reference ID: ${receiptNum}`,
      date: today,
      read: false
    });

    res.json({
      success: true,
      message: `Payment of $${fee.amount} processed. Receipt: ${receiptNum}`,
      receipt: receiptNum,
      fee
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/parent/messages
// @desc Get direct teacher messages received from faculty
router.get('/messages', async (req, res, next) => {
  try {
    const messages = await Message.find({ parentId: req.user.id })
      .populate('facultyId', 'name email')
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/parent/announcements
// @desc Get notices for child's courses
router.get('/announcements', async (req, res, next) => {
  try {
    const child = await getParentChild(req);
    if (!child) {
      return res.status(404).json({ success: false, message: 'No linked child record found' });
    }

    const childEnrolls = await Enrollment.find({ studentId: child._id });
    const courseIds = childEnrolls.map(e => e.courseId);

    const announcements = await Announcement.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'code title')
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/parent/sync
// @desc Get all data for parent (dashboard, child details, attendance, grades, messages, fees, announcements)
router.get('/sync', async (req, res, next) => {
  try {
    const child = await getParentChild(req);
    if (!child) {
      return res.status(404).json({ success: false, message: 'No linked child record found' });
    }

    const childId = child._id;

    const childEnrolls = await Enrollment.find({ studentId: childId });
    const courseIds = childEnrolls.map(e => e.courseId);

    const courses = await Course.find({ _id: { $in: courseIds } }).populate('facultyId', 'name email role');
    const assignments = await Assignment.find({ courseId: { $in: courseIds } });
    const quizzes = await Quiz.find({ courseId: { $in: courseIds } });
    const attendance = await Attendance.find({ studentId: childId });
    const submissions = await Submission.find({ studentId: childId });
    const quizAttempts = await QuizAttempt.find({ studentId: childId });
    const announcements = await Announcement.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'code title')
      .sort({ date: -1, createdAt: -1 });

    const fees = await Fee.find({ studentId: childId });
    const messages = await Message.find({ studentId: childId }).sort({ date: -1 });
    const notifications = await Notification.find({ userId: req.user.id });
    
    const academicRecords = await require('../models/schemas').AcademicRecord.find({ studentId: childId });

    res.json({
      success: true,
      child: {
        id: child._id,
        name: child.name,
        rollNo: child.studentId || child.childRoll,
        department: child.department,
        semester: child.semester,
        cgpa: child.cgpa
      },
      enrollments: childEnrolls,
      courses,
      assignments,
      quizzes,
      attendance,
      submissions,
      quizAttempts,
      announcements,
      fees,
      messages,
      notifications,
      academicRecords
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
