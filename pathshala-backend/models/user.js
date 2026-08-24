const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9_.+-]+@bvrit\.ac\.in$/i, 'Email must belong to @bvrit.ac.in domain']
  },
  password: { type: String, required: [true, 'Password is required'], minlength: 6 },
  role: {
    type: String,
    enum: ['student', 'parent', 'faculty', 'admin'],
    default: 'student'
  },
  studentId: { type: String, trim: true, default: null },
  facultyId: { type: String, trim: true, default: null },
  department: { type: String, trim: true, default: null },
  semester: { type: String, trim: true, default: null },
  cgpa: { type: Number, default: null },
  phone: { type: String, trim: true, default: null },
  mobileNumber: { type: String, trim: true, default: null },
  childRoll: { type: String, trim: true, default: null },
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// Corrected Async Hook (removed 'next' parameter)
UserSchema.pre('save', async function () {
  // Plaintext password storage (no hashing)
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return candidatePassword === this.password;
};

module.exports = mongoose.model('User', UserSchema);