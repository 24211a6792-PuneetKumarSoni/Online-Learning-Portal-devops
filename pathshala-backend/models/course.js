const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  title: { type: String, required: true, trim: true },
  desc: { type: String, required: true, trim: true },
  duration: { type: String, default: '8 Weeks', trim: true },
  category: { type: String, default: 'General', trim: true },
  resources: { type: String, default: '' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);