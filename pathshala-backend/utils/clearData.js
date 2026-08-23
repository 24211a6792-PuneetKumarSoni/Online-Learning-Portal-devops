require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
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
  Notification
} = require('../models/Schemas');

const clearAllData = async () => {
  try {
    await connectDB();
    console.log('Clearing all collections in database...');

    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
      Announcement.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      Quiz.deleteMany({}),
      QuizAttempt.deleteMany({}),
      Attendance.deleteMany({}),
      Fee.deleteMany({}),
      Message.deleteMany({}),
      Material.deleteMany({}),
      Video.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('Successfully removed all dummy and demo data. Database is clean and ready for real data.');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing data:', err);
    process.exit(1);
  }
};

clearAllData();
