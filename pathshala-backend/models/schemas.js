const mongoose = require('mongoose');

// Enrollment
const EnrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }
}, { timestamps: true });

// Announcement
const AnnouncementSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  text: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

// Assignment
const AssignmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  due: { type: String, required: true }
}, { timestamps: true });

// Submission
const SubmissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  submittedAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
  grade: { type: Number, default: null },
  feedback: { type: String, default: null }
}, { timestamps: true });

// Quiz
const QuizSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  questions: [{
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correct: { type: Number, required: true }
  }]
}, { timestamps: true });

// Quiz Attempt
const QuizAttemptSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  score: { type: Number, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

// Attendance
const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true }
}, { timestamps: true });

// Fee
const FeeSchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  due: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  receipt: { type: String, default: null }
}, { timestamps: true });

// Message
const MessageSchema = new mongoose.Schema({
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

// Material (PDF)
const MaterialSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  type: { type: String, default: 'PDF' },
  link: { type: String, required: true }
}, { timestamps: true });

// Video
const VideoSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  link: { type: String, required: true }
}, { timestamps: true });

// Notification
const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  read: { type: Boolean, default: false }
}, { timestamps: true });

// AcademicRecord
const AcademicRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: String, required: true },
  sgpa: { type: Number, required: true },
  cleared: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = {
  Enrollment: mongoose.model('Enrollment', EnrollmentSchema),
  Announcement: mongoose.model('Announcement', AnnouncementSchema),
  Assignment: mongoose.model('Assignment', AssignmentSchema),
  Submission: mongoose.model('Submission', SubmissionSchema),
  Quiz: mongoose.model('Quiz', QuizSchema),
  QuizAttempt: mongoose.model('QuizAttempt', QuizAttemptSchema),
  Attendance: mongoose.model('Attendance', AttendanceSchema),
  Fee: mongoose.model('Fee', FeeSchema),
  Message: mongoose.model('Message', MessageSchema),
  Material: mongoose.model('Material', MaterialSchema),
  Video: mongoose.model('Video', VideoSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  AcademicRecord: mongoose.model('AcademicRecord', AcademicRecordSchema)
};