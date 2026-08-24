const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Course = require('../models/course');
const User = require('../models/user');
const {
  Enrollment,
  Notification,
  Assignment,
  Submission,
  Quiz,
  QuizAttempt,
  Attendance,
  Material,
  Video,
  Announcement
} = require('../models/schemas');

const router = express.Router();

// @route GET /api/courses
// @desc Get all courses or filter by facultyId
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.facultyId) {
      filter.facultyId = req.query.facultyId;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const courses = await Course.find(filter)
      .populate('facultyId', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/courses/:id
// @desc Get single course details
router.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('facultyId', 'name email role');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({
      success: true,
      course
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/courses
// @desc Create course (Faculty or Admin) + auto-enroll all students & send notifications
router.post('/', protect, authorize('faculty', 'admin'), async (req, res, next) => {
  try {
    const { code, title, desc, duration, category, resources } = req.body;

    if (!code || !title || !desc) {
      return res.status(400).json({ success: false, message: 'Please provide course code, title, and description' });
    }

    const existing = await Course.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Course with code ${code} already exists` });
    }

    const course = await Course.create({
      code: code.toUpperCase().trim(),
      title: title.trim(),
      desc: desc.trim(),
      duration: duration ? duration.trim() : '8 Weeks',
      category: category ? category.trim() : 'General',
      resources: resources ? resources.trim() : '',
      facultyId: req.user.id
    });

    // Auto-enroll all registered students and send notifications
    const students = await User.find({ role: 'student' });
    const today = new Date().toISOString().split('T')[0];

    for (const stu of students) {
      await Enrollment.create({
        studentId: stu._id,
        courseId: course._id
      });

      await Notification.create({
        userId: stu._id,
        text: `New course published: ${course.code} - ${course.title}. Now available in your courses list.`,
        date: today,
        read: false
      });
    }

    const populatedCourse = await Course.findById(course._id).populate('facultyId', 'name email');

    res.status(201).json({
      success: true,
      message: `Course "${course.code}: ${course.title}" created and published!`,
      course: populatedCourse
    });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/courses/:id
// @desc Update course details (Faculty or Admin)
router.put('/:id', protect, authorize('faculty', 'admin'), async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Faculty can only edit their own courses unless Admin
    if (req.user.role === 'faculty' && course.facultyId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this course' });
    }

    const { code, title, desc, duration, category, resources } = req.body;

    if (code) course.code = code.toUpperCase().trim();
    if (title) course.title = title.trim();
    if (desc) course.desc = desc.trim();
    if (duration !== undefined) course.duration = duration.trim();
    if (category !== undefined) course.category = category.trim();
    if (resources !== undefined) course.resources = resources.trim();

    await course.save();

    const populatedCourse = await Course.findById(course._id).populate('facultyId', 'name email');

    res.json({
      success: true,
      message: `Course "${course.code}: ${course.title}" updated successfully`,
      course: populatedCourse
    });
  } catch (err) {
    next(err);
  }
});

// @route DELETE /api/courses/:id
// @desc Delete course and cascade delete associated data (Faculty or Admin)
router.delete('/:id', protect, authorize('faculty', 'admin'), async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role === 'faculty' && course.facultyId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    const courseId = course._id;

    // Cascade delete associated records
    await Enrollment.deleteMany({ courseId });
    await Assignment.deleteMany({ courseId });
    await Submission.deleteMany({ courseId });
    await Quiz.deleteMany({ courseId });
    await QuizAttempt.deleteMany({ courseId });
    await Attendance.deleteMany({ courseId });
    await Material.deleteMany({ courseId });
    await Video.deleteMany({ courseId });
    await Announcement.deleteMany({ courseId });

    await Course.findByIdAndDelete(courseId);

    res.json({
      success: true,
      message: `Course "${course.code}" and all associated data permanently deleted`
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/courses/:id/roster
// @desc Get enrolled students for a course (Faculty or Admin)
router.get('/:id/roster', protect, authorize('faculty', 'admin'), async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ courseId: req.params.id }).populate('studentId', 'name email');
    res.json({
      success: true,
      roster: enrollments.map(e => e.studentId).filter(Boolean)
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/courses/:id/parents
// @desc Get parents of enrolled students for a course (Faculty or Admin)
router.get('/:id/parents', protect, authorize('faculty', 'admin'), async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ courseId: req.params.id });
    const studentIds = enrolls = enrollments.map(e => e.studentId);

    const parents = await User.find({
      role: 'parent',
      childId: { $in: studentIds }
    }).populate('childId', 'name email');

    res.json({
      success: true,
      parents: parents.map(p => ({
        id: p._id,
        name: p.name,
        email: p.email,
        child: p.childId ? { id: p.childId._id, name: p.childId.name, email: p.childId.email } : null
      }))
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
