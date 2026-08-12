const User = require('../models/User');
const Course = require('../models/Course');

const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return; // Prevent duplicate seeding

    console.log('Seeding initial system data...');

    const admin = await User.create({ name: 'Global Administrator', email: 'admin@bvrit.ac.in', password: 'admin123', role: 'admin' });
    const faculty = await User.create({ name: 'Dr. Alistair Smith', email: 'faculty@bvrit.ac.in', password: 'faculty123', role: 'faculty' });
    const student = await User.create({ name: 'Alexander Mercer', email: 'student@bvrit.ac.in', password: 'student123', role: 'student' });
    const parent = await User.create({ name: 'David Mercer', email: 'parent@bvrit.ac.in', password: 'parent123', role: 'parent', childId: student._id });

    await Course.create([
      { code: 'CS-101', title: 'Intro to Neural Networks', desc: 'Explore AI fundamentals and optimization algorithms.', facultyId: faculty._id },
      { code: 'DB-303', title: 'Database Systems & SQL', desc: 'Master relational schema designs and query scripting.', facultyId: faculty._id }
    ]);

    console.log('Initial Database Seeding Complete.');
  } catch (err) {
    console.error('Seeding Error:', err.message);
  }
};

module.exports = seedInitialData;