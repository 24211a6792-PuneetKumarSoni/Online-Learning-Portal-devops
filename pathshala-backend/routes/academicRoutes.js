const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Course = require('../models/Course');
const { 
  Enrollment, Assignment, Submission, Quiz, 
  QuizAttempt, Attendance, Material, Video, Notification 
} = require('../models/Schemas');

const router = express.Router();

// Get enrolled courses for student
router.get('/student/courses', protect, authorize('student'), async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id }).populate({
      path: 'courseId',
      populate: { path: 'facultyId', select: 'name email' }
    });
    res.json({ success: true, courses: enrollments.map(e => e.courseId) });
  } catch (err) { next(err); }
});

// Submit Homework
router.post('/student/submissions', protect, authorize('student'), async (req, res, next) => {
  try {
    const { assignmentId, courseId, content } = req.body;
    const submission = await Submission.create({
      assignmentId, courseId, studentId: req.user.id, content
    });
    res.status(201).json({ success: true, submission });
  } catch (err) { next(err); }
});

// Take Quiz
router.post('/student/quizzes/attempt', protect, authorize('student'), async (req, res, next) => {
  try {
    const { quizId, courseId, answers } = req.body;
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && Number(answers[idx]) === q.correct) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const attempt = await QuizAttempt.create({ quizId, courseId, studentId: req.user.id, score });

    res.status(201).json({ success: true, score, attempt });
  } catch (err) { next(err); }
});

module.exports = router;