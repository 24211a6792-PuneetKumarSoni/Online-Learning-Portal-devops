const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pathshala_jwt_super_secret_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @route POST /api/auth/register (Student & Faculty only)
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, studentId, department } = req.body;

    if (role === 'parent') {
      return res.status(400).json({
        success: false,
        message: 'Parent self-registration is not allowed. Parents can sign in directly using Student Roll Number and Mobile Number.'
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const userData = {
      name: name.trim(),
      email: cleanEmail,
      password,
      role: role === 'faculty' ? 'faculty' : 'student',
      studentId: studentId ? studentId.trim() : null,
      department: department ? department.trim() : null
    };

    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/auth/parent-login
router.post('/parent-login', async (req, res, next) => {
  try {
    const { studentRollNumber, mobileNumber } = req.body;

    if (!studentRollNumber || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Student Roll Number and registered Mobile Number'
      });
    }

    const roll = studentRollNumber.trim();
    const phone = mobileNumber.trim();

    if (phone.length < 7) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid mobile number'
      });
    }

    // 1. Locate student by studentId or email prefix
    const student = await User.findOne({
      role: 'student',
      $or: [
        { studentId: { $regex: new RegExp(`^${roll}$`, 'i') } },
        { email: { $regex: new RegExp(`^${roll}`, 'i') } }
      ]
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student record found with Roll Number "${roll}". Please verify.`
      });
    }

    // 2. Find or create linked parent user
    let parent = await User.findOne({
      role: 'parent',
      $or: [{ phone: phone }, { mobileNumber: phone }],
      childId: student._id
    });

    if (!parent) {
      parent = await User.findOne({
        role: 'parent',
        $or: [{ phone: phone }, { mobileNumber: phone }]
      });

      if (parent) {
        parent.childId = student._id;
        parent.childRoll = student.studentId || roll;
        await parent.save();
      } else {
        const studentPrefix = student.email.split('@')[0];
        const uniqueSuffix = phone.slice(-4) || '0000';
        let parentEmail = `parent.${studentPrefix}.${uniqueSuffix}@bvrit.ac.in`.toLowerCase();

        const existingEmail = await User.findOne({ email: parentEmail });
        if (existingEmail) {
          parentEmail = `parent.${studentPrefix}.${Date.now()}@bvrit.ac.in`.toLowerCase();
        }

        parent = await User.create({
          name: `${student.name}'s Parent`,
          email: parentEmail,
          password: `parent_auth_${phone}`,
          role: 'parent',
          phone: phone,
          childRoll: student.studentId || roll,
          childId: student._id
        });
      }
    }

    const token = generateToken(parent._id);
    res.json({
      success: true,
      token,
      user: {
        id: parent._id,
        name: parent.name,
        email: parent.email,
        role: 'parent',
        phone: parent.phone,
        childRoll: student.studentId || roll,
        childId: student._id,
        childName: student.name
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role, studentRollNumber, mobileNumber } = req.body;

    // Handle Parent Login via /login endpoint as well
    if (role === 'parent' || (studentRollNumber && mobileNumber)) {
      const roll = (studentRollNumber || '').trim();
      const phone = (mobileNumber || '').trim();

      if (!roll || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Please provide both Student Roll Number and registered Mobile Number'
        });
      }

      const student = await User.findOne({
        role: 'student',
        $or: [
          { studentId: { $regex: new RegExp(`^${roll}$`, 'i') } },
          { email: { $regex: new RegExp(`^${roll}`, 'i') } }
        ]
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: `No student record found with Roll Number "${roll}". Please verify.`
        });
      }

      let parent = await User.findOne({
        role: 'parent',
        phone: phone,
        childId: student._id
      });

      if (!parent) {
        parent = await User.findOne({ role: 'parent', phone: phone });
        if (parent) {
          parent.childId = student._id;
          parent.childRoll = student.studentId || roll;
          await parent.save();
        } else {
          const studentPrefix = student.email.split('@')[0];
          const uniqueSuffix = phone.slice(-4) || '0000';
          let parentEmail = `parent.${studentPrefix}.${uniqueSuffix}@bvrit.ac.in`.toLowerCase();
          const existingEmail = await User.findOne({ email: parentEmail });
          if (existingEmail) {
            parentEmail = `parent.${studentPrefix}.${Date.now()}@bvrit.ac.in`.toLowerCase();
          }

          parent = await User.create({
            name: `${student.name}'s Parent`,
            email: parentEmail,
            password: `parent_auth_${phone}`,
            role: 'parent',
            phone: phone,
            childRoll: student.studentId || roll,
            childId: student._id
          });
        }
      }

      const token = generateToken(parent._id);
      return res.json({
        success: true,
        token,
        user: {
          id: parent._id,
          name: parent.name,
          email: parent.email,
          role: 'parent',
          phone: parent.phone,
          childRoll: student.studentId || roll,
          childId: student._id,
          childName: student.name
        }
      });
    }

    // Student and Faculty Login (Email + Password)
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ success: false, message: `Access denied. Selected role does not match.` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        childId: user.childId
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email, role, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email and new password' });
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const query = { email: email.toLowerCase().trim() };
    if (role) {
      query.role = role;
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered user found with these details' });
    }

    user.password = newPassword.trim();
    await user.save();

    res.json({
      success: true,
      message: 'Password has been successfully updated. You can now login.'
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/auth/profile
router.get('/profile', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        childId: user.childId
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route PUT /api/auth/profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (password && password.trim().length >= 6) {
      user.password = password.trim();
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        childId: user.childId
      }
    });
  } catch (err) {
    next(err);
  }
});

// @route GET /api/auth/users
router.get('/users', protect, async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter).select('-password').sort({ name: 1 });
    res.json({
      success: true,
      count: users.length,
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        studentId: u.studentId,
        department: u.department,
        phone: u.phone,
        childId: u.childId
      }))
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;