const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Course = require('../models/course');
const {
  Enrollment,
  Assignment,
  Submission,
  Quiz,
  QuizAttempt,
  Attendance,
  Material,
  Video,
  Notification
} = require('../models/schemas');

const router = express.Router();

// Get enrolled courses for student
router.get('/student/courses', protect, authorize('student', 'admin'), async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id }).populate({
      path: 'courseId',
      populate: { path: 'facultyId', select: 'name email' }
    });
    res.json({ success: true, courses: enrollments.map(e => e.courseId).filter(Boolean) });
  } catch (err) {
    next(err);
  }
});

// Submit Homework
router.post('/student/submissions', protect, authorize('student', 'admin'), async (req, res, next) => {
  try {
    const { assignmentId, courseId, content } = req.body;
    const submission = await Submission.create({
      assignmentId,
      courseId,
      studentId: req.user.id,
      content,
      submittedAt: new Date().toISOString().split('T')[0]
    });
    res.status(201).json({ success: true, submission });
  } catch (err) {
    next(err);
  }
});

// Take Quiz
router.post('/student/quizzes/attempt', protect, authorize('student', 'admin'), async (req, res, next) => {
  try {
    const { quizId, courseId, answers, score: manualScore } = req.body;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    let score;
    if (manualScore !== undefined && typeof manualScore === 'number') {
      score = Math.max(0, Math.min(100, Math.round(manualScore)));
    } else if (Array.isArray(answers)) {
      let correctCount = 0;
      quiz.questions.forEach((q, idx) => {
        if (answers[idx] !== undefined && Number(answers[idx]) === q.correct) {
          correctCount++;
        }
      });
      score = quiz.questions.length > 0 ? Math.round((correctCount / quiz.questions.length) * 100) : 100;
    } else {
      score = 100;
    }

    const attempt = await QuizAttempt.create({
      quizId,
      courseId: courseId || quiz.courseId,
      studentId: req.user.id,
      score,
      date: new Date().toISOString().split('T')[0]
    });

    res.status(201).json({ success: true, score, attempt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;